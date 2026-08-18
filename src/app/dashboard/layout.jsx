'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, ClipboardList, Settings, MonitorPlay, LogOut, Library, CheckSquare, AlertTriangle, BarChart3, Menu, X, ShieldCheck, LogIn, User, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: 'Pengunjung / Guru',
    email: 'Akses Publik',
    role: 'GUEST'
  })

  useEffect(() => {
    const supabase = createClient()
    
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle()

        setUserProfile({
          name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin TIK',
          email: user.email || 'admin@sekolah.com',
          role: profile?.role || user.user_metadata?.role || 'ADMIN'
        })
      } else {
        setIsLoggedIn(false)
        setUserProfile({
          name: 'Pengguna Publik',
          email: 'Akses Guru & Siswa',
          role: 'GUEST'
        })
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserProfile({
      name: 'Pengguna Publik',
      email: 'Akses Guru & Siswa',
      role: 'GUEST'
    })
    router.push('/dashboard')
    router.refresh()
  }

  const isAdmin = isLoggedIn && (userProfile.role === 'ADMIN' || userProfile.role === 'KEPALA_SEKOLAH')

  // Navigasi Publik
  const publicNavItems = [
    { name: 'Jadwal Penggunaan', href: '/dashboard', icon: Calendar, exact: true },
    { name: 'Statistik & Monev', href: '/dashboard/monev', icon: BarChart3 },
    { name: 'Log Pasca Mengajar', href: '/dashboard/log', icon: ClipboardList },
    { name: 'Bahan Ajar (Repositori)', href: '/dashboard/repository', icon: Library },
    { name: 'Laporan Kerusakan (5P)', href: '/dashboard/tickets', icon: AlertTriangle },
  ]

  // Menu Khusus Admin
  const adminNavItems = [
    { name: 'Validasi Kurikulum', href: '/dashboard/validation', icon: CheckSquare },
    { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-transparent text-black overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Agenda Binder Style */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-[#F4EFE6] border-r-[2.5px] border-black flex flex-col z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:pointer-events-auto shadow-[4px_0px_0px_0px_rgba(0,0,0,0.05)] ${isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}`}>
        
        {/* Mobile Close Button */}
        <button 
          className="md:hidden absolute top-4 right-4 p-1 bg-white border-2 border-black rounded-lg text-black shadow-[2px_2px_0px_0px_#000]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Logo / Header Brand */}
        <div className="p-5 border-b-[2.5px] border-black bg-white flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
            <MonitorPlay className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-xl tracking-tight text-black">SIM-IFP</span>
            </div>
            <p className="text-[11px] font-bold text-gray-600">Lab Flat Panel Terpadu</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3">
          <nav className="space-y-1.5">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
              Menu Pembelajaran
            </p>
            {publicNavItems.map((item) => {
              const Icon = item.icon
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] -translate-x-0.5' 
                      : 'bg-transparent text-gray-700 border-2 border-transparent hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Menu Administrator */}
            {isAdmin && (
              <>
                <div className="pt-5 pb-1">
                  <div className="px-3 flex items-center space-x-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-black">
                      Kelola Kurikulum
                    </p>
                  </div>
                </div>
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        isActive 
                          ? 'bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] -translate-x-0.5' 
                          : 'bg-transparent text-gray-700 border-2 border-transparent hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        </div>

        {/* Footer User Chip */}
        <div className="p-3 border-t-[2.5px] border-black bg-white">
          {isLoggedIn ? (
            <div className="p-2.5 bg-[#F4EFE6] rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6] border-2 border-black text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0px_0px_#000]">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-black truncate">{userProfile.name}</p>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#D1FAE5] text-[#065F46] border border-black text-[9px] font-black uppercase">
                    {userProfile.role}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                title="Keluar / Logout"
                className="p-1.5 bg-white hover:bg-[#FEE2E2] text-black hover:text-[#EF4444] border-2 border-black rounded-lg shadow-[1px_1px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-[#FFFDF5] rounded-xl border border-gray-300">
                <div className="w-6 h-6 rounded-md bg-gray-200 border border-black flex items-center justify-center text-gray-700 flex-shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-black leading-tight">Akses Guru & Publik</p>
                  <p className="text-[9px] font-medium text-gray-500">Mode Baca / Input Bebas</p>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full flex items-center justify-center py-2 px-3 bg-[#FFE600] hover:bg-[#FFF04D] text-black border-2 border-black rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Login Kurikulum / Admin
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Top Header */}
        <header className="md:hidden border-b-[2.5px] border-black bg-white px-4 h-16 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#000]">
              <MonitorPlay className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-lg text-black">SIM-IFP</span>
          </div>
          <button
            type="button"
            aria-label="Buka menu navigasi"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
