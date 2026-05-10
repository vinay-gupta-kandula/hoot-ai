'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function assignMentor(studentId: string, mentorId: string) {
  const supabase = getAdminClient()

  const { error } = await supabase
    .from('students')
    .update({ mentor_id: mentorId })
    .eq('id', studentId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/main-mentor')
  return { success: true }
}

export async function removeMentor(studentId: string) {
  const supabase = getAdminClient()

  const { error } = await supabase
    .from('students')
    .update({ mentor_id: null })
    .eq('id', studentId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/main-mentor')
  return { success: true }
}
