import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { PracticeView } from './practice-view'
import { StudentRow } from '@/types/types'

export default async function PracticePage({ params }: { params: Promise<{ moduleSlug: string }> }) {
  const { moduleSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: student } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('email', user.email)
    .single<StudentRow>()

  if (!student) redirect('/login')

  const moduleName = moduleSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <PracticeView 
      student={student} 
      moduleName={moduleName} 
      moduleSlug={moduleSlug} 
    />
  )
}
