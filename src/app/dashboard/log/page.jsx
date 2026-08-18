'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, CheckCircle2, AlertTriangle, FileCheck, Loader2, Sparkles, Megaphone, Info, X } from 'lucide-react'
import { submitUsageLog } from './actions'
import { getAssets } from '../booking/actions'
import NeoAlertModal from '@/components/NeoAlertModal'
import { createClient } from '@/utils/supabase/client'

export default function LogPenggunaanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assets, setAssets] = useState([])
  const [selectedFileName, setSelectedFileName] = useState('')
  const fileInputRef = useRef(null)
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    async function loadAssets() {
      const data = await getAssets()
      setAssets(data)
    }
    loadAssets()
  }, [])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name)
    } else {
      setSelectedFileName('')
    }
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setSelectedFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target)
      const file = fileInputRef.current?.files?.[0]

      // 1. Direct-to-Storage upload dari client
      if (file && file.size > 0) {
        const supabase = createClient()
        const fileExt = file.name.split('.').pop().toLowerCase()
        const fileName = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
        const filePath = `evidence/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath)
          formData.set('evidence_url', publicUrl)
        }
      }

      // Hapus file binary besar dari form data agar tidak membebani streaming Server Action
      formData.delete('evidence_file')

      const result = await submitUsageLog(formData)

      if (result?.error) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Gagal Menyimpan Log',
          message: result.error,
        })
        setIsSubmitting(false)
      } else {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Log Berhasil Disimpan!',
          message: 'Data dokumentasi penggunaan IFP dan berkas bukti mengajar Anda telah berhasil dicatat ke dalam database sistem.',
        })
        setIsSubmitting(false)
        setSelectedFileName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        e.target.reset()
      }
    } catch (err) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Terjadi Kesalahan',
        message: err.message || 'Gagal terhubung ke database. Silakan coba lagi beberapa saat lagi.',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Neobrutalism Alert Modal Popup */}
      <NeoAlertModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center space-x-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-[#FFE600] text-black border border-black text-[10px] font-black uppercase">
            Buku Tamu Digital
          </span>
          <span className="text-xs font-bold text-gray-500">• SOP-IFP-05</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-black">Log Penggunaan IFP</h1>
        <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
          Isi form dokumentasi ini setiap kali selesai melaksanakan pembelajaran atau tutorial di Lab IFP.
        </p>
      </div>

      {/* Info Petunjuk Guru Non-Informatika */}
      <div className="bg-[#FFFBEB] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-start space-x-3">
        <div className="p-2 bg-[#FFE600] rounded-lg border border-black flex-shrink-0 mt-0.5">
          <Megaphone className="w-4 h-4 text-black stroke-[2.5]" />
        </div>
        <div className="text-xs text-gray-800 space-y-1">
          <p className="font-black text-black uppercase tracking-wider text-[11px]">
            Penggunaan Ruang Laboratorium (Non-Informatika):
          </p>
          <p className="font-semibold leading-relaxed">
            Bagi Bapak/Ibu Guru yang menggunakan lab di luar mapel Informatika, pastikan telah berkoordinasi dengan guru yang terjadwal serta mengisi formulir log ini demi keamanan & pemeliharaan perangkat komputer sekolah.
          </p>
        </div>
      </div>

      {/* Formulir Log Pasca Kelas */}
      <form onSubmit={handleSubmit} className="neo-card p-6 md:p-8 space-y-6 bg-white">
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Nama Guru Pengajar / Tutor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="teacher_name"
              required
              placeholder="Contoh: Budi Santoso, S.Pd."
              className="neo-input w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Perangkat IFP / Ruangan <span className="text-red-500">*</span>
            </label>
            <select
              name="asset_id"
              required
              className="neo-input w-full cursor-pointer text-sm"
            >
              <option value="">-- Pilih Unit Layar IFP yang Digunakan --</option>
              {assets.map((item) => (
                <option key={item.id || item.asset_code} value={item.id || ''}>
                  {item.room_location} ({item.asset_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Mata Pelajaran & Kelas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              required
              placeholder="Contoh: IPA Terpadu Kelas 8B"
              className="neo-input w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Topik / Ringkasan Aktivitas Interaktif Siswa <span className="text-red-500">*</span>
            </label>
            <textarea
              name="topic"
              required
              rows={3}
              placeholder="Jelaskan secara singkat materi interaktif yang disampaikan atau aktivitas sentuh siswa di IFP..."
              className="neo-input w-full text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Waktu Mulai Realisasi
              </label>
              <input
                type="time"
                name="start_time"
                className="neo-input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Waktu Selesai Realisasi
              </label>
              <input
                type="time"
                name="end_time"
                className="neo-input w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Unggah Bukti Kegiatan (Foto Siswa / Ekspor Whiteboard IFP)
            </label>
            
            <input 
              ref={fileInputRef}
              id="evidence-upload"
              name="evidence_file"
              type="file" 
              className="hidden" 
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />

            <div 
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              className="border-3 border-dashed border-black rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#FFFDF5] hover:bg-[#FEF9C3] transition-colors cursor-pointer group shadow-[2px_2px_0px_0px_#000] select-none"
            >
              <div className="w-12 h-12 bg-[#FFE600] border-2 border-black rounded-xl flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#000] group-hover:scale-105 transition-transform">
                {selectedFileName ? (
                  <FileCheck className="w-6 h-6 text-black" />
                ) : (
                  <Upload className="w-6 h-6 text-black stroke-[2.5]" />
                )}
              </div>
              <p className="text-xs sm:text-sm font-black text-black">
                {selectedFileName ? (
                  <span className="text-[#065F46] underline break-all">{selectedFileName}</span>
                ) : (
                  'Klik atau seret foto kegiatan mengajar di sini'
                )}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">
                Format didukung: PNG, JPG, JPEG, PDF (Maksimal 10MB)
              </p>

              {selectedFileName && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 border-2 border-black rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Batalkan Pilihan Berkas
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t-2 border-black flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="neo-btn-primary px-8 py-3 text-sm font-black shadow-[4px_4px_0px_0px_#000]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan Log...
              </>
            ) : (
              'Simpan Log Penggunaan'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
