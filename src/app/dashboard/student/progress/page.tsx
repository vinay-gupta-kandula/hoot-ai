import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StudentProgressView } from './progress-view'

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

export default async function StudentProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: studentData } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('email', user.email)
    .single<StudentRow>()

  if (!studentData) redirect('/login')

  const { data: assessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .eq('student_id', studentData.id)
    .returns<AssessmentRow[]>()

  const assessments = assessmentsData || []

  // Fetch pool peers for comparison
  const { data: poolStudents } = await supabaseAdmin
    .from('students')
    .select('id')
    .eq('mentor_id', studentData.mentor_id || '')

  const poolIds = (poolStudents || []).map((s) => s.id)
  const { data: poolAssessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .in('student_id', poolIds.length > 0 ? poolIds : ['no-match'])
    .returns<AssessmentRow[]>()

  const poolAssessments = poolAssessmentsData || []

  // Weekly cohort data
  const weeklyData: Record<string, { myScores: number[]; classScores: number[]; myDuration: number[]; classDuration: number[] }> = {}

  assessments.forEach((a) => {
    if (!a.assessment_date) return
    const week = a.assessment_date.slice(0, 7) // YYYY-MM
    if (!weeklyData[week]) weeklyData[week] = { myScores: [], classScores: [], myDuration: [], classDuration: [] }
    if (a.accuracy != null) weeklyData[week].myScores.push(a.accuracy)
    if (a.total_duration != null) weeklyData[week].myDuration.push(a.total_duration)
  })

  poolAssessments.forEach((a) => {
    if (!a.assessment_date) return
    const week = a.assessment_date.slice(0, 7)
    if (!weeklyData[week]) weeklyData[week] = { myScores: [], classScores: [], myDuration: [], classDuration: [] }
    if (a.accuracy != null) weeklyData[week].classScores.push(a.accuracy)
    if (a.total_duration != null) weeklyData[week].classDuration.push(a.total_duration)
  })

  const cohortData = Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week: week.slice(5),
      myAvg: data.myScores.length > 0 ? Math.round((data.myScores.reduce((s, v) => s + v, 0) / data.myScores.length) * 10) / 10 : 0,
      classAvg: data.classScores.length > 0 ? Math.round((data.classScores.reduce((s, v) => s + v, 0) / data.classScores.length) * 10) / 10 : 0,
      myDuration: data.myDuration.length > 0 ? Math.round(data.myDuration.reduce((s, v) => s + v, 0) / data.myDuration.length) : 0,
      classDuration: data.classDuration.length > 0 ? Math.round(data.classDuration.reduce((s, v) => s + v, 0) / data.classDuration.length) : 0,
      myCount: data.myScores.length,
      classCount: data.classScores.length,
    }))

  // Daily streak data
  const dateSet = new Set(assessments.map((a) => a.assessment_date).filter(Boolean) as string[])
  const sortedDates = Array.from(dateSet).sort()
  let streak = 0
  let maxStreak = 0
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()
    if (diff <= 86400000 * 2) {
      streak++
      maxStreak = Math.max(maxStreak, streak)
    } else {
      streak = 0
    }
  }

  // Milestones
  const milestones = [
    { label: 'First Assessment', reached: assessments.length >= 1 },
    { label: '10 Assessments', reached: assessments.length >= 10 },
    { label: '50 Assessments', reached: assessments.length >= 50 },
    { label: '80% Accuracy', reached: assessments.length > 0 && (assessments.reduce((s, a) => s + (a.accuracy || 0), 0) / assessments.length) >= 80 },
    { label: '7-Day Streak', reached: maxStreak >= 7 },
    { label: '30-Day Streak', reached: maxStreak >= 30 },
    { label: '100 Attempts', reached: assessments.reduce((s, a) => s + (a.attempt_count || 0), 0) >= 100 },
    { label: '500 Minutes', reached: assessments.reduce((s, a) => s + (a.total_duration || 0), 0) >= 500 },
  ]

  // Slope graph data (first vs last attempt per module)
  const moduleAttempts: Record<string, { first: number; last: number; name: string }> = {}
  assessments.forEach((a) => {
    if (!a.module_name || a.accuracy == null) return
    if (!moduleAttempts[a.module_name]) {
      moduleAttempts[a.module_name] = { first: a.accuracy, last: a.accuracy, name: a.module_name }
    } else {
      moduleAttempts[a.module_name].last = a.accuracy
    }
  })
  const slopeData = Object.values(moduleAttempts).map((m) => ({
    name: m.name,
    first: m.first,
    last: m.last,
    improvement: m.last - m.first,
  })).sort((a, b) => b.improvement - a.improvement)

  const student = {
    id: studentData.id,
    name: studentData.name || 'Student',
    rollNo: studentData.roll_no || 'N/A',
  }

  const stats = {
    totalAssessments: assessments.length,
    avgAccuracy: assessments.length > 0 ? Math.round((assessments.reduce((s, a) => s + (a.accuracy || 0), 0) / assessments.length) * 10) / 10 : 0,
    totalDuration: assessments.reduce((s, a) => s + (a.total_duration || 0), 0),
    totalAttempts: assessments.reduce((s, a) => s + (a.attempt_count || 0), 0),
    maxStreak,
    uniqueDays: dateSet.size,
  }

  return <StudentProgressView student={student} cohortData={cohortData} milestones={milestones} slopeData={slopeData} stats={stats} />
}