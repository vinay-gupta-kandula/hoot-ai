import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { MentorDetailView } from './mentor-detail-view'
import { AssessmentRow, StudentRow, MentorRow } from '@/types/types'

export default async function MentorDetailPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch mentor + students + assessments in parallel
  const [
    { data: mentor },
    { data: students },
    { data: assessments },
  ] = await Promise.all([
    supabaseAdmin.from('mentors').select('*').eq('id', mentorId).single<MentorRow>(),
    supabaseAdmin.from('students').select('*').eq('mentor_id', mentorId).returns<StudentRow[]>(),
    supabaseAdmin.from('assessments').select('*').eq('mentor_id', mentorId).returns<AssessmentRow[]>(),
  ])

  if (!mentor) return <div>Mentor not found.</div>

  const studentsList = students || []
  const assessmentsList = assessments || []

  // Compute per-course avg accuracy
  const courseMap: Record<string, { sum: number; count: number }> = {}
  const moduleMap: Record<string, { sum: number; count: number; course: string; duration: number; attempts: number }> = {}
  const studentAccMap: Record<string, { sum: number; count: number }> = {}

  assessmentsList.forEach((a) => {
    const acc = Number(a.accuracy)
    if (a.course_name) {
      if (!courseMap[a.course_name]) courseMap[a.course_name] = { sum: 0, count: 0 }
      courseMap[a.course_name].sum += acc
      courseMap[a.course_name].count += 1
    }
    if (a.module_name) {
      if (!moduleMap[a.module_name]) moduleMap[a.module_name] = { sum: 0, count: 0, course: a.course_name || '', duration: 0, attempts: 0 }
      moduleMap[a.module_name].sum += acc
      moduleMap[a.module_name].count += 1
      moduleMap[a.module_name].duration += Number(a.total_duration || 0)
      moduleMap[a.module_name].attempts += Number(a.attempt_count || 0)
    }
    if (a.student_id) {
      if (!studentAccMap[a.student_id]) studentAccMap[a.student_id] = { sum: 0, count: 0 }
      studentAccMap[a.student_id].sum += acc
      studentAccMap[a.student_id].count += 1
    }
  })

  const courseAccuracy = Object.entries(courseMap).map(([name, { sum, count }]) => ({
    subject: name, score: Math.round((sum / count) * 10) / 10, fullMark: 100,
  }))

  const moduleAccuracy = Object.entries(moduleMap)
    .map(([name, { sum, count, course, duration, attempts }]) => ({
      name, accuracy: Math.round((sum / count) * 10) / 10, course,
      avgDuration: Math.round(duration / count), totalAttempts: attempts,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)

  // Distributions
  const branchDist: Record<string, number> = {}
  const genderDist: Record<string, number> = {}
  const techDist: Record<string, number> = {}

  studentsList.forEach((s) => {
    if (s.branch) branchDist[s.branch] = (branchDist[s.branch] || 0) + 1
    if (s.gender) genderDist[s.gender] = (genderDist[s.gender] || 0) + 1
    if (s.technology) techDist[s.technology] = (techDist[s.technology] || 0) + 1
  })

  // Student leaderboard
  const studentLeaderboard = studentsList.map((s) => {
    const acc = studentAccMap[s.id]
    return {
      id: s.id,
      name: s.name || 'Unknown',
      rollNo: s.roll_no || 'N/A',
      branch: s.branch || 'CSE',
      avgAccuracy: acc ? Math.round((acc.sum / acc.count) * 10) / 10 : 0,
      totalAssessments: acc?.count || 0,
    }
  }).sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  // Student x course heatmap
  const studentCourseMap: Record<string, Record<string, { sum: number; count: number }>> = {}
  assessmentsList.forEach((a) => {
    if (!a.student_id || !a.course_name) return
    if (!studentCourseMap[a.student_id]) studentCourseMap[a.student_id] = {}
    if (!studentCourseMap[a.student_id][a.course_name])
      studentCourseMap[a.student_id][a.course_name] = { sum: 0, count: 0 }
    studentCourseMap[a.student_id][a.course_name].sum += Number(a.accuracy)
    studentCourseMap[a.student_id][a.course_name].count += 1
  })

  const courses = ['Listening', 'Reading', 'Speaking', 'Writing']
  const heatmapRows = studentLeaderboard.slice(0, 30).map(s => s.name)
  const heatmapData = studentLeaderboard.slice(0, 30).map(s =>
    courses.map(c => {
      const e = studentCourseMap[s.id]?.[c]
      return e ? Math.round((e.sum / e.count) * 10) / 10 : 0
    })
  )

  const totalAvgAcc = assessmentsList.length > 0
    ? Math.round(assessmentsList.reduce((s: number, a) => s + Number(a.accuracy), 0) / assessmentsList.length * 10) / 10
    : 0

  return (
    <MentorDetailView
      mentor={{ id: mentor.id, name: mentor.name, email: mentor.email, poolNo: mentor.pool_no }}
      stats={{
        totalStudents: studentsList.length,
        avgAccuracy: totalAvgAcc,
        totalAssessments: assessmentsList.length,
        activeModules: Object.keys(moduleMap).length,
      }}
      courseAccuracy={courseAccuracy}
      moduleAccuracy={moduleAccuracy}
      studentLeaderboard={studentLeaderboard}
      distributions={{ branchDist, genderDist, techDist }}
      heatmap={{ rows: heatmapRows, cols: courses, data: heatmapData }}
    />
  )
}
