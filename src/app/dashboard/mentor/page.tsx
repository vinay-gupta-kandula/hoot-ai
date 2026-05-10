import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { MentorDashboardView } from './mentor-view'

interface AssessmentRow {
  id: string
  student_id: string | null
  mentor_id: string | null
  module_name: string | null
  course_name: string | null
  accuracy: number | null
  total_duration: number | null
  attempt_count: number | null
  assessment_date: string | null
  created_at: string
}

interface StudentRow {
  id: string
  name: string | null
  roll_no: string | null
  branch: string | null
  college: string | null
  technology: string | null
  gender: string | null
  mentor_id: string | null
  created_at: string
}

interface MentorRow {
  id: string
  name: string | null
  email: string | null
  pool_no: number | null
  main_mentor_id: string | null
  created_at: string
  students: StudentRow[] | null
}

export default async function MentorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: mentorData, error: mentorError } = await supabaseAdmin
    .from('mentors')
    .select('*, students(*)')
    .eq('email', user.email)
    .single<MentorRow>()

  if (mentorError || !mentorData) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Error loading mentor data.
      </div>
    )
  }

  const { data: assessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .eq('mentor_id', mentorData.id)
    .returns<AssessmentRow[]>()

  const mappedMentor = {
    id: mentorData.id,
    name: mentorData.name || 'Unknown Mentor',
    department: 'Engineering',
    email: mentorData.email || user.email,
    poolNo: mentorData.pool_no ?? undefined,
  }

  const studentsList = mentorData.students || []
  const assessmentsList = assessmentsData || []

  // Per-student accuracy
  const studentAccMap: Record<string, { sum: number; count: number; name: string; rollNo: string; branch: string; gender: string }> = {}
  studentsList.forEach((s) => {
    studentAccMap[s.id] = {
      sum: 0, count: 0,
      name: s.name || 'Unknown',
      rollNo: s.roll_no || 'N/A',
      branch: s.branch || 'CSE',
      gender: s.gender || 'UNKNOWN',
    }
  })

  assessmentsList.forEach((a) => {
    if (!a.student_id || a.accuracy == null) return
    if (studentAccMap[a.student_id]) {
      studentAccMap[a.student_id].sum += a.accuracy
      studentAccMap[a.student_id].count += 1
    }
  })

  const mappedStudents = studentsList.map((s) => {
    const acc = studentAccMap[s.id]
    return {
      id: s.id,
      name: s.name || 'Unknown Student',
      rollNo: s.roll_no || 'N/A',
      branch: (s.branch || 'CSE') as 'CSE' | 'ECE' | 'Mech' | 'Civil' | 'IT',
      college: s.college || 'N/A',
      technology: s.technology || 'N/A',
      gender: (s.gender || 'UNKNOWN') as 'MALE' | 'FEMALE' | 'UNKNOWN',
      year: '2nd Year',
      cgpa: acc && acc.count > 0 ? Math.round((acc.sum / acc.count) * 10) / 10 : 0,
    }
  })

  // Course accuracy
  const courseMap: Record<string, { sum: number; count: number }> = {}
  assessmentsList.forEach((a) => {
    if (!a.course_name || a.accuracy == null) return
    if (!courseMap[a.course_name]) courseMap[a.course_name] = { sum: 0, count: 0 }
    courseMap[a.course_name].sum += a.accuracy
    courseMap[a.course_name].count += 1
  })
  const courseAccuracy = Object.entries(courseMap).map(([name, { sum, count }]) => ({
    subject: name, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, fullMark: 100,
  }))

  // Module accuracy
  const moduleMap: Record<string, { sum: number; count: number }> = {}
  assessmentsList.forEach((a) => {
    if (!a.module_name || a.accuracy == null) return
    if (!moduleMap[a.module_name]) moduleMap[a.module_name] = { sum: 0, count: 0 }
    moduleMap[a.module_name].sum += a.accuracy
    moduleMap[a.module_name].count += 1
  })
  const moduleAccuracy = Object.entries(moduleMap)
    .map(([name, { sum, count }]) => ({ name, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  // Student ranking
  const studentRanking = mappedStudents
    .map((s) => ({ name: s.name, accuracy: s.cgpa, rollNo: s.rollNo, id: s.id }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 15)

  // Accuracy distribution buckets
  const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 }
  mappedStudents.forEach((s) => {
    const a = s.cgpa
    if (a <= 20) buckets['0-20']++
    else if (a <= 40) buckets['21-40']++
    else if (a <= 60) buckets['41-60']++
    else if (a <= 80) buckets['61-80']++
    else buckets['81-100']++
  })
  const accuracyDistribution = Object.entries(buckets).map(([range, count]) => ({ range, count }))

  // Gender distribution
  const genderCounts: Record<string, number> = {}
  mappedStudents.forEach((s) => {
    genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1
  })
  const genderDistribution = Object.entries(genderCounts).map(([gender, count]) => ({ gender, count }))

  // Branch distribution
  const branchCounts: Record<string, number> = {}
  mappedStudents.forEach((s) => {
    branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1
  })
  const branchDistribution = Object.entries(branchCounts).map(([branch, count]) => ({ branch, count }))

  // Student × Module heatmap
  const studentModuleMap: Record<string, Record<string, { sum: number; count: number }>> = {}
  assessmentsList.forEach((a) => {
    if (!a.student_id || !a.module_name || a.accuracy == null) return
    if (!studentModuleMap[a.student_id]) studentModuleMap[a.student_id] = {}
    if (!studentModuleMap[a.student_id][a.module_name]) studentModuleMap[a.student_id][a.module_name] = { sum: 0, count: 0 }
    studentModuleMap[a.student_id][a.module_name].sum += a.accuracy
    studentModuleMap[a.student_id][a.module_name].count += 1
  })

  const moduleCounts: Record<string, number> = {}
  assessmentsList.forEach((a) => {
    if (a.module_name) moduleCounts[a.module_name] = (moduleCounts[a.module_name] || 0) + 1
  })
  const topModules = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map((m) => m[0])
  const topStudents = [...mappedStudents].sort((a, b) => b.cgpa - a.cgpa).slice(0, 20)

  const heatmapRows = topStudents.map((s) => s.name)
  const heatmapData = topStudents.map((s) =>
    topModules.map((m) => {
      const e = studentModuleMap[s.id]?.[m]
      return e && e.count > 0 ? Math.round((e.sum / e.count) * 10) / 10 : 0
    })
  )

  // Trend data (assessments per date)
  const dateMap: Record<string, number> = {}
  assessmentsList.forEach((a) => {
    if (!a.assessment_date) return
    const d = a.assessment_date
    dateMap[d] = (dateMap[d] || 0) + 1
  })
  const trendData = Object.entries(dateMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-14)
    .map(([date, count]) => ({ date: date.slice(5), count }))

  // Pool stats
  const totalStudents = mappedStudents.length
  const totalAssessments = assessmentsList.length
  const poolAvgAccuracy =
    assessmentsList.length > 0
      ? Math.round(
          (assessmentsList.reduce((sum, a) => sum + (a.accuracy || 0), 0) / assessmentsList.length) * 10
        ) / 10
      : 0

  const analytics = {
    courseAccuracy,
    moduleAccuracy,
    studentRanking,
    accuracyDistribution,
    genderDistribution,
    branchDistribution,
    heatmap: { rows: heatmapRows, cols: topModules, data: heatmapData },
    trendData,
    stats: { totalStudents, totalAssessments, poolAvgAccuracy },
  }

  return <MentorDashboardView mentor={mappedMentor} students={mappedStudents} analytics={analytics} />
}