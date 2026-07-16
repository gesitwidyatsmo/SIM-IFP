'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowLeft, CheckCircle, CalendarDays, AlertTriangle, Clock, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { submitBooking, checkAvailability } from './actions'

export default function BookingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // State untuk otomatisasi waktu JP
  const [asset, setAsset] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startJp, setStartJp] = useState(1)
  const [duration, setDuration] = useState(1)

  // State untuk validasi bentrok real-time
  const [isAvailable, setIsAvailable] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  // Definisi Jadwal
  const scheduleA = [
    { jp: 1, start: '07:15', end: '07:55' },
    { jp: 2, start: '07:55', end: '08:35' },
    { jp: 3, start: '08:35', end: '09:15' },
    { jp: 4, start: '09:15', end: '09:55' },
    { jp: 5, start: '10:15', end: '10:55' },
    { jp: 6, start: '10:55', end: '11:35' },
    { jp: 7, start: '11:35', end: '12:15' },
  ]

  const scheduleB = [
    { jp: 1, start: '07:15', end: '07:55' },
    { jp: 2, start: '07:55', end: '08:35' },
    { jp: 3, start: '08:35', end: '09:15' },
    { jp: 4, start: '09:35', end: '10:15' },
    { jp: 5, start: '10:15', end: '10:55' },
    { jp: 6, start: '10:55', end: '11:35' },
    { jp: 7, start: '11:35', end: '12:15' },
  ]

  // Logika mendeteksi jadwal mana yang digunakan
  const { isFriday, activeSchedule, calculatedStartTime, calculatedEndTime } = useMemo(() => {
    if (!selectedDate) return { isFriday: false, activeSchedule: null, calculatedStartTime: '', calculatedEndTime: '' }
    
    const dateObj = new Date(selectedDate)
    const day = dateObj.getDay() // 0 = Minggu (Ahad), 1-6 = Senin-Sabtu

    let schedule = null
    let friday = false

    if (day === 5) {
      friday = true
    } else if (day === 0) {
      schedule = scheduleB
    } else {
      schedule = scheduleA
    }

    let startStr = ''
    let endStr = ''

    if (schedule && startJp && duration) {
      const startIndex = startJp - 1
      const endIndex = startIndex + duration - 1
      
      if (schedule[startIndex] && schedule[endIndex]) {
        startStr = schedule[startIndex].start
        endStr = schedule[endIndex].end
      }
    }

    return { 
      isFriday: friday, 
      activeSchedule: schedule, 
      calculatedStartTime: startStr, 
      calculatedEndTime: endStr 
    }
  }, [selectedDate, startJp, duration])

  // Effect untuk mengecek ketersediaan saat input berubah
  useEffect(() => {
    async function check() {
      if (!asset || !selectedDate || !calculatedStartTime || !calculatedEndTime || isFriday) {
        setIsAvailable(true)
        return
      }

      setIsChecking(true)
      const result = await checkAvailability(asset, selectedDate, calculatedStartTime, calculatedEndTime)
      setIsAvailable(result.isAvailable)
      setIsChecking(false)
    }

    check()
  }, [asset, selectedDate, calculatedStartTime, calculatedEndTime, isFriday])


  const handleAction = async (formData) => {
    if (isFriday) {
      setErrorMessage("Hari Jumat libur, tidak dapat melakukan booking.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setIsSuccess(false)
    
    // Tambahkan calculated time ke form data secara manual karena di UI disembunyikan
    formData.append('start_time', calculatedStartTime)
    formData.append('end_time', calculatedEndTime)

    const result = await submitBooking(formData)
    
    if (result.error) {
      setErrorMessage(result.error)
      setIsSubmitting(false)
    } else {
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  // Maksimal pilihan durasi menyesuaikan sisa jam pelajaran
  const maxDuration = activeSchedule ? 7 - startJp + 1 : 1

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Form Booking IFP</h1>
          <p className="text-zinc-400 mt-1">
            Isi detail di bawah ini untuk meminjam perangkat Interactive Flat Panel.
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="glass bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl flex items-center text-emerald-400 font-medium">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          Booking berhasil dikirim! Anda akan dialihkan ke halaman utama...
        </div>
      )}

      {errorMessage && (
        <div className="glass bg-red-500/10 border-red-500/20 p-4 rounded-xl flex items-center text-red-400 font-medium">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <form action={handleAction} className="glass-card p-6 md:p-8 space-y-8 border-t-4 border-t-primary-500">
        
        {/* Section 1: Lokasi Aset */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-200 border-b border-border pb-2">1. Pilih Aset / Lokasi</h2>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Perangkat IFP
            </label>
            <select 
              name="asset" 
              required 
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Silakan Pilih --</option>
              <option value="IFP-LAB-PUTRA">IFP Lab Putra</option>
              <option value="IFP-LAB-PUTRI">IFP Lab Putri</option>
            </select>
          </div>
        </div>

        {/* Section 2: Waktu Pelaksanaan Otomatis */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-200 border-b border-border pb-2">2. Waktu Pelaksanaan (Jam Pelajaran)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Tanggal Booking
              </label>
              <input 
                type="date"
                name="date" 
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all [color-scheme:dark]"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Mulai Jam Ke-
              </label>
              <select 
                value={startJp} 
                onChange={(e) => setStartJp(Number(e.target.value))}
                disabled={isFriday || !selectedDate}
                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                {[1,2,3,4,5,6,7].map(num => (
                  <option key={`start-${num}`} value={num}>JP {num}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Durasi Penggunaan
              </label>
              <select 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isFriday || !selectedDate}
                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                {Array.from({ length: maxDuration }).map((_, idx) => (
                  <option key={`duration-${idx+1}`} value={idx+1}>{idx+1} Jam Pelajaran</option>
                ))}
              </select>
            </div>
          </div>

          {/* Menampilkan Peringatan atau Hasil Perhitungan */}
          {isFriday && (
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start mt-2">
               <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-red-400 font-medium">Hari Jumat Libur. Anda tidak dapat melakukan booking pada hari Jumat.</p>
             </div>
          )}

          {!isFriday && activeSchedule && calculatedStartTime && calculatedEndTime && asset && (
             <div className={`p-4 rounded-lg flex items-center justify-between mt-2 border transition-colors ${
               isChecking ? 'bg-zinc-800/50 border-zinc-700' :
               isAvailable ? 'bg-primary-900/20 border-primary-500/30' : 'bg-red-500/10 border-red-500/30'
             }`}>
               <div className="flex items-center">
                 {isChecking ? (
                   <Loader2 className="w-5 h-5 mr-3 text-zinc-400 animate-spin" />
                 ) : isAvailable ? (
                   <Clock className="w-5 h-5 mr-3 text-primary-300" />
                 ) : (
                   <XCircle className="w-5 h-5 mr-3 text-red-400" />
                 )}
                 <div>
                   <p className={`text-xs uppercase font-bold tracking-wider mb-0.5 ${isChecking ? 'text-zinc-500' : isAvailable ? 'text-primary-400/80' : 'text-red-400/80'}`}>
                     {isChecking ? 'Mengecek ketersediaan...' : isAvailable ? 'Waktu Booking Tersedia' : 'Jadwal Bentrok / Sudah Dipesan'}
                   </p>
                   <p className={`font-medium ${isChecking ? 'text-zinc-300' : isAvailable ? 'text-primary-300' : 'text-red-300'}`}>
                     {calculatedStartTime} — {calculatedEndTime}
                   </p>
                 </div>
               </div>
               <div className="text-right">
                  <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded ${
                    isChecking ? 'bg-zinc-800 text-zinc-400' :
                    isAvailable ? 'bg-primary-500/20 text-primary-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {duration} JP
                  </span>
               </div>
             </div>
          )}
        </div>

        {/* Section 3: Detail Kegiatan */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-200 border-b border-border pb-2">3. Detail Kegiatan</h2>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Kategori Kegiatan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Pembelajaran', 'Ekstrakurikuler', 'Rapat Guru', 'Lainnya'].map((cat) => (
                <label key={cat} className="cursor-pointer">
                  <input type="radio" name="category" value={cat} className="peer sr-only" required />
                  <div className="text-center px-3 py-2 rounded-lg border border-border peer-checked:bg-primary-500/20 peer-checked:border-primary-500 peer-checked:text-primary-300 text-zinc-400 text-sm font-medium transition-colors">
                    {cat}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Kelas
              </label>
              <input 
                type="text" 
                name="class_name"
                placeholder="Contoh: 9A"
                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Mata Pelajaran
              </label>
              <input 
                type="text" 
                name="subject"
                placeholder="Contoh: Matematika"
                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Topik / Judul Kegiatan
            </label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="Contoh: Praktikum Fisika Kelas 9"
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Catatan Khusus (Opsional)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Ada kebutuhan alat tambahan atau permintaan khusus?"
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isFriday || !selectedDate || !isAvailable || isChecking || !asset}
            className={`flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20 ${
              (isSubmitting || isFriday || !selectedDate || !isAvailable || isChecking || !asset) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              'Memproses...'
            ) : (
              <>
                <CalendarDays className="w-5 h-5 mr-2" />
                Ajukan Jadwal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
