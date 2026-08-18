'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, User, BookOpen, Clock, Sparkles } from 'lucide-react'

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

  const prevMonth = () => {
    const newMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    setCurrentDate(newMonth)
    setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1))
  }

  const nextMonth = () => {
    const newMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    setCurrentDate(newMonth)
    setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1))
  }

  const handleSelectDate = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  const prevDay = () => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1)
    setSelectedDate(newDate)
    if (newDate.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1))
    }
  }
  
  const nextDay = () => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
    setSelectedDate(newDate)
    if (newDate.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1))
    }
  }

  // Format tanggal ke string YYYY-MM-DD
  const getDateString = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const todayStr = getDateString(new Date())
  const selectedStr = getDateString(selectedDate)

  // Map schedules ke event structure
  const realEvents = {}
  
  initialBookings.forEach(booking => {
    let dateStr = booking.date
    let start = '07:15'
    let end = '08:35'

    if (booking.start_time) {
      if (booking.start_time.includes('T')) {
        const d = new Date(booking.start_time)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        if (!dateStr) dateStr = `${year}-${month}-${day}`
        const hours = String(d.getHours()).padStart(2, '0')
        const mins = String(d.getMinutes()).padStart(2, '0')
        start = `${hours}:${mins}`
      } else {
        start = booking.start_time.substring(0, 5)
      }
    }

    if (booking.end_time) {
      if (booking.end_time.includes('T')) {
        const d = new Date(booking.end_time)
        const hours = String(d.getHours()).padStart(2, '0')
        const mins = String(d.getMinutes()).padStart(2, '0')
        end = `${hours}:${mins}`
      } else {
        end = booking.end_time.substring(0, 5)
      }
    }

    if (!dateStr) return

    if (!realEvents[dateStr]) {
      realEvents[dateStr] = []
    }
    
    const roomName = booking.ifp_assets?.room_location || booking.ifp_assets?.asset_code || booking.asset || 'Lab IFP'
    let teacherName = booking.profiles?.full_name
    if (!teacherName && booking.notes && booking.notes.includes('Guru:')) {
      const match = booking.notes.match(/Guru:\s*([^|]+)/)
      if (match) teacherName = match[1].trim()
    }
    if (!teacherName) teacherName = 'Guru'

    realEvents[dateStr].push({
      id: booking.id,
      timeRange: `${start} - ${end}`,
      title: booking.title,
      room: roomName,
      subject: booking.subject,
      className: booking.class_name,
      category: booking.category || 'Pembelajaran',
      type: booking.type || 'REGULER_INDUK',
      teacher: teacherName,
      notes: booking.notes,
    })
  })

  const isSelectedFriday = selectedDate.getDay() === 5

  return (
    <div className="neo-card flex flex-col lg:flex-row overflow-hidden bg-white">
      
      {/* Panel Kiri - Tampilan Kalender Bulanan */}
      <div className="w-full lg:w-1/2 p-6 lg:border-r-[2.5px] border-b-[2.5px] lg:border-b-0 border-black bg-[#FFFDF5]">
        <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-black">
          <div>
            <h2 className="text-xl font-black text-black">
              {monthNames[currentDate.getMonth()]} <span className="text-gray-500 font-bold">{currentDate.getFullYear()}</span>
            </h2>
            <p className="text-[11px] font-bold text-gray-500">Pilih tanggal untuk melihat rincian sesi</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={prevMonth} 
              aria-label="Bulan Sebelumnya"
              className="p-2 rounded-xl bg-white hover:bg-[#F4EFE6] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-black stroke-[3]" />
            </button>
            <button 
              onClick={nextMonth} 
              aria-label="Bulan Berikutnya"
              className="p-2 rounded-xl bg-white hover:bg-[#F4EFE6] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-black stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 mb-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
            <div 
              key={day} 
              className={`text-center text-xs font-black uppercase tracking-wider py-1 ${
                idx === 4 ? 'text-[#EF4444]' : idx === 6 ? 'text-[#10B981]' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: adjustedFirstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-11 sm:h-12" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateStr = getDateString(dateObj)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedStr
            const hasEvents = realEvents[dateStr] && realEvents[dateStr].length > 0
            const dayOfWeek = dateObj.getDay()
            const isFriday = dayOfWeek === 5

            return (
              <div 
                key={day} 
                className="flex flex-col items-center justify-center h-11 sm:h-12 relative cursor-pointer" 
                onClick={() => handleSelectDate(day)}
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-extrabold transition-all ${
                  isSelected 
                    ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5' 
                    : isToday 
                    ? 'bg-[#DBEAFE] text-[#1E40AF] border-2 border-black' 
                    : isFriday
                    ? 'text-gray-400 hover:bg-[#FEE2E2] rounded-lg'
                    : 'text-gray-900 hover:bg-white hover:border-2 hover:border-black hover:shadow-[2px_2px_0px_0px_#000]'
                }`}>
                  {day}
                </div>
                
                {/* Indikator Dot Sesi */}
                {hasEvents && !isSelected && (
                  <div className="flex space-x-1 absolute bottom-0.5">
                    <div className="w-1.5 h-1.5 bg-[#121212] rounded-full"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-3 border-t-2 border-black/10 flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-600">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-[#FFE600] border border-black rounded"></div>
            <span>Terpilih</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-[#DBEAFE] border border-black rounded"></div>
            <span>Hari Ini</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            <span>Ada Sesi Jadwal</span>
          </div>
        </div>
      </div>

      {/* Panel Kanan - Tampilan Detail Event Harian */}
      <div className="w-full lg:w-1/2 p-6 bg-white">
        
        {/* Header Navigasi Hari */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-black">
          <button 
            onClick={prevDay} 
            aria-label="Hari Sebelumnya"
            className="p-1.5 rounded-lg bg-white hover:bg-[#F4EFE6] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-black stroke-[3]" />
          </button>
          
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-black text-black">
              {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            {isSelectedFriday && (
              <span className="neo-stamp neo-stamp-danger text-[10px] mt-0.5">
                LIBUR PEMBELAJARAN
              </span>
            )}
          </div>
          
          <button 
            onClick={nextDay} 
            aria-label="Hari Berikutnya"
            className="p-1.5 rounded-lg bg-white hover:bg-[#F4EFE6] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-black stroke-[3]" />
          </button>
        </div>

        {/* List Sesi Kegiatan */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {isSelectedFriday ? (
            <div className="bg-holiday-stripes border-2 border-black rounded-xl p-8 text-center">
              <p className="font-black text-sm text-[#991B1B]">HARI JUMAT LIBUR</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">
                Tidak ada alokasi jam pelajaran dan penggunaan reguler IFP pada hari Jumat.
              </p>
            </div>
          ) : realEvents[selectedStr] && realEvents[selectedStr].length > 0 ? (
            realEvents[selectedStr].map((event) => {
              const isTerbuka = event.type === 'TUTORIAL_TERBUKA'
              
              return (
                <div 
                  key={event.id}
                  className={`p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all ${
                    isTerbuka ? 'bg-[#ECFDF5]' : 'bg-[#FFFDF5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-black text-white font-mono text-xs font-bold">
                      <Clock className="w-3 h-3 mr-1 text-[#FFE600]" />
                      {event.timeRange}
                    </div>
                    
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                      isTerbuka ? 'bg-[#10B981] text-white' : 'bg-[#FFE600] text-black'
                    }`}>
                      {isTerbuka ? 'Kelas Terbuka' : (event.category || 'Pembelajaran')}
                    </span>
                  </div>
                  
                  <h4 className="text-base font-black text-black leading-snug mb-2">
                    {event.title}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-gray-700 pt-2 border-t border-black/10">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-black flex-shrink-0" />
                      <span className="truncate">{event.room}</span>
                    </div>
                    
                    {event.subject && (
                      <div className="flex items-center">
                        <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#3B82F6] flex-shrink-0" />
                        <span className="truncate">{event.subject} {event.className ? `(${event.className})` : ''}</span>
                      </div>
                    )}

                    <div className="flex items-center sm:col-span-2">
                      <User className="w-3.5 h-3.5 mr-1.5 text-black flex-shrink-0" />
                      <span className="truncate">Guru: {event.teacher}</span>
                    </div>
                  </div>

                  {event.notes && (
                    <div className="mt-2 text-xs font-medium text-gray-800 bg-white p-2 rounded-lg border border-black">
                      <span className="font-bold">Catatan:</span> {event.notes}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-16 px-4 bg-[#F4EFE6] border-2 border-dashed border-black/30 rounded-xl">
              <Sparkles className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-bold text-black">Belum Ada Jadwal</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Ruang Lab IFP bebas dan tersedia untuk dialokasikan pada tanggal ini.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
