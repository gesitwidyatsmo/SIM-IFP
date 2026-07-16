'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Calendar({ initialBookings = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()
  
  // Menyesuaikan agar Senin menjadi hari pertama (0)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const handleSelectDate = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  // Fungsi untuk mengganti hari dari header panel kanan
  const prevDay = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1))
    // Opsional: Jika hari berpindah ke bulan sebelumnya, update kalender kiri
    if (selectedDate.getDate() === 1) prevMonth()
  }
  
  const nextDay = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1))
    // Opsional: Jika hari berpindah ke bulan berikutnya, update kalender kiri
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
    if (selectedDate.getDate() === lastDayOfMonth) nextMonth()
  }

  // Format tanggal ke string YYYY-MM-DD agar sama dengan SQL Date
  const getDateString = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const todayStr = getDateString(new Date())
  const selectedStr = getDateString(selectedDate)

  // Mengubah data bookings dari Supabase menjadi struktur events yang diharapkan UI
  const realEvents = {}
  
  initialBookings.forEach(booking => {
    const dateStr = booking.date // format SQL 'YYYY-MM-DD'
    if (!realEvents[dateStr]) {
      realEvents[dateStr] = []
    }
    
    // Potong detik dari waktu (misal '08:30:00' jadi '08:30')
    const start = booking.start_time ? booking.start_time.substring(0, 5) : ''
    const end = booking.end_time ? booking.end_time.substring(0, 5) : ''
    
    // Bentuk subtitle: Lokasi - Mapel (Kelas) atau fallback ke Kategori
    let subtitleText = booking.asset
    if (booking.subject && booking.class_name) {
      subtitleText += ` - ${booking.subject} (${booking.class_name})`
    } else if (booking.subject) {
      subtitleText += ` - ${booking.subject}`
    } else if (booking.class_name) {
      subtitleText += ` - ${booking.category} (${booking.class_name})`
    } else {
      subtitleText += ` - ${booking.category}`
    }

    realEvents[dateStr].push({
      id: booking.id,
      timeRange: `${start}~${end}`,
      title: booking.title,
      subtitle: subtitleText
    })
  })


  return (
    <div className="glass-card flex flex-col lg:flex-row overflow-hidden border-border w-full">
      
      {/* Panel Kiri - Tampilan Kalender Bulanan */}
      <div className="w-full lg:w-1/2 p-6 lg:border-r border-border bg-surface/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-foreground">
            {monthNames[currentDate.getMonth()]} <span className="text-zinc-500 font-normal">{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-zinc-400 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-zinc-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4 mb-4">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2">
          {Array.from({ length: adjustedFirstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-12" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateStr = getDateString(dateObj)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedStr
            const hasEvents = realEvents[dateStr] && realEvents[dateStr].length > 0

            return (
              <div 
                key={day} 
                className="flex flex-col items-center justify-center h-12 relative group cursor-pointer" 
                onClick={() => handleSelectDate(day)}
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                  isSelected ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/40' : 
                  isToday ? 'bg-surface-hover text-primary-400 border border-primary-500/30' : 
                  'text-zinc-300 group-hover:bg-surface-hover group-hover:text-zinc-100'
                }`}>
                  {day}
                </div>
                
                {/* Indikator Dot di bawah tanggal */}
                {hasEvents && !isSelected && (
                  <div className="flex space-x-1 absolute bottom-0">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Panel Kanan - Tampilan Detail Event Harian */}
      <div className="w-full lg:w-1/2 p-6 bg-surface-hover/20">
        
        {/* Header Navigasi Hari dengan panah kiri kanan */}
        <div className="flex items-center justify-between mb-8 lg:justify-start lg:space-x-4">
          <button onClick={prevDay} className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-zinc-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-xl font-bold text-foreground text-center flex-1 lg:flex-none">
            {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
          </h3>
          
          <button onClick={nextDay} className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-zinc-400 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pb-10">
          {realEvents[selectedStr] && realEvents[selectedStr].length > 0 ? (
            realEvents[selectedStr].map((event) => (
              <div 
                key={event.id}
                className="bg-surface/50 border border-border/50 rounded-2xl p-5 hover:bg-surface transition-colors"
              >
                {/* Bagian Waktu dengan Ikon Lingkaran */}
                <div className="flex items-center text-zinc-400 text-sm font-medium mb-3">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 mr-2"></div>
                  {event.timeRange || "00:00"}
                </div>
                
                {/* Judul Event */}
                <h4 className="text-lg font-bold text-zinc-100 mb-1">
                  {event.title}
                </h4>
                
                {/* Subtitle/Deskripsi Event */}
                {event.subtitle && (
                  <p className="text-sm text-zinc-500">
                    {event.subtitle}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-zinc-500">
              Tidak ada jadwal untuk tanggal ini.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
