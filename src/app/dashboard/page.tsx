import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const email = user.email
  if (!email) redirect('/login')

  type RoleTable = {
    students: 'student'
    mentors: 'mentor'
    main_mentors: 'main_mentor'
  }

  let role: RoleTable[keyof RoleTable] | null = null

  const lookup: { table: keyof RoleTable; role: RoleTable[keyof RoleTable] }[] = [
    { table: 'students', role: 'student' },
    { table: 'mentors', role: 'mentor' },
    { table: 'main_mentors', role: 'main_mentor' },
  ]

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const { table, role: tableRole } of lookup) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('id')
      .eq('email', email)
      .single()

    if (!error && data) {
      role = tableRole
      break
    }
  }

  if (!role) redirect('/login')

  switch (role) {
    case 'student':
      redirect('/dashboard/student')
    case 'mentor':
      redirect('/dashboard/mentor')
    case 'main_mentor':
      redirect('/dashboard/main-mentor')
    default:
      redirect('/login')
  }
}