import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StudentModulesView } from './modules-view'
import { AssessmentRow, StudentRow } from '@/types/types'

export default async function StudentModulesPage() {
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

  // Module detail data
  const moduleDetailMap: Record<string, {
    name: string
    course: string
    scores: number[]
    dates: string[]
    durations: number[]
    attempts: number[]
    totalAttempts: number
    totalDuration: number
    avgAccuracy: number
    bestScore: number
    worstScore: number
    trend: 'up' | 'down' | 'flat'
  }> = {}

  assessments.forEach((a) => {
    if (!a.module_name) return
    if (!moduleDetailMap[a.module_name]) {
      moduleDetailMap[a.module_name] = {
        name: a.module_name,
        course: a.course_name || 'Unknown',
        scores: [],
        dates: [],
        durations: [],
        attempts: [],
        totalAttempts: 0,
        totalDuration: 0,
        avgAccuracy: 0,
        bestScore: 0,
        worstScore: 100,
        trend: 'flat',
      }
    }
    const m = moduleDetailMap[a.module_name]
    if (a.accuracy != null) {
      m.scores.push(a.accuracy)
      m.bestScore = Math.max(m.bestScore, a.accuracy)
      m.worstScore = Math.min(m.worstScore, a.accuracy)
    }
    if (a.assessment_date) m.dates.push(a.assessment_date)
    if (a.total_duration != null) {
      m.durations.push(a.total_duration)
      m.totalDuration += a.total_duration
    }
    if (a.attempt_count != null) {
      m.attempts.push(a.attempt_count)
      m.totalAttempts += a.attempt_count
    }
  })

  const moduleDetails = Object.values(moduleDetailMap).map((m) => {
    const avg = m.scores.length > 0 ? m.scores.reduce((a, b) => a + b, 0) / m.scores.length : 0
    const firstHalf = m.scores.slice(0, Math.floor(m.scores.length / 2))
    const secondHalf = m.scores.slice(Math.floor(m.scores.length / 2))
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0

    return {
      ...m,
      avgAccuracy: Math.round(avg * 10) / 10,
      bestScore: m.bestScore === 0 && m.scores.length === 0 ? 0 : m.bestScore,
      worstScore: m.worstScore === 100 && m.scores.length === 0 ? 0 : m.worstScore,
      trend: secondAvg > firstAvg + 5 ? 'up' as const : secondAvg < firstAvg - 5 ? 'down' as const : 'flat' as const,
      attemptHistory: m.dates.map((d, i) => ({
        date: d.slice(5),
        score: m.scores[i] || 0,
        duration: m.durations[i] || 0,
        attempt: m.attempts[i] || 0,
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }
  }).sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  const student = {
    id: studentData.id,
    name: studentData.name || 'Student',
    rollNo: studentData.roll_no || 'N/A',
  }

  return <StudentModulesView student={student} modules={moduleDetails} />
}