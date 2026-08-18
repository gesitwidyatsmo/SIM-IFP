'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function uploadMedia(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const authorName = formData.get('author_name') || 'Guru Pengampu'
  const title = formData.get('title')
  const subject = formData.get('subject')
  const gradeLevel = formData.get('grade_level')
  let fileUrl = formData.get('file_url') || ''
  let fileType = formData.get('file_type') || 'pdf'
  const file = formData.get('media_file')

  if (!title || !subject || !gradeLevel) {
    return { error: 'Judul, mata pelajaran, dan tingkat kelas wajib diisi.' }
  }

  // Fallback: upload file jika belum di-upload di client
  if (!fileUrl && file && typeof file === 'object' && file.size > 0) {
    const fileNameOriginal = file.name || 'file.pdf'
    const fileExt = fileNameOriginal.split('.').pop().toLowerCase()
    if (['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(fileExt)) {
      fileType = 'video'
    } else if (['ppt', 'pptx', 'key'].includes(fileExt)) {
      fileType = 'ppt'
    }

    const safeFileName = `${user?.id || 'guest'}-${Date.now()}-${fileNameOriginal.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `materials/${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)
      fileUrl = publicUrl
    } else {
      console.warn('Storage upload error (fallback url generated):', uploadError.message)
      fileUrl = `/uploads/${safeFileName}`
    }
  }

  if (!fileUrl) {
    return { error: 'Silakan pilih berkas materi pembelajaran yang akan diunggah.' }
  }

  const { error: insertError } = await supabase
    .from('media_repository')
    .insert([
      {
        uploader_id: user?.id || null,
        author_name: authorName,
        title: title,
        subject: subject,
        grade_level: gradeLevel,
        file_url: fileUrl,
        file_type: fileType,
        status: 'PENDING_VALIDATION',
      }
    ])

  if (insertError) {
    console.error('Insert media_repository error:', insertError)
    return { error: insertError.message || 'Gagal menyimpan data materi.' }
  }

  revalidatePath('/dashboard/repository')
  revalidatePath('/dashboard/validation')

  return { success: true }
}

export async function deleteMedia(mediaId) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Anda harus login sebagai Admin / Kurikulum untuk menghapus bahan ajar.' }
  }

  // Periksa apakah user memiliki role ADMIN atau KEPALA_SEKOLAH
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['ADMIN', 'KEPALA_SEKOLAH']
  if (!allowedRoles.includes(profile?.role)) {
    return { error: 'Hanya Admin atau Tim Kurikulum yang berhak menghapus bahan ajar.' }
  }

  // Ambil file_url jika ada untuk menghapus file fisik di Supabase storage
  const { data: mediaItem } = await supabase
    .from('media_repository')
    .select('file_url')
    .eq('id', mediaId)
    .single()

  if (mediaItem?.file_url && mediaItem.file_url.includes('/materials/')) {
    try {
      const parts = mediaItem.file_url.split('/materials/')
      if (parts.length > 1) {
        const filePath = `materials/${parts[1]}`
        await supabase.storage.from('media').remove([filePath])
      }
    } catch (err) {
      console.warn('Storage delete warning:', err)
    }
  }

  const { error } = await supabase
    .from('media_repository')
    .delete()
    .eq('id', mediaId)

  if (error) {
    console.error('Delete media error:', error)
    return { error: error.message || 'Gagal menghapus bahan ajar dari database.' }
  }

  revalidatePath('/dashboard/repository')
  revalidatePath('/dashboard/validation')
  revalidatePath('/dashboard/monev')

  return { success: true }
}
