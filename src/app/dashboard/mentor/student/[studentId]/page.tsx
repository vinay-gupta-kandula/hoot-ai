import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StudentDetailView } from './student-detail-view'

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
}

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify mentor owns this student
  const { data: mentorData } = await supabaseAdmin
    .from('mentors')
    .select('id, name')
    .eq('email', user.email)
    .single<MentorRow>()

  if (!mentorData) redirect('/login')

  const { data: studentData } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', studentId)
    .eq('mentor_id', mentorData.id)
    .single<StudentRow>()

  if (!studentData) notFound()

  const { data: assessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .eq('student_id', studentId)
    .returns<AssessmentRow[]>()

  const assessments = assessmentsData || []

  const student = {
    id: studentData.id,
    name: studentData.name || 'Unknown',
    rollNo: studentData.roll_no || 'N/A',
    branch: studentData.branch || 'CSE',
    college: studentData.college || 'N/A',
    technology: studentData.technology || 'N/A',
    gender: studentData.gender || 'UNKNOWN',
  }

  // Course accuracy for this student
  const courseMap: Record<string, { sum: number; count: number }> = {}
  const moduleMap: Record<string, { sum: number; count: number; attempts: number; duration: number }> = {}
  const timelineMap: Record<string, number> = {}
  const attemptDist: Record<string, number> = {}

  assessments.forEach((a) => {
    if (a.course_name && a.accuracy != null) {
      if (!courseMap[a.course_name]) courseMap[a.course_name] = { sum: 0, count: 0 }
      courseMap[a.course_name].sum += a.accuracy
      courseMap[a.course_name].count += 1
    }
    if (a.module_name && a.accuracy != null) {
      if (!moduleMap[a.module_name]) moduleMap[a.module_name] = { sum: 0, count: 0, attempts: 0, duration: 0 }
      moduleMap[a.module_name].sum += a.accuracy
      moduleMap[a.module_name].count += 1
      moduleMap[a.module_name].attempts += a.attempt_count || 0
      moduleMap[a.module_name].duration += a.total_duration || 0
    }
    if (a.assessment_date) {
      timelineMap[a.assessment_date] = (timelineMap[a.assessment_date] || 0) + 1
    }
    if (a.module_name) {
      attemptDist[a.module_name] = (attemptDist[a.module_name] || 0) + (a.attempt_count || 0)
    }
  })

  const courseAccuracy = Object.entries(courseMap).map(([subject, { sum, count }]) => ({
    subject, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, fullMark: 100,
  }))

  const moduleAccuracy = Object.entries(moduleMap)
    .map(([name, { sum, count, attempts, duration }]) => ({
      name, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, attempts, duration,
    }))
    .sort((a, b) => b.score - a.score)

  const timeline = Object.entries(timelineMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({ date: date.slice(5), count }))

  const attemptDistribution = Object.entries(attemptDist)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const totalAssessments = assessments.length
  const avgAccuracy = assessments.length > 0
    ? Math.round((assessments.reduce((s, a) => s + (a.accuracy || 0), 0) / assessments.length) * 10) / 10
    : 0
  const totalDuration = assessments.reduce((s, a) => s + (a.total_duration || 0), 0)
  const totalAttempts = assessments.reduce((s, a) => s + (a.attempt_count || 0), 0)

  const analytics = {
    courseAccuracy,
    moduleAccuracy,
    timeline,
    attemptDistribution,
    stats: { totalAssessments, avgAccuracy, totalDuration, totalAttempts },
  }

  return <StudentDetailView student={student} analytics={analytics} mentorName={mentorData.name || 'Mentor'} />
}