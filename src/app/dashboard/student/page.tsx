import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StudentDashboardView } from './student-view'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const email = user.email
  if (!email) redirect('/login')

  const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Fetch student, mentor, and assessments
  const [
    { data: studentRecord, error },
    { data: assessments },
  ] = await Promise.all([
    supabaseAdmin.from('students').select('*, mentor:mentors(*)').eq('email', email).single(),
    supabaseAdmin.from('assessments').select('*').eq('student_id', email ? undefined : undefined) // will be fetched correctly below
  ])

  // Need to fetch properly. Let's do it sequentially to get studentId first.
  const { data: studentData, error: studentError } = await supabaseAdmin
    .from('students')
    .select('*, mentor:mentors(*)')
    .eq('email', email)
    .single()

  if (studentError || !studentData) {
    return <div>Error loading student data.</div>
  }

  const { data: assessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .eq('student_id', studentData.id)

  const branch = studentData.branch || 'CSE'
  const mappedStudent = {
    name: studentData.name || 'Unknown Student',
    rollNo: studentData.roll_no || 'N/A',
    branch: branch as "CSE" | "ECE" | "Mech" | "Civil" | "IT",
    year: '2nd Year', // Mapped statically for now since DB doesn't have year
    cgpa: 8.5, // Mapped statically for now since DB doesn't have cgpa
    email: studentData.email || email
  }

  const mappedMentor = studentData.mentor ? {
    name: studentData.mentor.name || 'Unknown Mentor',
    department: 'Computer Science',
    email: studentData.mentor.email || ''
  } : {
    name: 'No Mentor Assigned',
    department: 'N/A',
    email: 'Contact your admin'
  }

  const assessmentsList = assessmentsData || []

  // Per-course accuracy
  const courseMap: Record<string, { sum: number; count: number }> = {}
  const moduleMap: Record<string, { sum: number; count: number; course: string; duration: number; attempts: number; date: string }> = {}

  assessmentsList.forEach((a: any) => {
    const acc = Number(a.accuracy)
    if (a.course_name) {
      if (!courseMap[a.course_name]) courseMap[a.course_name] = { sum: 0, count: 0 }
      courseMap[a.course_name].sum += acc
      courseMap[a.course_name].count += 1
    }
    if (a.module_name) {
      if (!moduleMap[a.module_name]) moduleMap[a.module_name] = { sum: 0, count: 0, course: a.course_name || '', duration: 0, attempts: 0, date: a.assessment_date || '' }
      moduleMap[a.module_name].sum += acc
      moduleMap[a.module_name].count += 1
      moduleMap[a.module_name].duration += Number(a.total_duration || 0)
      moduleMap[a.module_name].attempts += Number(a.attempt_count || 0)
    }
  })

  const courseAccuracy = Object.entries(courseMap).map(([name, { sum, count }]) => ({
    subject: name, score: Math.round((sum / count) * 10) / 10, fullMark: 100,
  }))

  const moduleAccuracy = Object.entries(moduleMap)
    .map(([name, { sum, count, course, duration, attempts, date }]) => ({
      name, accuracy: Math.round((sum / count) * 10) / 10, course,
      avgDuration: Math.round(duration / count), totalAttempts: attempts, date,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)

  const analytics = {
    courseAccuracy,
    moduleAccuracy,
  }

  return <StudentDashboardView student={mappedStudent} mentor={mappedMentor} analytics={analytics} />
}
