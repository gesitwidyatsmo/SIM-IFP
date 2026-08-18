'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Key, CheckCircle2, AlertTriangle, Shield, Info } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    id: '',
    full_name: '',
    email: '',
    role: 'GURU'
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile({
          id: user.id,
          full_name: prof?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          role: prof?.role || 'GURU'
        })
      }
    }
    loadData()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setErrorMessage('')
    setProfileSuccess('')

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setProfileSuccess('Profil berhasil diperbarui!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui profil.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password baru tidak cocok.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Password minimal harus 6 karakter.')
      return
    }

    setIsUpdatingPassword(true)
    setErrorMessage('')
    setPasswordSuccess('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setPasswordSuccess('Password akun berhasil diubah!')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui password.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <h1 className="text-2xl font-black text-black">Pengaturan Akun & Profil</h1>
        <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
          Kelola data nama pengajar, peran sistem, dan kredensial keamanan akun SIM-IFP Anda.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-[#FEE2E2] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center text-[#991B1B] font-bold text-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Profil Section */}
      <div className="neo-card p-6 md:p-8 space-y-6 bg-white">
        <div className="flex items-center space-x-3 border-b-2 border-black pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center">
            <User className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <h2 className="text-base font-black text-black">Informasi Profil Pengajar</h2>
        </div>

        {profileSuccess && (
          <div className="bg-[#D1FAE5] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center text-[#065F46] font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
            {profileSuccess}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Alamat Email (Akun Login)
            </label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="neo-input w-full bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
            <p className="text-[11px] font-semibold text-gray-500 mt-1">Email dikelola langsung oleh sistem autentikasi.</p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Nama Lengkap & Gelar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
              className="neo-input w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Peran Hak Akses (Role)
            </label>
            <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#DBEAFE] border-2 border-black text-[#1E40AF] font-black text-xs shadow-[2px_2px_0px_0px_#000]">
              <Shield className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
              {profile.role}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="neo-btn-primary px-6 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
            >
              {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>

      {/* Keamanan & Password */}
      <div className="neo-card p-6 md:p-8 space-y-6 bg-white">
        <div className="flex items-center space-x-3 border-b-2 border-black pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FB923C] border-2 border-black flex items-center justify-center text-white">
            <Key className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-base font-black text-black">Perbarui Kata Sandi</h2>
        </div>

        {passwordSuccess && (
          <div className="bg-[#D1FAE5] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center text-[#065F46] font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="neo-input w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Ulangi Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi baru"
              className="neo-input w-full text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="neo-btn-secondary px-6 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
            >
              {isUpdatingPassword ? 'Memperbarui...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Aplikasi */}
      <div className="neo-card p-6 bg-[#FEF08A] flex items-start space-x-4">
        <div className="p-2.5 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <Info className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <h3 className="font-black text-black text-sm">SIM-IFP v1.0.0 (Enterprise Academic Edition)</h3>
          <p className="text-xs font-medium text-gray-800 mt-1 leading-relaxed">
            Sistem Informasi Manajemen Terpadu untuk tata kelola Interactive Flat Panel (IFP) sekolah reguler dan tutorial terbuka. Seluruh basis data disinkronkan secara aman via PostgreSQL Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}
