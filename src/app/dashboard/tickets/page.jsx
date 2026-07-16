import Link from 'next/link'
import { Plus, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

export default function TicketsPage() {
  const dummyTickets = [
    { id: 'TKT-001', asset: 'IFP-01 (Ruang Kelas 7A)', issue: 'Layar sentuh tidak responsif di bagian pojok kanan atas.', status: 'OPEN', reporter: 'Budi Santoso', date: '2026-07-16' },
    { id: 'TKT-002', asset: 'IFP-03 (Lab Komputer)', issue: 'Kabel HDMI tidak terdeteksi saat disambungkan ke laptop.', status: 'IN_PROGRESS', reporter: 'Siti Aminah', date: '2026-07-15' },
    { id: 'TKT-003', asset: 'IFP-05 (Ruang Guru)', issue: 'Suara speaker pecah saat volume maksimal.', status: 'CLOSED', reporter: 'Andi Wijaya', date: '2026-07-14' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan Kerusakan</h1>
          <p className="text-zinc-400 mt-1">Pantau dan kelola laporan masalah teknis pada aset IFP.</p>
        </div>
        
        <Link 
          href="/dashboard/tickets/create"
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-red-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Laporan
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Cari ID tiket atau aset..." 
          className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
      </div>

      <div className="grid gap-4">
        {dummyTickets.map((ticket) => (
          <div key={ticket.id} className="glass-card p-5 hover:border-primary-500/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-xs font-mono font-semibold text-zinc-400">{ticket.id}</span>
                {ticket.status === 'OPEN' && (
                  <span className="flex items-center text-[10px] font-bold px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" /> TERBUKA
                  </span>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                  <span className="flex items-center text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="w-3 h-3 mr-1" /> DIPROSES
                  </span>
                )}
                {ticket.status === 'CLOSED' && (
                  <span className="flex items-center text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> SELESAI
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">{ticket.asset}</h3>
              <p className="text-sm text-zinc-300">{ticket.issue}</p>
            </div>
            
            <div className="text-left md:text-right text-sm">
              <p className="text-zinc-400">Dilaporkan oleh:</p>
              <p className="font-medium text-zinc-200">{ticket.reporter}</p>
              <p className="text-xs text-zinc-500 mt-1">{ticket.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
