'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createTicket(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const reporterName = formData.get('reporter_name')
  const assetId = formData.get('asset_id')
  const severity = formData.get('severity') || 'MEDIUM'
  const issueDesc = formData.get('issue_desc')

  if (!assetId || !issueDesc || !reporterName) {
    return { error: 'Nama pelapor, aset IFP, dan deskripsi kendala wajib diisi.' }
  }

  // Buat kode tiket acak unik
  const ticketCode = `TKT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`

  const { error: insertError } = await supabase
    .from('tickets')
    .insert([
      {
        ticket_code: ticketCode,
        ifp_asset_id: assetId,
        reported_by: user?.id || null,
        reporter_name: reporterName,
        severity: severity.toUpperCase(),
        issue_desc: issueDesc,
        status: 'OPEN',
      }
    ])

  if (insertError) {
    console.error('Insert ticket error:', insertError)
    return { error: insertError.message || 'Gagal mengirimkan laporan kerusakan.' }
  }

  revalidatePath('/dashboard/tickets')
  revalidatePath('/dashboard/monev')

  return { success: true }
}

export async function updateTicketStatus(ticketId, newStatus) {
  const supabase = await createClient()

  const updateData = {
    status: newStatus,
  }

  if (newStatus === 'CLOSED') {
    updateData.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', ticketId)

  if (error) {
    console.error('Update ticket status error:', error)
    return { error: error.message || 'Gagal mengubah status tiket.' }
  }

  revalidatePath('/dashboard/tickets')
  revalidatePath('/dashboard/monev')

  return { success: true }
}

export async function deleteTicket(ticketId) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Anda harus login sebagai Admin / Sarpras untuk menghapus laporan kerusakan.' }
  }

  // Periksa apakah user memiliki role ADMIN atau KEPALA_SEKOLAH
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['ADMIN', 'KEPALA_SEKOLAH']
  if (!allowedRoles.includes(profile?.role)) {
    return { error: 'Hanya Admin atau Tim Sarpras yang berhak menghapus laporan kerusakan.' }
  }

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId)

  if (error) {
    console.error('Delete ticket error:', error)
    return { error: error.message || 'Gagal menghapus tiket kerusakan dari database.' }
  }

  revalidatePath('/dashboard/tickets')
  revalidatePath('/dashboard/monev')

  return { success: true }
}
