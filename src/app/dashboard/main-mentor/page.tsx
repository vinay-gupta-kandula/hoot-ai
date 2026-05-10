import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { MainMentorDashboardView } from './main-mentor-view'
import type { MentorSummary, StudentWithMentor, MentorOption } from './main-mentor-view'

export default async function MainMentorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const email = user.email
  if (!email) redirect('/login')

  const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Verify main mentor
  const { data: mainMentorRecord, error } = await supabaseAdmin
    .from('main_mentors')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !mainMentorRecord) {
    return <div>Error loading main mentor data.</div>
  }

  // ── Parallel data fetching for performance ──
  const [
    { data: mentorsData },
    { data: studentsData },
    { count: totalStudents },
    { data: assessmentsRaw },
  ] = await Promise.all([
    supabaseAdmin.from('mentors').select('*, students(id)'),
    supabaseAdmin.from('students').select('*, mentor:mentors(id, name)'),
    supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('assessments').select('mentor_id, course_name, module_name, accuracy, student_id'),
  ])

  const mentorsList = mentorsData || []
  const allStudents = studentsData || []
  const assessments = assessmentsRaw || []

  // ── Compute distributions from student data ──
  const branchDist: Record<string, number> = {}
  const genderDist: Record<string, number> = {}
  const techDist: Record<string, number> = {}
  const collegeDist: Record<string, number> = {}

  allStudents.forEach((s: any) => {
    if (s.branch) branchDist[s.branch] = (branchDist[s.branch] || 0) + 1
    if (s.gender) genderDist[s.gender] = (genderDist[s.gender] || 0) + 1
    if (s.technology) techDist[s.technology] = (techDist[s.technology] || 0) + 1
    if (s.college) collegeDist[s.college] = (collegeDist[s.college] || 0) + 1
  })

  // ── Compute course-level avg accuracy ──
  const courseAccMap: Record<string, { sum: number; count: number }> = {}
  assessments.forEach((a: any) => {
    if (!a.course_name || a.accuracy == null) return
    if (!courseAccMap[a.course_name]) courseAccMap[a.course_name] = { sum: 0, count: 0 }
    courseAccMap[a.course_name].sum += Number(a.accuracy)
    courseAccMap[a.course_name].count += 1
  })
  const courseAccuracy = Object.entries(courseAccMap).map(([name, { sum, count }]) => ({
    subject: name,
    score: Math.round((sum / count) * 10) / 10,
    fullMark: 100,
  }))

  // ── Compute module-level avg accuracy ──
  const moduleAccMap: Record<string, { sum: number; count: number }> = {}
  assessments.forEach((a: any) => {
    if (!a.module_name || a.accuracy == null) return
    if (!moduleAccMap[a.module_name]) moduleAccMap[a.module_name] = { sum: 0, count: 0 }
    moduleAccMap[a.module_name].sum += Number(a.accuracy)
    moduleAccMap[a.module_name].count += 1
  })
  const moduleAccuracy = Object.entries(moduleAccMap)
    .map(([name, { sum, count }]) => ({ name, accuracy: Math.round((sum / count) * 10) / 10 }))
    .sort((a, b) => b.accuracy - a.accuracy)

  // ── Compute per-mentor per-course accuracy for heatmap ──
  const mentorCourseMap: Record<string, Record<string, { sum: number; count: number }>> = {}
  assessments.forEach((a: any) => {
    if (!a.mentor_id || !a.course_name || a.accuracy == null) return
    if (!mentorCourseMap[a.mentor_id]) mentorCourseMap[a.mentor_id] = {}
    if (!mentorCourseMap[a.mentor_id][a.course_name])
      mentorCourseMap[a.mentor_id][a.course_name] = { sum: 0, count: 0 }
    mentorCourseMap[a.mentor_id][a.course_name].sum += Number(a.accuracy)
    mentorCourseMap[a.mentor_id][a.course_name].count += 1
  })

  const courses = ['Listening', 'Reading', 'Speaking', 'Writing']
  const mentorIdToName: Record<string, string> = {}
  mentorsList.forEach((m: any) => { mentorIdToName[m.id] = m.name })

  const heatmapRows = mentorsList.map((m: any) => m.name || 'Unknown')
  const heatmapData = mentorsList.map((m: any) =>
    courses.map((c) => {
      const entry = mentorCourseMap[m.id]?.[c]
      return entry ? Math.round((entry.sum / entry.count) * 10) / 10 : 0
    })
  )

  // ── College avg accuracy ──
  const studentIdToCollege: Record<string, string> = {}
  allStudents.forEach((s: any) => { if (s.college) studentIdToCollege[s.id] = s.college })
  const collegeAccMap: Record<string, { sum: number; count: number }> = {}
  assessments.forEach((a: any) => {
    const college = studentIdToCollege[a.student_id]
    if (!college || a.accuracy == null) return
    if (!collegeAccMap[college]) collegeAccMap[college] = { sum: 0, count: 0 }
    collegeAccMap[college].sum += Number(a.accuracy)
    collegeAccMap[college].count += 1
  })
  const collegeAccuracy = Object.entries(collegeAccMap)
    .map(([name, { sum, count }]) => ({ name, accuracy: Math.round((sum / count) * 10) / 10 }))
    .sort((a, b) => b.accuracy - a.accuracy)

  // ── Build props ──
  const uniqueBranches = new Set(allStudents.map((s: any) => s.branch).filter(Boolean))

  const stats = {
    totalStudents: totalStudents || 0,
    totalMentors: mentorsList.length,
    branches: uniqueBranches.size || 1,
    avgCgpa: 8.2,
  }

  const mappedMentors: MentorSummary[] = mentorsList.map((m: any) => ({
    id: m.id,
    name: m.name || 'Unknown Mentor',
    department: 'CSE' as const,
    email: m.email || '',
    studentCount: m.students ? m.students.length : 0,
  }))

  const mentorOptions: MentorOption[] = mentorsList.map((m: any) => ({
    id: m.id,
    name: m.name || 'Unknown Mentor',
  }))

  const mappedStudents: StudentWithMentor[] = allStudents.map((s: any) => ({
    id: s.id,
    name: s.name || 'Unknown Student',
    rollNo: s.roll_no || 'N/A',
    branch: (s.branch || 'CSE') as "CSE" | "ECE" | "Mech" | "Civil" | "IT",
    mentorId: s.mentor_id || null,
    mentorName: s.mentor?.name || null,
  }))

  return (
    <MainMentorDashboardView
      stats={stats}
      mentors={mappedMentors}
      allStudents={mappedStudents}
      mentorOptions={mentorOptions}
      analytics={{
        branchDist,
        genderDist,
        techDist,
        collegeDist,
        courseAccuracy,
        moduleAccuracy,
        collegeAccuracy,
        heatmapRows,
        heatmapCols: courses,
        heatmapData,
      }}
    />
  )
}
