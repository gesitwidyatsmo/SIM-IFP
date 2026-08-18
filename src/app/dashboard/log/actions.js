'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitUsageLog(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const teacherName = formData.get('teacher_name')
  const assetId = formData.get('asset_id')
  const subject = formData.get('subject')
  const topic = formData.get('topic')
  const startTime = formData.get('start_time')
  const endTime = formData.get('end_time')
  const file = formData.get('evidence_file')

  if (!teacherName || !subject || !topic) {
    return { error: 'Nama guru pengajar, mata pelajaran, dan topik materi wajib diisi.' }
  }

  let evidenceUrl = formData.get('evidence_url') || null

  // Fallback: upload file jika belum di-upload di client
  if (!evidenceUrl && file && typeof file === 'object' && file.size > 0 && file.name) {
    const fileExt = file.name.split('.').pop()
    const fileName = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
    const filePath = `evidence/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('evidence')
        .getPublicUrl(filePath)
      evidenceUrl = publicUrl
    } else {
      console.warn('Storage upload notice:', uploadError.message)
    }
  }

  const { error: insertError } = await supabase
    .from('usage_logs')
    .insert([
      {
        user_id: user?.id || null,
        teacher_name: teacherName,
        ifp_asset_id: assetId || null,
        subject: subject,
        topic: topic,
        start_time: startTime || null,
        end_time: endTime || null,
        evidence_url: evidenceUrl,
      }
    ])

  if (insertError) {
    console.error('Insert usage_logs error:', insertError)
    return { error: insertError.message || 'Gagal menyimpan log penggunaan ke database.' }
  }

  revalidatePath('/dashboard/log')
  revalidatePath('/dashboard/monev')

  return { success: true }
}

export async function deleteUsageLog(logId) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Anda harus login sebagai Admin / Kurikulum untuk menghapus log penggunaan.' }
  }

  // Periksa apakah user memiliki role ADMIN atau KEPALA_SEKOLAH
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['ADMIN', 'KEPALA_SEKOLAH']
  if (!allowedRoles.includes(profile?.role)) {
    return { error: 'Hanya Admin atau Tim Kurikulum yang berhak menghapus log realisasi.' }
  }

  // Ambil evidence_url jika ada untuk menghapus file fisik di Supabase storage
  const { data: logItem } = await supabase
    .from('usage_logs')
    .select('evidence_url')
    .eq('id', logId)
    .single()

  if (logItem?.evidence_url && logItem.evidence_url.includes('/evidence/')) {
    try {
      const parts = logItem.evidence_url.split('/evidence/')
      if (parts.length > 1) {
        const filePath = `evidence/${parts[1]}`
        await supabase.storage.from('evidence').remove([filePath])
      }
    } catch (err) {
      console.warn('Evidence storage delete warning:', err)
    }
  }

  const { error } = await supabase
    .from('usage_logs')
    .delete()
    .eq('id', logId)

  if (error) {
    console.error('Delete usage_logs error:', error)
    return { error: error.message || 'Gagal menghapus log penggunaan dari database.' }
  }

  revalidatePath('/dashboard/monev')
  revalidatePath('/dashboard/log')

  return { success: true }
}
