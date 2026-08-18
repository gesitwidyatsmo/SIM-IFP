import { login, signup } from './actions'
import { AlertCircle, CheckCircle2, Shield, ArrowLeft, UserPlus, LogIn, MonitorPlay } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage(props) {
  const searchParams = await props.searchParams
  let errorMessage = searchParams?.error
  const successMessage = searchParams?.success

  if (errorMessage === '{}' || errorMessage === 'null') {
    errorMessage = 'Email atau kata sandi salah. Jika belum punya akun, Anda dapat mendaftarkannya dengan tombol "Daftarkan Akun Admin".'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden font-sans">
      
      <div className="neo-card w-full max-w-md p-6 sm:p-8 bg-white shadow-[6px_6px_0px_0px_#000] relative z-10">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-xs font-bold text-gray-700 hover:text-black transition-colors mb-6 p-1.5 rounded-lg border border-black/20 hover:border-black bg-[#FFFDF5]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
          Kembali ke Dashboard Publik
        </Link>

        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#FFE600] border-2 border-black rounded-2xl flex items-center justify-center mb-3 shadow-[3px_3px_0px_0px_#000]">
            <Shield className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div className="flex items-center space-x-1.5 mb-1">
            <h1 className="text-2xl font-black text-black tracking-tight">Portal Administrator</h1>
          </div>
          <p className="text-xs font-semibold text-gray-600 text-center leading-relaxed max-w-xs">
            Masuk atau daftarkan akun pengelola TIK & Kurikulum untuk mengatur jadwal dan verifikasi materi.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-[#FEE2E2] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-start space-x-3 text-[#991B1B]">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-black uppercase tracking-wider">Pemberitahuan</p>
              <p className="font-bold mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-4 rounded-xl bg-[#D1FAE5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-start space-x-3 text-[#065F46]">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-black uppercase tracking-wider">Berhasil</p>
              <p className="font-bold mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        <form className="flex flex-col space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-700" htmlFor="email">
              Email Administrator
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="neo-input w-full text-sm"
              placeholder="admin@sekolah.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-700" htmlFor="password">
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="neo-input w-full text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              formAction={login}
              className="neo-btn-primary w-full py-3 text-sm font-black shadow-[4px_4px_0px_0px_#000]"
            >
              <LogIn className="w-4 h-4 mr-2 stroke-[2.5]" />
              Masuk sebagai Admin
            </button>

            <button
              formAction={signup}
              className="neo-btn-secondary w-full py-2.5 text-xs font-bold"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Daftarkan Akun Admin Baru
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-black/10 text-center">
          <p className="text-[11px] font-semibold text-gray-500">
            Guru atau siswa dapat melihat jadwal dan mengisi log langsung di halaman utama tanpa login.
          </p>
        </div>
      </div>
    </div>
  )
}
