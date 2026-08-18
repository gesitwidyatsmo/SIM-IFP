'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, ArrowLeft, FileCheck, Loader2, X, User } from 'lucide-react'
import Link from 'next/link'
import { uploadMedia } from '../actions'
import NeoAlertModal from '@/components/NeoAlertModal'
import { createClient } from '@/utils/supabase/client'

export default function UploadMediaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [authorName, setAuthorName] = useState('')
  const fileInputRef = useRef(null)
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    async function loadUserProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()
        if (prof?.full_name) {
          setAuthorName(prof.full_name)
        }
      }
    }
    loadUserProfile()
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

      if (!file || file.size === 0) {
        setModalState({
          isOpen: true,
          type: 'warning',
          title: 'Berkas Belum Dipilih',
          message: 'Silakan pilih berkas modul / presentasi / video pembelajaran yang ingin diunggah.',
        })
        setIsSubmitting(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Direct-to-Storage upload dari client ke Supabase Storage
      const fileNameOriginal = file.name || 'file.pdf'
      const fileExt = fileNameOriginal.split('.').pop().toLowerCase()
      let fileType = 'pdf'
      if (['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(fileExt)) {
        fileType = 'video'
      } else if (['ppt', 'pptx', 'key'].includes(fileExt)) {
        fileType = 'ppt'
      }

      const safeFileName = `${user?.id || 'anon'}-${Date.now()}-${fileNameOriginal.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `materials/${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      let fileUrl = ''
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)
        fileUrl = publicUrl
      } else {
        console.warn('Storage upload note:', uploadError.message)
        fileUrl = `/uploads/${safeFileName}`
      }

      formData.set('file_url', fileUrl)
      formData.set('file_type', fileType)
      formData.delete('media_file') // Hapus binary besar dari form data

      const result = await uploadMedia(formData)

      if (result?.error) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Gagal Mengunggah Berkas',
          message: result.error,
        })
        setIsSubmitting(false)
      } else {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Bahan Ajar Berhasil Diunggah!',
          message: 'Berkas berhasil dikirim dan sekarang masuk antrean verifikasi Waka Kurikulum.',
        })
        setIsSubmitting(false)
      }
    } catch (err) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Terjadi Kesalahan Server',
        message: err.message || 'Gagal mengunggah berkas. Silakan coba lagi.',
      })
      setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
    if (modalState.type === 'success') {
      router.push('/dashboard/repository')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <NeoAlertModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={handleModalClose}
        actionText={modalState.type === 'success' ? 'Lihat Repositori' : 'Tutup'}
      />

      <div className="flex items-center space-x-3">
        <Link 
          href="/dashboard/repository" 
          className="p-2.5 bg-white hover:bg-[#F4EFE6] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-black"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-black">Unggah Bahan Ajar Interaktif</h1>
          <p className="text-xs font-bold text-gray-600">
            Berkas yang Anda unggah akan melalui proses verifikasi kelayakan materi oleh Waka Kurikulum.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="neo-card p-6 md:p-8 space-y-6 bg-white">
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Nama Guru Pengunggah / Pembuat Modul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author_name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              placeholder="Contoh: Dewi Ainun Nikmah, S.Pd. / Budi Santoso"
              className="neo-input w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Judul Modul / Bahan Ajar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="Contoh: Modul Interaktif Struktur Sel & Jaringan Tumbuhan"
              className="neo-input w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select name="subject" required className="neo-input w-full cursor-pointer text-sm">
                <option value="">-- Pilih Mata Pelajaran --</option>
                
                <optgroup label="MIPA & Teknologi">
                  <option value="Informatika">Informatika / TIK</option>
                  <option value="Matematika">Matematika / Matematika Umum</option>
                  <option value="Matematika Tingkat Lanjut">Matematika Tingkat Lanjut</option>
                  <option value="IPA">IPA Terpadu (SMP)</option>
                  <option value="Biologi">Biologi (SMA)</option>
                  <option value="Fisika">Fisika (SMA)</option>
                  <option value="Kimia">Kimia (SMA)</option>
                </optgroup>

                <optgroup label="Bahasa & Sastra">
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="Bahasa Inggris Tingkat Lanjut">Bahasa Inggris Tingkat Lanjut</option>
                  <option value="Bahasa Arab">Bahasa Arab</option>
                </optgroup>

                <optgroup label="Sosial, Kebangsaan & Sejarah">
                  <option value="Pendidikan Pancasila (PPKn)">Pendidikan Pancasila (PPKn)</option>
                  <option value="Sejarah Indonesia">Sejarah Indonesia / Sejarah</option>
                  <option value="IPS">IPS Terpadu (SMP)</option>
                  <option value="Ekonomi">Ekonomi (SMA)</option>
                  <option value="Geografi">Geografi (SMA)</option>
                  <option value="Sosiologi">Sosiologi (SMA)</option>
                </optgroup>

                <optgroup label="Pendidikan Agama & Kepesantrenan">
                  <option value="PABP (Pendidikan Agama Islam)">PABP (Pendidikan Agama Islam)</option>
                  <option value="Aswaja">Aswaja</option>
                  <option value="BMK (Bimbingan Membaca Kitab)">BMK (Bimbingan Membaca Kitab)</option>
                  <option value="Khot (Kaligrafi)">Khot (Kaligrafi)</option>
                </optgroup>

                <optgroup label="Seni, Olahraga & Muatan Lokal">
                  <option value="Seni Rupa / Seni Budaya">Seni Rupa / Seni Budaya</option>
                  <option value="PJOK">PJOK</option>
                  <option value="Budaya Melayu Riau (BMR)">Budaya Melayu Riau (BMR)</option>
                  <option value="Lainnya">Lainnya</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
                Tingkat Kelas <span className="text-red-500">*</span>
              </label>
              <select name="grade_level" required className="neo-input w-full cursor-pointer text-sm">
                <option value="">-- Pilih Tingkat Kelas --</option>
                <optgroup label="Tingkat SMP (Fase D)">
                  <option value="Kelas 7">Kelas 7 (SMP)</option>
                  <option value="Kelas 8">Kelas 8 (SMP)</option>
                  <option value="Kelas 9">Kelas 9 (SMP)</option>
                </optgroup>
                <optgroup label="Tingkat SMAIT (Fase E & F)">
                  <option value="Kelas 10">Kelas 10 (SMAIT)</option>
                  <option value="Kelas 11">Kelas 11 (SMAIT)</option>
                  <option value="Kelas 12">Kelas 12 (SMAIT)</option>
                </optgroup>
                <optgroup label="Lintas Tingkat">
                  <option value="Umum / Semua Tingkat">Umum / Semua Tingkat</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Berkas Bahan Ajar <span className="text-red-500">*</span>
            </label>

            <input 
              ref={fileInputRef}
              id="media-file-upload"
              name="media_file"
              type="file" 
              className="hidden" 
              accept=".pdf,.pptx,.ppt,.mp4,.mov,.key" 
              required 
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
              className="border-3 border-dashed border-black rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#FFFDF5] hover:bg-[#FEF9C3] transition-colors cursor-pointer group shadow-[2px_2px_0px_0px_#000] select-none"
            >
              <div className="w-12 h-12 bg-[#FB923C] border-2 border-black rounded-xl flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#000] group-hover:scale-105 transition-transform">
                {selectedFileName ? (
                  <FileCheck className="w-6 h-6 text-white" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-white stroke-[2.5]" />
                )}
              </div>
              <p className="text-xs sm:text-sm font-black text-black">
                {selectedFileName ? (
                  <span className="text-[#065F46] underline break-all">{selectedFileName}</span>
                ) : (
                  'Seret berkas ke sini, atau klik untuk memilih dari perangkat'
                )}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">
                Format: PDF, PPTX, PPT, MP4 (Maksimal 50MB)
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

        <div className="pt-4 border-t-2 border-black flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="neo-btn-primary px-8 py-3 text-sm font-black shadow-[4px_4px_0px_0px_#000]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengunggah Berkas ke Cloud... (Mohon Tunggu)
              </>
            ) : (
              'Unggah Bahan Ajar'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
