'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, CalendarDays, AlertTriangle, Clock, XCircle, Loader2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { submitBooking, checkAvailability, getAssets } from './actions'
import { createClient } from '@/utils/supabase/client'

export default function BookingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(true)

  // State untuk form & waktu JP
  const [assetsList, setAssetsList] = useState([])
  const [asset, setAsset] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startJp, setStartJp] = useState(1)
  const [duration, setDuration] = useState(1)

  // State validasi bentrok
  const [isAvailable, setIsAvailable] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  // Cek user login & load assets
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        if (prof?.role === 'ADMIN' || prof?.role === 'KEPALA_SEKOLAH') {
          setIsAdmin(true)
        }
      }

      const data = await getAssets()
      setAssetsList(data)
      if (data.length > 0) {
        setAsset(data[0].id || data[0].asset_code)
      }
    }
    init()
  }, [])

  // Definisi Jadwal JP
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

  // Safe Date Parsing
  const { isFriday, activeSchedule, calculatedStartTime, calculatedEndTime } = useMemo(() => {
    if (!selectedDate) return { isFriday: false, activeSchedule: null, calculatedStartTime: '', calculatedEndTime: '' }
    
    const [year, month, dayNumber] = selectedDate.split('-').map(Number)
    const dateObj = new Date(year, month - 1, dayNumber)
    const dayOfWeek = dateObj.getDay()

    let schedule = null
    let friday = false

    if (dayOfWeek === 5) {
      friday = true
    } else if (dayOfWeek === 0) {
      schedule = scheduleB // Jadwal Khusus Hari Ahad
    } else {
      schedule = scheduleA // Jadwal Reguler (Senin - Kamis, Sabtu)
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
      setErrorMessage("Hari Jumat libur. Tidak dapat menetapkan jadwal pada hari Jumat.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setIsSuccess(false)
    
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
        router.refresh()
      }, 1500)
    }
  }

  const maxDuration = activeSchedule ? 7 - startJp + 1 : 1

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back Link */}
      <div className="flex items-center space-x-3">
        <Link 
          href="/dashboard" 
          className="p-2.5 bg-white hover:bg-[#F4EFE6] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-black"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-black">Atur Jadwal Penggunaan IFP</h1>
          <p className="text-xs font-bold text-gray-600">
            Formulir alokasi pemanfaatan layar interaktif oleh Tim Kurikulum / Administrator.
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-[#FEF08A] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-start text-black">
          <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-black" />
          <div className="text-xs">
            <p className="font-black uppercase tracking-wider">Perhatian Akses</p>
            <p className="font-semibold text-gray-800 mt-0.5">
              Halaman ini diperuntukkan bagi Administrator untuk menetapkan jadwal pemanfaatan IFP. Silakan login sebagai Admin terlebih dahulu.
            </p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="bg-[#D1FAE5] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center text-[#065F46] font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          Jadwal baru berhasil disimpan ke kalender sistem!
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#FEE2E2] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center text-[#991B1B] font-bold text-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Form Container */}
      <form action={handleAction} className="neo-card p-6 md:p-8 space-y-8 bg-white">
        
        {/* Section 1: Lokasi Aset */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b-2 border-black pb-2">
            <span className="w-6 h-6 rounded-md bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xs">1</span>
            <h2 className="text-base font-black text-black">Pilih Unit IFP / Ruangan</h2>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Perangkat Interactive Flat Panel
            </label>
            <select 
              name="asset" 
              required 
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="neo-input w-full cursor-pointer text-sm"
            >
              {assetsList.map((item) => (
                <option key={item.id || item.asset_code} value={item.id || item.asset_code}>
                  {item.room_location} ({item.asset_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Waktu Pelaksanaan */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b-2 border-black pb-2">
            <span className="w-6 h-6 rounded-md bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xs">2</span>
            <h2 className="text-base font-black text-black">Waktu Pelaksanaan (Jam Pelajaran)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Tanggal Pelaksanaan
              </label>
              <input 
                type="date"
                name="date" 
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="neo-input w-full text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Mulai Jam Ke-
              </label>
              <select 
                value={startJp} 
                onChange={(e) => setStartJp(Number(e.target.value))}
                disabled={isFriday || !selectedDate}
                className="neo-input w-full text-sm cursor-pointer disabled:opacity-50"
              >
                {[1,2,3,4,5,6,7].map(num => (
                  <option key={`start-${num}`} value={num}>JP {num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Durasi Penggunaan
              </label>
              <select 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isFriday || !selectedDate}
                className="neo-input w-full text-sm cursor-pointer disabled:opacity-50"
              >
                {Array.from({ length: maxDuration }).map((_, idx) => (
                  <option key={`duration-${idx+1}`} value={idx+1}>{idx+1} Jam Pelajaran</option>
                ))}
              </select>
            </div>
          </div>

          {isFriday && (
             <div className="p-4 bg-holiday-stripes border-2 border-black rounded-xl flex items-start">
               <AlertTriangle className="w-5 h-5 text-[#991B1B] mr-2 flex-shrink-0 mt-0.5" />
               <p className="text-xs font-bold text-[#991B1B]">
                 Hari Jumat Libur. Sistem tidak mengizinkan alokasi jadwal pada hari Jumat.
               </p>
             </div>
          )}

          {!isFriday && activeSchedule && calculatedStartTime && calculatedEndTime && asset && (
             <div className={`p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between transition-colors ${
               isChecking ? 'bg-gray-100' :
               isAvailable ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]'
             }`}>
               <div className="flex items-center">
                 {isChecking ? (
                   <Loader2 className="w-5 h-5 mr-3 text-black animate-spin" />
                 ) : isAvailable ? (
                   <Clock className="w-5 h-5 mr-3 text-[#065F46]" />
                 ) : (
                   <XCircle className="w-5 h-5 mr-3 text-[#991B1B]" />
                 )}
                 <div>
                   <p className={`text-[10px] uppercase font-black tracking-wider ${isChecking ? 'text-gray-600' : isAvailable ? 'text-[#065F46]' : 'text-[#991B1B]'}`}>
                     {isChecking ? 'Mengecek ketersediaan...' : isAvailable ? '✓ Slot Waktu Tersedia' : '⚠ Jadwal Bentrok dengan Sesi Lain'}
                   </p>
                   <p className="font-mono font-bold text-sm text-black">
                     {calculatedStartTime} — {calculatedEndTime}
                   </p>
                 </div>
               </div>
               <div className="text-right">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-black rounded-md bg-black text-white">
                    {duration} JP
                  </span>
               </div>
             </div>
          )}
        </div>

        {/* Section 3: Detail Kegiatan */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b-2 border-black pb-2">
            <span className="w-6 h-6 rounded-md bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xs">3</span>
            <h2 className="text-base font-black text-black">Detail Pembelajaran / Kegiatan</h2>
          </div>
          
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Kategori Kegiatan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Pembelajaran', 'Ekstrakurikuler', 'Rapat Guru', 'Lainnya'].map((cat) => (
                <label key={cat} className="cursor-pointer">
                  <input type="radio" name="category" value={cat} defaultChecked={cat === 'Pembelajaran'} className="peer sr-only" required />
                  <div className="text-center px-3 py-2.5 rounded-xl border-2 border-black peer-checked:bg-[#FFE600] peer-checked:shadow-[3px_3px_0px_0px_#000] peer-checked:font-black text-black text-xs font-bold transition-all bg-white hover:bg-[#F4EFE6]">
                    {cat}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Kelas / Rombel
              </label>
              <input 
                type="text" 
                name="class_name"
                placeholder="Contoh: 7A / 9B / X.1"
                className="neo-input w-full text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Mata Pelajaran
              </label>
              <input 
                type="text" 
                name="subject"
                placeholder="Contoh: IPA / Matematika"
                className="neo-input w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Topik / Judul Pembelajaran <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="Contoh: Praktikum Simulasi Optik & Cermin Cekung"
              className="neo-input w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Catatan Teknis Khusus (Opsional)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Misal: Memerlukan 2 stylus pen tambahan, kabel HDMI audio laptop, atau headset..."
              className="neo-input w-full text-sm resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t-2 border-black flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isFriday || !selectedDate || !isAvailable || isChecking || !asset}
            className="neo-btn-primary px-8 py-3.5 text-sm font-black shadow-[4px_4px_0px_0px_#000]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CalendarDays className="w-5 h-5 mr-2 stroke-[2.5]" />
                Tetapkan Jadwal Resmi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
