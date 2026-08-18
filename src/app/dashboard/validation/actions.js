'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateMediaValidationStatus(mediaId, newStatus) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Anda harus login terlebih dahulu.' }
  }

  // Periksa apakah user memiliki role ADMIN atau KEPALA_SEKOLAH
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['ADMIN', 'KEPALA_SEKOLAH']
  if (!allowedRoles.includes(profile?.role)) {
    return { error: 'Hanya Admin atau Tim Kurikulum yang berhak memvalidasi materi.' }
  }

  const { error } = await supabase
    .from('media_repository')
    .update({ status: newStatus })
    .eq('id', mediaId)

  if (error) {
    console.error('Update media status error:', error)
    return { error: error.message || 'Gagal memperbarui status materi.' }
  }

  revalidatePath('/dashboard/validation')
  revalidatePath('/dashboard/repository')
  revalidatePath('/dashboard/monev')

  return { success: true }
}
