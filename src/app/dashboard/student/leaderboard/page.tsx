import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { LeaderboardView } from './leaderboard-view'
import { AssessmentRow, StudentRow } from '@/types/types'

export default async function StudentLeaderboardPage() {
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

  // Fetch all students in same pool
  const { data: poolStudentsData } = await supabaseAdmin
    .from('students')
    .select('id, name, roll_no, college')
    .eq('mentor_id', studentData.mentor_id || '')
    .returns<StudentRow[]>()

  const poolStudents = poolStudentsData || []
  const poolStudentIds = poolStudents.map((s) => s.id)

  // Fetch all assessments for pool comparison
  const { data: poolAssessmentsData } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .in('student_id', poolStudentIds.length > 0 ? poolStudentIds : ['no-match'])
    .returns<AssessmentRow[]>()

  const poolAssessments = poolAssessmentsData || []

  // Aggregate accuracy per student
  const studentAcc: Record<string, { sum: number; count: number; name: string; rollNo: string; college: string }> = {}
  poolStudents.forEach((s) => {
    studentAcc[s.id] = { 
        sum: 0, 
        count: 0, 
        name: s.name || 'Unknown', 
        rollNo: s.roll_no || 'N/A',
        college: s.college || 'N/A'
    }
  })

  poolAssessments.forEach((a) => {
    if (a.student_id && a.accuracy != null && studentAcc[a.student_id]) {
      studentAcc[a.student_id].sum += a.accuracy
      studentAcc[a.student_id].count += 1
    }
  })

  const rankings = Object.entries(studentAcc)
    .map(([id, data]) => ({
      id,
      name: data.name,
      rollNo: data.rollNo,
      college: data.college,
      avgAccuracy: data.count > 0 ? Math.round((data.sum / data.count) * 10) / 10 : 0,
      isMe: id === studentData.id,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  return <LeaderboardView rankings={rankings} />
}
