import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['users']['Row']

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
    })

  if (uploadError) {
    // Sanitize error to prevent "FormData object could not be cloned" errors in the environment
    // We create a new Error object with just the message string to ensure it's serializable
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}
