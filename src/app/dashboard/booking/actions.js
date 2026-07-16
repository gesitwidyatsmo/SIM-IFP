'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitBooking(formData) {
  const supabase = await createClient()

  // Dapatkan sesi pengguna yang sedang login
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Anda harus login terlebih dahulu.' }
  }

  const asset = formData.get('asset')
  const date = formData.get('date')
  const startTime = formData.get('start_time')
  const endTime = formData.get('end_time')
  const category = formData.get('category')
  const title = formData.get('title')
  const notes = formData.get('notes')

  // Pengecekan Bentrok (Double Booking)
  const { data: existingBookings, error: fetchError } = await supabase
    .from('bookings')
    .select('title, start_time, end_time')
    .eq('asset', asset)
    .eq('date', date)

  if (fetchError) {
    console.error('Error fetching bookings for overlap check:', fetchError)
    return { error: 'Gagal mengecek ketersediaan jadwal.' }
  }

  const isOverlap = existingBookings.some(booking => {
    const bStart = booking.start_time.substring(0, 5) // Potong jadi "HH:MM"
    const bEnd = booking.end_time.substring(0, 5)
    const nStart = startTime.substring(0, 5)
    const nEnd = endTime.substring(0, 5)

    // Rumus bentrok: (start baru < end lama) AND (end baru > start lama)
    return (nStart < bEnd) && (nEnd > bStart)
  })

  if (isOverlap) {
    return { error: 'Gagal! Waktu yang Anda pilih bentrok dengan jadwal yang sudah ada.' }
  }

  // Simpan data ke tabel bookings
  const { error } = await supabase
    .from('bookings')
    .insert([
      {
        user_id: user.id,
        asset: asset,
        date: date,
        start_time: startTime,
        end_time: endTime,
        category: category,
        title: title,
        notes: notes,
        class_name: formData.get('class_name') || null,
        subject: formData.get('subject') || null,
        status: 'PENDING'
      }
    ])

  if (error) {
    console.error('Error saat submit booking:', error)
    return { error: error.message || 'Terjadi kesalahan saat menyimpan jadwal.' }
  }

  // Hapus cache halaman agar data terbaru bisa termuat
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/booking')
  
  return { success: true }
}

export async function checkAvailability(asset, date, startTime, endTime) {
  if (!asset || !date || !startTime || !endTime) return { isAvailable: true }

  const supabase = await createClient()

  const { data: existingBookings, error } = await supabase
    .from('bookings')
    .select('title, start_time, end_time')
    .eq('asset', asset)
    .eq('date', date)

  if (error || !existingBookings) return { isAvailable: true }

  const isOverlap = existingBookings.some(booking => {
    const bStart = booking.start_time.substring(0, 5)
    const bEnd = booking.end_time.substring(0, 5)
    const nStart = startTime.substring(0, 5)
    const nEnd = endTime.substring(0, 5)

    return (nStart < bEnd) && (nEnd > bStart)
  })

  if (isOverlap) {
    return { isAvailable: false }
  }

  return { isAvailable: true }
}
