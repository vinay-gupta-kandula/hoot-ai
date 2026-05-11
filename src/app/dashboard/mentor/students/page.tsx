import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { StudentsTableView } from './students-table-view'
import { StudentRow, MentorRow } from '@/types/types'

export default async function StudentsTablePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const { data: mentorData } = await supabaseAdmin
    .from('mentors')
    .select('id, name')
    .eq('email', user.email)
    .single<MentorRow>()

  if (!mentorData) redirect('/login')

  const { data: studentsData } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('mentor_id', mentorData.id)
    .returns<StudentRow[]>()

  const students = (studentsData || []).map((s) => ({
    id: s.id,
    name: s.name || 'Unknown',
    rollNo: s.roll_no || 'N/A',
    branch: s.branch || 'CSE',
    college: s.college || '',
    technology: s.technology || '',
    gender: s.gender || 'UNKNOWN',
  }))

  return <StudentsTableView students={students} mentorName={mentorData.name || 'Mentor'} />
}