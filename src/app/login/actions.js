'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const email = formData.get('email')?.trim()
  const password = formData.get('password')

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email dan password wajib diisi.'))
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Supabase Login Error:', error)
    let userMsg = 'Email atau kata sandi tidak cocok. Pastikan akun sudah terdaftar dan email telah dikonfirmasi.'
    
    const msg = error.message || ''
    if (msg.includes('Invalid login credentials')) {
      userMsg = 'Email atau kata sandi tidak cocok. Pastikan Anda telah menjalankan script schema.sql atau mendaftarkan akun.'
    } else if (msg.includes('Email not confirmed')) {
      userMsg = 'Email belum dikonfirmasi. Periksa kotak masuk/spam email Anda atau matikan "Confirm email" di Supabase Dashboard (Auth > Providers > Email).'
    } else if (msg.includes('Database error') || msg.includes('unexpected_failure') || error.status === 500) {
      userMsg = 'Database Supabase memerlukan pembaruan schema. Jalankan script "schema.sql" terbaru di SQL Editor Supabase.'
    } else if (msg && msg !== '{}') {
      userMsg = msg
    }
    
    redirect(`/login?error=${encodeURIComponent(userMsg)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData) {
  const supabase = await createClient()

  const email = formData.get('email')?.trim()
  const password = formData.get('password')
  const fullName = formData.get('full_name') || email?.split('@')[0] || 'Administrator'

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email dan kata sandi wajib diisi untuk pendaftaran.'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'ADMIN',
      },
    },
  })

  if (error) {
    console.error('Supabase Signup Error:', error)
    let userMsg = error.message || 'Gagal membuat akun baru.'
    if (userMsg.includes('Database error') || error.status === 500) {
      userMsg = 'Terjadi kesalahan trigger database. Jalankan script "schema.sql" terbaru di SQL Editor Supabase.'
    }
    redirect(`/login?error=${encodeURIComponent(userMsg)}`)
  }

  if (data?.user) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: 'ADMIN',
      })
    } catch (e) {
      console.warn('Upsert profile notice:', e)
    }
  }

  // Jika Supabase mengembalikan session (email confirmation off), langsung ke dashboard
  if (data?.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } else {
    // Jika perlu konfirmasi email
    redirect('/login?success=' + encodeURIComponent('Pendaftaran berhasil! Jika fitur konfirmasi email aktif di Supabase, silakan cek email Anda sebelum login. Jika akun sudah aktif, silakan langsung Masuk.'))
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
