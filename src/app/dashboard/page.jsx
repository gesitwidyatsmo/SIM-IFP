import Link from 'next/link'
import Calendar from '@/components/Calendar'
import { Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('start_time', { ascending: true })

  const safeBookings = bookings || []
  
  // Hitung statistik untuk bulan ini
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const bookingsThisMonth = safeBookings.filter(b => {
    const d = new Date(b.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalSesi = bookingsThisMonth.length
  const totalPembelajaran = bookingsThisMonth.filter(b => b.category === 'Pembelajaran').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jadwal & Booking</h1>
          <p className="text-zinc-400 mt-1">Kelola dan pantau penggunaan IFP di sekolah.</p>
        </div>
        <Link href="/dashboard/booking" className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20">
          <Plus className="w-4 h-4 mr-2" />
          Booking Ruangan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-400">Total Penggunaan Bulan Ini</p>
          <p className="text-3xl font-bold text-gradient mt-2">{totalSesi} Sesi</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-400">Pembelajaran Reguler</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{totalPembelajaran} Sesi</p>
        </div>
      </div>

      <div className="pt-4">
        <Calendar initialBookings={bookings || []} />
      </div>
    </div>
  )
}
