import Link from 'next/link'
import Calendar from '@/components/Calendar'
import { Plus, CalendarDays, CheckCircle2, Clock, Sparkles, BookOpen, Megaphone, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardHome() {
  const supabase = await createClient()
  
  // Periksa status Admin
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false

  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    
    if (prof?.role === 'ADMIN' || prof?.role === 'KEPALA_SEKOLAH') {
      isAdmin = true
    }
  }

  let schedules = []

  // 1. Ambil dari tabel schedules
  const res = await supabase
    .from('schedules')
    .select(`
      id,
      title,
      start_time,
      end_time,
      category,
      subject,
      class_name,
      status,
      type,
      notes,
      ifp_assets (
        asset_code,
        room_location
      ),
      profiles (
        full_name
      )
    `)
    .neq('status', 'REJECTED')
    .order('start_time', { ascending: true })

  if (!res.error && res.data) {
    schedules = res.data
  } else {
    // 2. Fallback flat
    const flatRes = await supabase
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: true })

    if (!flatRes.error && flatRes.data) {
      schedules = flatRes.data
    } else {
      // 3. Fallback legacy
      const legacyRes = await supabase.from('bookings').select('*')
      if (!legacyRes.error && legacyRes.data) {
        schedules = legacyRes.data
      }
    }
  }

  const safeSchedules = schedules || []
  
  // Hitung statistik untuk bulan berjalan
  const now = new Date()
  const currentMonth = now.getMonth() // 0-indexed
  const currentYear = now.getFullYear()

  const schedulesThisMonth = safeSchedules.filter(item => {
    let d = null
    if (item.start_time) {
      d = new Date(item.start_time)
    } else if (item.date) {
      d = new Date(item.date)
    } else if (item.created_at) {
      d = new Date(item.created_at)
    }
    if (!d || isNaN(d.getTime())) return false
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalSesi = schedulesThisMonth.length
  const totalPembelajaran = schedulesThisMonth.filter(b => b.category === 'Pembelajaran' || b.type === 'REGULER_INDUK').length
  const totalInsidental = totalSesi - totalPembelajaran

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
              Jadwal Pemanfaatan IFP
            </h1>
            <span className="neo-stamp neo-stamp-approved">
              ● LIVE KALENDER
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-600">
            Pusat penjadwalan & ketersediaan layar interaktif kelas reguler dan layanan tutorial.
          </p>
        </div>
        
        {isAdmin ? (
          <Link 
            href="/dashboard/booking" 
            className="neo-btn-primary px-5 py-3 text-sm font-black whitespace-nowrap shadow-[3px_3px_0px_0px_#000]"
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            Atur / Tambah Jadwal
          </Link>
        ) : (
          <Link 
            href="/dashboard/log" 
            className="neo-btn-secondary px-4 py-2.5 text-xs font-black whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Isi Log Pasca Kelas
          </Link>
        )}
      </div>

      {/* Bento Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Sesi */}
        <div className="bg-[#FEF08A] p-5 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] flex items-start space-x-4">
          <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <CalendarDays className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-800">Total Bulan Ini</p>
            <p className="text-3xl font-black text-black mt-0.5">{totalSesi} <span className="text-sm font-bold text-gray-700">Sesi</span></p>
          </div>
        </div>

        {/* Pembelajaran Reguler */}
        <div className="bg-[#DBEAFE] p-5 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] flex items-start space-x-4">
          <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <CheckCircle2 className="w-6 h-6 text-[#1E40AF]" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-800">Kelas Reguler</p>
            <p className="text-3xl font-black text-[#1E40AF] mt-0.5">{totalPembelajaran} <span className="text-sm font-bold text-gray-700">Sesi</span></p>
          </div>
        </div>

        {/* Tutorial / Terbuka / Ekskul */}
        <div className="bg-[#D1FAE5] p-5 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] flex items-start space-x-4">
          <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <Clock className="w-6 h-6 text-[#065F46]" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-800">Tutorial & Ekskul</p>
            <p className="text-3xl font-black text-[#065F46] mt-0.5">{totalInsidental} <span className="text-sm font-bold text-gray-700">Sesi</span></p>
          </div>
        </div>
      </div>

      {/* Banner Pemberitahuan Pemanfaatan Laboratorium Non-Informatika */}
      <div className="bg-[#FFFBEB] p-5 sm:p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#FFE600] rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex-shrink-0 mt-0.5">
              <Megaphone className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div className="space-y-2 text-black">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-wider">
                  Pemberitahuan
                </span>
                <h2 className="text-sm sm:text-base font-black">
                  Pemanfaatan Laboratorium IFP / Komputer (Non-Informatika)
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
                Bagi Bapak/Ibu Guru yang ingin menggunakan ruang <strong>Laboratorium IFP/Komputer</strong> di luar mata pelajaran Informatika, mohon untuk:
              </p>
              <ol className="list-decimal list-inside text-xs sm:text-sm font-semibold text-gray-900 space-y-1 bg-white/80 p-3 rounded-xl border-2 border-black/15">
                <li>
                  <strong className="font-black text-black">Berkoordinasi langsung</strong> dengan guru pengajar yang sedang terjadwal pada jam tersebut.
                </li>
                <li>
                  <strong className="font-black text-black">Wajib mengisi riwayat pemakaian</strong> melalui menu <Link href="/dashboard/log" className="underline font-black text-[#1E40AF] hover:text-blue-700">Log Penggunaan IFP</Link> di website ini atau buku tamu fisik di Kantor Lantai 2.
                </li>
              </ol>
              <p className="text-[11px] font-semibold text-gray-600">
                Demi menjaga keamanan, ketertiban, dan pemeliharaan perangkat komputer sekolah. Terima kasih atas kerja sama Bapak/Ibu.
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-full lg:w-auto self-stretch lg:self-center flex items-center">
            <Link
              href="/dashboard/log"
              className="neo-btn-primary w-full lg:w-auto px-5 py-3 text-xs font-black flex items-center justify-center space-x-2 shadow-[3px_3px_0px_0px_#000] whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              <span>Isi Log Penggunaan</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Komponen Kalender Interaktif */}
      <div className="pt-2">
        <Calendar initialBookings={safeSchedules} />
      </div>
    </div>
  )
}
