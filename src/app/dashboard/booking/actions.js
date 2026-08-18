'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getAssets() {
  const supabase = await createClient()
  const { data: assets, error } = await supabase
    .from('ifp_assets')
    .select('id, asset_code, room_location, status')
    .order('asset_code', { ascending: true })

  if (error || !assets) {
    return []
  }

  return assets
}

export async function submitBooking(formData) {
  const supabase = await createClient()

  // 1. Dapatkan sesi pengguna aktif
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Anda harus login sebagai Admin terlebih dahulu.' }
  }

  const assetCodeOrId = formData.get('asset')
  const date = formData.get('date')
  const startTime = formData.get('start_time')
  const endTime = formData.get('end_time')
  const category = formData.get('category') || 'Pembelajaran'
  const title = formData.get('title')
  const notes = formData.get('notes') || null
  const className = formData.get('class_name') || null
  const subject = formData.get('subject') || null

  if (!assetCodeOrId || !date || !startTime || !endTime || !title) {
    return { error: 'Semua kolom wajib harus diisi.' }
  }

  // 2. Cari asset ID jika yang dikirimkan adalah asset_code
  let ifpAssetId = null
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assetCodeOrId)

  if (isUuid) {
    ifpAssetId = assetCodeOrId
  } else {
    const { data: assetData } = await supabase
      .from('ifp_assets')
      .select('id')
      .eq('asset_code', assetCodeOrId)
      .maybeSingle()
    
    if (assetData) {
      ifpAssetId = assetData.id
    }
  }

  // 3. Pengecekan Bentrok (Double Booking Collision)
  const targetStart = new Date(`${date}T${startTime}:00+07:00`).getTime()
  const targetEnd = new Date(`${date}T${endTime}:00+07:00`).getTime()

  let query = supabase
    .from('schedules')
    .select('id, title, start_time, end_time, status')
    .neq('status', 'REJECTED')

  if (ifpAssetId) {
    query = query.eq('ifp_asset_id', ifpAssetId)
  }

  const { data: existingBookings, error: fetchError } = await query

  if (!fetchError && existingBookings && existingBookings.length > 0) {
    const isOverlap = existingBookings.some(booking => {
      const bStart = new Date(booking.start_time).getTime()
      const bEnd = new Date(booking.end_time).getTime()
      return (targetStart < bEnd) && (targetEnd > bStart)
    })

    if (isOverlap) {
      return { error: 'Gagal! Waktu dan ruangan yang Anda pilih bentrok dengan jadwal yang sudah ada.' }
    }
  }

  // 4. Tentukan Jenis Jadwal
  const scheduleType = category === 'Pembelajaran' ? 'REGULER_INDUK' : 'INSIDENTAL'
  const scheduleStatus = 'APPROVED'

  // 5. Simpan ke tabel schedules
  const { error: insertError } = await supabase
    .from('schedules')
    .insert([
      {
        ifp_asset_id: ifpAssetId,
        user_id: user.id,
        title: title,
        start_time: `${date}T${startTime}:00+07:00`,
        end_time: `${date}T${endTime}:00+07:00`,
        category: category,
        subject: subject,
        class_name: className,
        type: scheduleType,
        status: scheduleStatus,
        notes: notes,
      }
    ])

  if (insertError) {
    console.error('Error insert schedule:', insertError)
    return { error: insertError.message || 'Gagal menyimpan jadwal ke database.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/booking')
  revalidatePath('/dashboard/monev')

  return { success: true }
}

export async function checkAvailability(assetCodeOrId, date, startTime, endTime) {
  if (!assetCodeOrId || !date || !startTime || !endTime) return { isAvailable: true }

  const supabase = await createClient()

  let ifpAssetId = null
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assetCodeOrId)

  if (isUuid) {
    ifpAssetId = assetCodeOrId
  } else {
    const { data: assetData } = await supabase
      .from('ifp_assets')
      .select('id')
      .eq('asset_code', assetCodeOrId)
      .maybeSingle()
    
    if (assetData) {
      ifpAssetId = assetData.id
    }
  }

  const targetStart = new Date(`${date}T${startTime}:00+07:00`).getTime()
  const targetEnd = new Date(`${date}T${endTime}:00+07:00`).getTime()

  let query = supabase
    .from('schedules')
    .select('id, title, start_time, end_time, status')
    .neq('status', 'REJECTED')

  if (ifpAssetId) {
    query = query.eq('ifp_asset_id', ifpAssetId)
  }

  const { data: existingBookings, error } = await query

  if (error || !existingBookings || existingBookings.length === 0) return { isAvailable: true }

  const isOverlap = existingBookings.some(booking => {
    const bStart = new Date(booking.start_time).getTime()
    const bEnd = new Date(booking.end_time).getTime()
    return (targetStart < bEnd) && (targetEnd > bStart)
  })

  return { isAvailable: !isOverlap }
}
