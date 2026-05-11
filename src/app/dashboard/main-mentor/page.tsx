import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { MainMentorDashboardView } from './main-mentor-view'
import { AssessmentRow, StudentRow, MentorRow, MainMentorRow } from '@/types/types'

export default async function MainMentorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify main mentor
  const { data: mainMentorData, error: mmErr } = await supabaseAdmin
    .from('main_mentors')
    .select('id, name, email')
    .eq('email', user.email)
    .single<MainMentorRow>()

  if (mmErr || !mainMentorData) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        You do not have main mentor privileges.
      </div>
    )
  }

  // Fetch all mentors under this main mentor with their students
  const { data: mentorsData } = await supabaseAdmin
    .from('mentors')
    .select('*, students(*)')
    .eq('main_mentor_id', mainMentorData.id)
    .returns<MentorRow[]>()

  const mentors = mentorsData || []
  const mentorIds = mentors.map((m) => m.id)

  // Fetch all assessments for these mentors
  const { data: assessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .in('mentor_id', mentorIds.length > 0 ? mentorIds : ['no-match'])
    .returns<AssessmentRow[]>()

  const assessments = assessmentsData || []

  // Flatten all students
  const allStudents: StudentRow[] = []
  mentors.forEach((m) => {
    if (m.students) allStudents.push(...m.students)
  })

  // ─── MENTOR-LEVEL AGGREGATES ───
  const mentorStatsMap: Record<string, { name: string; email: string; poolNo: number | null; studentCount: number; accSum: number; accCount: number; durationSum: number; attemptSum: number }> = {}
  mentors.forEach((m) => {
    mentorStatsMap[m.id] = {
      name: m.name || 'Unknown',
      email: m.email || '',
      poolNo: m.pool_no,
      studentCount: m.students?.length || 0,
      accSum: 0, accCount: 0, durationSum: 0, attemptSum: 0,
    }
  })

  const studentAccMap: Record<string, { sum: number; count: number; name: string; rollNo: string; mentorId: string; mentorName: string; branch: string; college: string; technology: string; gender: string }> = {}
  allStudents.forEach((s) => {
    const mentor = mentors.find((m) => m.id === s.mentor_id)
    studentAccMap[s.id] = {
      sum: 0, count: 0,
      name: s.name || 'Unknown',
      rollNo: s.roll_no || 'N/A',
      mentorId: s.mentor_id || '',
      mentorName: mentor?.name || 'Unknown',
      branch: s.branch || 'CSE',
      college: s.college || 'N/A',
      technology: s.technology || 'N/A',
      gender: s.gender || 'UNKNOWN',
    }
  })

  assessments.forEach((a) => {
    if (a.mentor_id && mentorStatsMap[a.mentor_id]) {
      mentorStatsMap[a.mentor_id].accSum += a.accuracy || 0
      mentorStatsMap[a.mentor_id].accCount += a.accuracy != null ? 1 : 0
      mentorStatsMap[a.mentor_id].durationSum += a.total_duration || 0
      mentorStatsMap[a.mentor_id].attemptSum += a.attempt_count || 0
    }
    if (a.student_id && studentAccMap[a.student_id] && a.accuracy != null) {
      studentAccMap[a.student_id].sum += a.accuracy
      studentAccMap[a.student_id].count += 1
    }
  })

  const mentorLeaderboard = Object.entries(mentorStatsMap)
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      email: stats.email,
      department: 'CSE' as const,
      poolNo: stats.poolNo,
      studentCount: stats.studentCount,
      avgAccuracy: stats.accCount > 0 ? Math.round((stats.accSum / stats.accCount) * 10) / 10 : 0,
      totalDuration: stats.durationSum,
      totalAttempts: stats.attemptSum,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  // ─── STUDENT-LEVEL AGGREGATES ───
  const enrichedStudents = Object.entries(studentAccMap).map(([id, s]) => ({
    id,
    name: s.name,
    rollNo: s.rollNo,
    mentorId: s.mentorId,
    mentorName: s.mentorName,
    branch: s.branch,
    college: s.college,
    technology: s.technology,
    gender: s.gender,
    avgAccuracy: s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0,
  }))

  const topStudents = [...enrichedStudents].sort((a, b) => b.avgAccuracy - a.avgAccuracy).slice(0, 15)
  const atRiskStudents = [...enrichedStudents].filter((s) => s.avgAccuracy > 0 && s.avgAccuracy < 45).sort((a, b) => a.avgAccuracy - b.avgAccuracy).slice(0, 10)

  // ─── CROSS-POOL AGGREGATES ───
  // Technology distribution
  const techMap: Record<string, number> = {}
  enrichedStudents.forEach((s) => {
    techMap[s.technology] = (techMap[s.technology] || 0) + 1
  })
  const techDistribution = Object.entries(techMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

  // College distribution
  const collegeMap: Record<string, number> = {}
  enrichedStudents.forEach((s) => {
    collegeMap[s.college] = (collegeMap[s.college] || 0) + 1
  })
  const collegeDistribution = Object.entries(collegeMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10)

  // Gender distribution
  const genderMap: Record<string, number> = {}
  enrichedStudents.forEach((s) => {
    genderMap[s.gender] = (genderMap[s.gender] || 0) + 1
  })
  const genderDistribution = Object.entries(genderMap).map(([gender, count]) => ({ gender, count }))

  // Branch distribution
  const branchMap: Record<string, number> = {}
  enrichedStudents.forEach((s) => {
    branchMap[s.branch] = (branchMap[s.branch] || 0) + 1
  })
  const branchDistribution = Object.entries(branchMap).map(([branch, count]) => ({ branch, count })).sort((a, b) => b.count - a.count)

  // Course accuracy across all pools
  const courseMap: Record<string, { sum: number; count: number }> = {}
  assessments.forEach((a) => {
    if (!a.course_name || a.accuracy == null) return
    if (!courseMap[a.course_name]) courseMap[a.course_name] = { sum: 0, count: 0 }
    courseMap[a.course_name].sum += a.accuracy
    courseMap[a.course_name].count += 1
  })
  const courseAccuracy = Object.entries(courseMap).map(([subject, { sum, count }]) => ({
    subject, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0, fullMark: 100,
  }))

  // Module accuracy across all pools
  const moduleMap: Record<string, { sum: number; count: number }> = {}
  assessments.forEach((a) => {
    if (!a.module_name || a.accuracy == null) return
    if (!moduleMap[a.module_name]) moduleMap[a.module_name] = { sum: 0, count: 0 }
    moduleMap[a.module_name].sum += a.accuracy
    moduleMap[a.module_name].count += 1
  })
  const moduleAccuracy = Object.entries(moduleMap)
    .map(([name, { sum, count }]) => ({ name, score: count > 0 ? Math.round((sum / count) * 10) / 10 : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  // Student accuracy distribution (all students)
  const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 }
  enrichedStudents.forEach((s) => {
    const a = s.avgAccuracy
    if (a <= 20) buckets['0-20']++
    else if (a <= 40) buckets['21-40']++
    else if (a <= 60) buckets['41-60']++
    else if (a <= 80) buckets['61-80']++
    else buckets['81-100']++
  })
  const accuracyDistribution = Object.entries(buckets).map(([range, count]) => ({ range, count }))

  // Timeline (all assessments)
  const dateMap: Record<string, number> = {}
  assessments.forEach((a) => {
    if (!a.assessment_date) return
    dateMap[a.assessment_date] = (dateMap[a.assessment_date] || 0) + 1
  })
  const trendData = Object.entries(dateMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-21)
    .map(([date, count]) => ({ date: date.slice(5), count }))

  // Pool comparison (avg accuracy per pool)
  const poolMap: Record<number, { sum: number; count: number; mentorCount: number; studentCount: number }> = {}
  mentorLeaderboard.forEach((m) => {
    const pool = m.poolNo ?? 0
    if (!poolMap[pool]) poolMap[pool] = { sum: 0, count: 0, mentorCount: 0, studentCount: 0 }
    poolMap[pool].sum += m.avgAccuracy
    poolMap[pool].count += 1
    poolMap[pool].mentorCount += 1
    poolMap[pool].studentCount += m.studentCount
  })
  const poolComparison = Object.entries(poolMap)
    .map(([pool, stats]) => ({
      pool: `Pool ${pool}`,
      avgAccuracy: stats.count > 0 ? Math.round((stats.sum / stats.count) * 10) / 10 : 0,
      mentorCount: stats.mentorCount,
      studentCount: stats.studentCount,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  // Module heatmap across all top students
  const studentModuleMap: Record<string, Record<string, { sum: number; count: number }>> = {}
  assessments.forEach((a) => {
    if (!a.student_id || !a.module_name || a.accuracy == null) return
    if (!studentModuleMap[a.student_id]) studentModuleMap[a.student_id] = {}
    if (!studentModuleMap[a.student_id][a.module_name]) studentModuleMap[a.student_id][a.module_name] = { sum: 0, count: 0 }
    studentModuleMap[a.student_id][a.module_name].sum += a.accuracy
    studentModuleMap[a.student_id][a.module_name].count += 1
  })

  const moduleCounts: Record<string, number> = {}
  assessments.forEach((a) => {
    if (a.module_name) moduleCounts[a.module_name] = (moduleCounts[a.module_name] || 0) + 1
  })
  const topModules = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map((m) => m[0])
  const heatmapStudents = topStudents.slice(0, 20)
  const heatmapRows = heatmapStudents.map((s) => s.name)
  const heatmapData = heatmapStudents.map((s) =>
    topModules.map((m) => {
      const e = studentModuleMap[s.id]?.[m]
      return e && e.count > 0 ? Math.round((e.sum / e.count) * 10) / 10 : 0
    })
  )

  // Global stats
  const totalMentors = mentors.length
  const totalStudents = allStudents.length
  const totalAssessments = assessments.length
  const overallAvgAccuracy = assessments.length > 0
    ? Math.round((assessments.reduce((sum, a) => sum + (a.accuracy || 0), 0) / assessments.length) * 10) / 10
    : 0
  const totalDuration = assessments.reduce((sum, a) => sum + (a.total_duration || 0), 0)
  const totalAttempts = assessments.reduce((sum, a) => sum + (a.attempt_count || 0), 0)

  const analytics = {
    mentorLeaderboard,
    poolComparison,
    techDistribution,
    collegeDistribution,
    genderDistribution,
    branchDistribution,
    courseAccuracy,
    moduleAccuracy,
    accuracyDistribution,
    trendData,
    topStudents,
    atRiskStudents,
    heatmap: { rows: heatmapRows, cols: topModules, data: heatmapData },
    stats: { totalMentors, totalStudents, totalAssessments, overallAvgAccuracy, totalDuration, totalAttempts },
  }

  return (
    <MainMentorDashboardView
      mainMentor={{ id: mainMentorData.id, name: mainMentorData.name || 'Head Mentor', email: mainMentorData.email || user.email }}
      mentors={mentorLeaderboard}
      students={enrichedStudents}
      analytics={analytics}
    />
  )
}