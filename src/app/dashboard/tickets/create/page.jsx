'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createTicket } from '../actions'
import { getAssets } from '../../booking/actions'
import NeoAlertModal from '@/components/NeoAlertModal'

export default function CreateTicketPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assets, setAssets] = useState([])
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target)
      const result = await createTicket(formData)

      if (result?.error) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Gagal Mengirim Laporan',
          message: result.error,
        })
        setIsSubmitting(false)
      } else {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Laporan Berhasil Terkirim!',
          message: 'Tiket pelaporan kendala/kerusakan IFP (5P) telah tercatat di sistem dan segera ditindaklanjuti oleh teknisi / Waka Sarpras.',
        })
        setIsSubmitting(false)
      }
    } catch (err) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Terjadi Kesalahan Server',
        message: err.message || 'Gagal mengirim laporan. Silakan periksa koneksi internet Anda.',
      })
      setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (modalState.type === 'success') {
      router.push('/dashboard/tickets')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Neobrutalism Alert Modal */}
      <NeoAlertModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={handleModalClose}
        actionText={modalState.type === 'success' ? 'Lihat Daftar Tiket' : 'Tutup'}
      />

      <div className="flex items-center space-x-3">
        <Link 
          href="/dashboard/tickets" 
          className="p-2.5 bg-white hover:bg-[#F4EFE6] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-black"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-black">Buat Laporan Kerusakan (5P)</h1>
          <p className="text-xs font-bold text-gray-600">
            Laporkan kendala teknis layar sentuh, audio, koneksi HDMI, atau aksesoris stylus IFP.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="neo-card p-6 md:p-8 space-y-6 bg-white">
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Nama Pelapor (Guru / Murid / Tendik) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="reporter_name"
              required
              placeholder="Contoh: Budi Santoso, S.Pd. / Siswa Kelas 8A"
              className="neo-input w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Unit Layar IFP yang Bermasalah <span className="text-red-500">*</span>
            </label>
            <select 
              name="asset_id"
              required 
              className="neo-input w-full cursor-pointer text-sm"
            >
              <option value="">-- Pilih Lokasi Aset --</option>
              {assets.map((item) => (
                <option key={item.id || item.asset_code} value={item.id || ''}>
                  {item.room_location} ({item.asset_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Tingkat Keparahan Kendala (Severity) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="severity" value="LOW" className="peer sr-only" required />
                <div className="text-center px-3 py-2.5 rounded-xl border-2 border-black peer-checked:bg-[#FEF08A] peer-checked:shadow-[3px_3px_0px_0px_#000] peer-checked:font-black text-black text-xs font-bold transition-all bg-white hover:bg-[#F4EFE6]">
                  Ringan
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="severity" value="MEDIUM" defaultChecked className="peer sr-only" required />
                <div className="text-center px-3 py-2.5 rounded-xl border-2 border-black peer-checked:bg-[#FB923C] peer-checked:text-white peer-checked:shadow-[3px_3px_0px_0px_#000] peer-checked:font-black text-black text-xs font-bold transition-all bg-white hover:bg-[#F4EFE6]">
                  Sedang
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="severity" value="HIGH" className="peer sr-only" required />
                <div className="text-center px-3 py-2.5 rounded-xl border-2 border-black peer-checked:bg-[#EF4444] peer-checked:text-white peer-checked:shadow-[3px_3px_0px_0px_#000] peer-checked:font-black text-black text-xs font-bold transition-all bg-white hover:bg-[#F4EFE6]">
                  Kritis
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5">
              Deskripsi Detail Kerusakan / Gejala Masalah <span className="text-red-500">*</span>
            </label>
            <textarea
              name="issue_desc"
              required
              rows={4}
              placeholder="Jelaskan secara spesifik: misal layar sentuh macet pada sisi kanan, kabel HDMI audio tidak keluar suara, atau stylus pen hilang..."
              className="neo-input w-full text-sm resize-none"
            />
          </div>

        </div>

        <div className="pt-4 border-t-2 border-black flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="neo-btn-danger px-8 py-3 text-sm font-black shadow-[4px_4px_0px_0px_#000]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirimkan Laporan...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2 stroke-[2.5]" />
                Kirim Laporan Kerusakan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
