'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function CreateTicketPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      
      setTimeout(() => {
        router.push('/dashboard/tickets')
      }, 2000)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/tickets" className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buat Laporan Baru</h1>
          <p className="text-zinc-400 mt-1">
            Laporkan masalah teknis atau kerusakan pada Interactive Flat Panel (IFP).
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="glass bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl flex items-center text-emerald-400">
          <CheckCircle className="w-5 h-5 mr-3" />
          Laporan berhasil dikirim! Tim TIK akan segera menindaklanjutinya.
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6 border-t-4 border-t-red-500">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Aset IFP Bermasalah
            </label>
            <select required className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 transition-all">
              <option value="">-- Pilih Lokasi Aset --</option>
              <option value="IFP-01">IFP-01 (Ruang Kelas 7A)</option>
              <option value="IFP-02">IFP-02 (Ruang Kelas 8B)</option>
              <option value="IFP-03">IFP-03 (Lab Komputer)</option>
              <option value="IFP-04">IFP-04 (Perpustakaan)</option>
              <option value="IFP-05">IFP-05 (Ruang Guru)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Tingkat Keparahan (Severity)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="severity" value="low" className="peer sr-only" required />
                <div className="text-center px-3 py-2 rounded-lg border border-border peer-checked:bg-amber-500/20 peer-checked:border-amber-500 peer-checked:text-amber-400 text-zinc-400 text-sm font-medium transition-colors">
                  Ringan
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="severity" value="medium" className="peer sr-only" required />
                <div className="text-center px-3 py-2 rounded-lg border border-border peer-checked:bg-orange-500/20 peer-checked:border-orange-500 peer-checked:text-orange-400 text-zinc-400 text-sm font-medium transition-colors">
                  Sedang
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="severity" value="high" className="peer sr-only" required />
                <div className="text-center px-3 py-2 rounded-lg border border-border peer-checked:bg-red-500/20 peer-checked:border-red-500 peer-checked:text-red-400 text-zinc-400 text-sm font-medium transition-colors">
                  Kritis
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Deskripsi Detail Kendala
            </label>
            <textarea
              required
              rows={4}
              placeholder="Jelaskan secara spesifik masalah yang terjadi. Contoh: Layar tiba-tiba mati saat digunakan, tidak bisa menyala kembali padahal kabel sudah terpasang."
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-900/20 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              'Mengirim...'
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Kirim Laporan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
