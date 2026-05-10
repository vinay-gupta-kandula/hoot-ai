import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StudentsTableView } from './students-table-view'

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

export default async function StudentsTablePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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