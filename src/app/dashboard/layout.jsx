'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, ClipboardList, Settings, MonitorPlay, LogOut, Library, CheckSquare, AlertTriangle, GraduationCap, BarChart3, Menu, X } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Jadwal & Booking', href: '/dashboard', icon: Calendar, exact: true },
    { name: 'Dashboard Monev', href: '/dashboard/monev', icon: BarChart3 },
    { name: 'Log Penggunaan', href: '/dashboard/log', icon: ClipboardList },
    { name: 'Repositori Media', href: '/dashboard/repository', icon: Library },
    { name: 'Validasi Materi', href: '/dashboard/validation', icon: CheckSquare },
    { name: 'Laporan Kerusakan', href: '/dashboard/tickets', icon: AlertTriangle },
    { name: 'Pelatihan Guru', href: '/dashboard/training', icon: GraduationCap },
    { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ isolation: 'isolate' }}>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {/* PENTING: pointer-events-none saat tutup agar tidak memblokir touch di mobile */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 glass border-r border-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:pointer-events-auto ${isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}`}>
        <button 
          className="md:hidden absolute top-4 right-4 text-zinc-400 hover:text-zinc-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <MonitorPlay className="w-6 h-6 text-primary-400 mr-2" />
          <span className="font-bold text-lg text-gradient">SIM-IFP</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20' 
                      : 'text-zinc-400 hover:bg-surface-hover hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-accent-500" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-zinc-200">Guru</p>
              <p className="text-xs text-zinc-500 truncate">guru@sekolah.com</p>
            </div>
            <button className="text-zinc-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ position: 'relative', zIndex: 0 }}>
        {/* Background Accents — decorative only, zero z-index, no pointer events */}
        <div 
          aria-hidden="true"
          style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} 
        />
        <div 
          aria-hidden="true"
          style={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} 
        />
        
        {/* Mobile Header */}
        {/* Tidak pakai .glass agar backdrop-blur tidak memblokir touch events di Android */}
        <header
          className="md:hidden border-b border-border flex items-center justify-between px-4"
          style={{
            position: 'relative',
            zIndex: 30,
            flexShrink: 0,
            height: 64,
            backgroundColor: 'rgba(9,9,11,0.95)',
          }}
        >
          <div className="flex items-center">
            <MonitorPlay className="w-6 h-6 text-primary-400 mr-2" />
            <span className="font-bold text-lg text-gradient">SIM-IFP</span>
          </div>
          {/* Hamburger — type=button wajib, onPointerDown lebih cepat dari onClick di mobile */}
          <button
            type="button"
            aria-label="Buka menu navigasi"
            onPointerDown={(e) => { e.stopPropagation(); setIsMobileMenuOpen(true) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              marginRight: -8,
              flexShrink: 0,
            }}
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
