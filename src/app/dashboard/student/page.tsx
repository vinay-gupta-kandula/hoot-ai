import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StudentDashboardView } from './student-view'

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
}

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find student by email
  const { data: studentData, error: studentErr } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('email', user.email)
    .single<StudentRow>()

  if (studentErr || !studentData) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Student profile not found.
      </div>
    )
  }

  // Fetch mentor
  const { data: mentorData } = await supabaseAdmin
    .from('mentors')
    .select('id, name, email, pool_no')
    .eq('id', studentData.mentor_id || '')
    .single<MentorRow>()

  // Fetch all assessments for this student
  const { data: assessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .eq('student_id', studentData.id)
    .returns<AssessmentRow[]>()

  const assessments = assessmentsData || []

  // Fetch all students in same pool for comparison
  const { data: poolStudentsData } = await supabaseAdmin
    .from('students')
    .select('id, name, roll_no')
    .eq('mentor_id', studentData.mentor_id || '')
    .returns<{ id: string; name: string | null; roll_no: string | null }[]>()

  const poolStudentIds = (poolStudentsData || []).map((s) => s.id)

  // Fetch all assessments for pool comparison
  const { data: poolAssessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .in('student_id', poolStudentIds.length > 0 ? poolStudentIds : ['no-match'])
    .returns<AssessmentRow[]>()

  const poolAssessments = poolAssessmentsData || []

  // ─── PERSONAL AGGREGATES ───
  const courseMap: Record<string, { sum: number; count: number }> = {}
  const moduleMap: Record<string, { sum: number; count: number; attempts: number; duration: number }> = {}
  const timelineMap: Record<string, { count: number; avgAcc: number; accCount: number }> = {}
  const attemptFlow: Record<string, number> = {}
  const dateScores: Record<string, number[]> = {}

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
      if (!timelineMap[a.assessment_date]) timelineMap[a.assessment_date] = { count: 0, avgAcc: 0, accCount: 0 }
      timelineMap[a.assessment_date].count += 1
      if (a.accuracy != null) {
        timelineMap[a.assessment_date].avgAcc += a.accuracy
        timelineMap[a.assessment_date].accCount += 1
      }
    }
    if (a.module_name) {
      attemptFlow[a.module_name] = (attemptFlow[a.module_name] || 0) + (a.attempt_count || 0)
    }
    if (a.assessment_date && a.accuracy != null) {
      if (!dateScores[a.assessment_date]) dateScores[a.assessment_date] = []
      dateScores[a.assessment_date].push(a.accuracy)
    }
  })

  const courseAccuracy = Object.entries(courseMap).map(([subject, { sum, count }]) => ({
    subject, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, fullMark: 100,
  }))

  const moduleBreakdown = Object.entries(moduleMap)
    .map(([name, { sum, count, attempts, duration }]) => ({
      name, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, attempts, duration,
      size: count > 0 ? Math.round(sum / count) : 0,
    }))
    .sort((a, b) => b.score - a.score)

  const timeline = Object.entries(timelineMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, data]) => ({
      date: date.slice(5),
      count: data.count,
      avgAccuracy: data.accCount > 0 ? Math.round((data.avgAcc / data.accCount) * 10) / 10 : 0,
    }))

  // ─── POOL COMPARISON ───
  const poolStudentAcc: Record<string, { sum: number; count: number; name: string }> = {}
  poolStudentsData?.forEach((s) => {
    poolStudentAcc[s.id] = { sum: 0, count: 0, name: s.name || 'Unknown' }
  })
  poolAssessments.forEach((a) => {
    if (a.student_id && a.accuracy != null && poolStudentAcc[a.student_id]) {
      poolStudentAcc[a.student_id].sum += a.accuracy
      poolStudentAcc[a.student_id].count += 1
    }
  })

  const peerComparison = Object.entries(poolStudentAcc)
    .map(([id, data]) => ({
      id, name: data.name,
      avgAccuracy: data.count > 0 ? Math.round((data.sum / data.count) * 10) / 10 : 0,
      isMe: id === studentData.id,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  const myRank = peerComparison.findIndex((p) => p.isMe) + 1
  const classAvg = poolAssessments.length > 0
    ? Math.round((poolAssessments.reduce((s, a) => s + (a.accuracy || 0), 0) / poolAssessments.length) * 10) / 10
    : 0

  // ─── TREEMAP DATA ───
  const treemapData = moduleBreakdown.map((m) => ({
    name: m.name,
    size: m.size,
    score: m.score,
  }))

  // ─── FUNNEL DATA ───
  const funnelData = moduleBreakdown.slice(0, 6).map((m, i) => ({
    name: m.name,
    value: m.score,
    fill: ['#15803d', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 6],
  }))

  // ─── SCATTER DATA (accuracy vs duration) ───
  const scatterData = moduleBreakdown.map((m) => ({
    x: m.duration,
    y: m.score,
    z: m.attempts * 5 + 20,
    name: m.name,
  }))

  // ─── BULLET CHART DATA ───
  const bulletData = courseAccuracy.map((c) => ({
    subject: c.subject,
    me: c.score,
    classAvg,
    target: 80,
  }))

  // ─── SPARKLINE DATA ───
  const sparklineData = Object.entries(dateScores)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-10)
    .map(([_, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return Math.round(avg * 10) / 10
    })

  // ─── SANKEY DATA ───
  const courseModules: Record<string, string[]> = {}
  assessments.forEach((a) => {
    if (a.course_name && a.module_name) {
      if (!courseModules[a.course_name]) courseModules[a.course_name] = []
      if (!courseModules[a.course_name].includes(a.module_name)) {
        courseModules[a.course_name].push(a.module_name)
      }
    }
  })

  const sankeyNodes = Array.from(new Set([
    ...Object.keys(courseModules),
    ...assessments.map((a) => a.module_name).filter(Boolean) as string[]
  ])).map((name, i) => ({ name, index: i }))

  const sankeyLinks: { source: number; target: number; value: number }[] = []
  Object.entries(courseModules).forEach(([course, modules]) => {
    const sourceIdx = sankeyNodes.findIndex((n) => n.name === course)
    modules.forEach((mod) => {
      const targetIdx = sankeyNodes.findIndex((n) => n.name === mod)
      if (sourceIdx !== -1 && targetIdx !== -1) {
        sankeyLinks.push({ source: sourceIdx, target: targetIdx, value: 1 })
      }
    })
  })

  // Stats
  const totalAssessments = assessments.length
  const avgAccuracy = assessments.length > 0
    ? Math.round((assessments.reduce((s, a) => s + (a.accuracy || 0), 0) / assessments.length) * 10) / 10
    : 0
  const totalDuration = assessments.reduce((s, a) => s + (a.total_duration || 0), 0)
  const totalAttempts = assessments.reduce((s, a) => s + (a.attempt_count || 0), 0)
  const bestCourse = courseAccuracy.sort((a, b) => b.score - a.score)[0]
  const worstCourse = courseAccuracy.sort((a, b) => a.score - b.score)[0]

  const student = {
    id: studentData.id,
    name: studentData.name || 'Student',
    rollNo: studentData.roll_no || 'N/A',
    branch: studentData.branch || 'CSE',
    college: studentData.college || 'N/A',
    technology: studentData.technology || 'N/A',
    gender: studentData.gender || 'UNKNOWN',
    mentorName: mentorData?.name || 'Unknown',
    poolNo: mentorData?.pool_no,
  }

  const analytics = {
    courseAccuracy,
    moduleBreakdown,
    timeline,
    peerComparison,
    treemapData,
    funnelData,
    scatterData,
    bulletData,
    sparklineData,
    sankeyNodes,
    sankeyLinks,
    stats: { totalAssessments, avgAccuracy, totalDuration, totalAttempts, myRank, totalPeers: peerComparison.length, classAvg, bestCourse: bestCourse?.subject || 'N/A', bestScore: bestCourse?.score || 0, worstCourse: worstCourse?.subject || 'N/A', worstScore: worstCourse?.score || 0 },
  }

  return <StudentDashboardView student={student} analytics={analytics} />
}