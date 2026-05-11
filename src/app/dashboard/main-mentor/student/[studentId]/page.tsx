import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { StudentDetailView } from './student-detail-view'
import { AssessmentRow, StudentRow } from '@/types/types'

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: student },
    { data: assessments },
  ] = await Promise.all([
    supabaseAdmin.from('students').select('*, mentor:mentors(id, name, email, pool_no)').eq('id', studentId).single(),
    supabaseAdmin.from('assessments').select('*').eq('student_id', studentId).returns<AssessmentRow[]>(),
  ])

  if (!student) return <div>Student not found.</div>

  const assessmentsList = assessments || []

  // Per-course accuracy
  const courseMap: Record<string, { sum: number; count: number }> = {}
  const moduleMap: Record<string, { sum: number; count: number; course: string; duration: number; attempts: number; date: string }> = {}

  assessmentsList.forEach((a) => {
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

  // Course → modules grouping
  const courseModules: Record<string, typeof moduleAccuracy> = {}
  moduleAccuracy.forEach(m => {
    if (!courseModules[m.course]) courseModules[m.course] = []
    courseModules[m.course].push(m)
  })

  const totalAvgAcc = assessmentsList.length > 0
    ? Math.round(assessmentsList.reduce((s: number, a) => s + Number(a.accuracy), 0) / assessmentsList.length * 10) / 10
    : 0

  const totalTime = assessmentsList.reduce((s: number, a) => s + Number(a.total_duration || 0), 0)
  const totalAttempts = assessmentsList.reduce((s: number, a) => s + Number(a.attempt_count || 0), 0)

  return (
    <StudentDetailView
      student={{
        id: student.id,
        name: student.name,
        rollNo: student.roll_no,
        branch: student.branch || 'CSE',
        college: student.college || 'N/A',
        technology: student.technology || 'N/A',
        gender: student.gender || 'N/A',
        email: student.email || 'N/A',
      }}
      mentor={student.mentor ? {
        name: student.mentor.name,
        email: student.mentor.email,
        poolNo: student.mentor.pool_no,
      } : null}
      stats={{
        avgAccuracy: totalAvgAcc,
        totalModules: Object.keys(moduleMap).length,
        totalTime,
        totalAttempts,
      }}
      courseAccuracy={courseAccuracy}
      moduleAccuracy={moduleAccuracy}
      courseModules={courseModules}
    />
  )
}
