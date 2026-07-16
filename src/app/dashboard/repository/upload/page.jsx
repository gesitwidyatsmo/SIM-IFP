'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UploadMediaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate upload and DB insertion
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Redirect back after success
      setTimeout(() => {
        router.push('/dashboard/repository')
      }, 2000)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/repository" className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unggah Bahan Ajar</h1>
          <p className="text-zinc-400 mt-1">
            Materi yang Anda unggah akan divalidasi oleh Kurikulum sebelum diterbitkan.
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="glass bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl flex items-center text-emerald-400">
          <CheckCircle className="w-5 h-5 mr-3" />
          Materi berhasil diunggah dan sedang menunggu validasi!
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Judul Materi
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Modul Tata Surya Interaktif"
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Mata Pelajaran
              </label>
              <select required className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                <option value="">Pilih Mapel</option>
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Tingkat Kelas
              </label>
              <select required className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                <option value="">Pilih Kelas</option>
                <option value="7">Kelas 7</option>
                <option value="8">Kelas 8</option>
                <option value="9">Kelas 9</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Unggah File Materi
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-hover transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-primary-400" />
              </div>
              <p className="text-sm font-medium text-zinc-300">
                Seret dan lepas file di sini, atau klik untuk menelusuri
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Mendukung PDF, PPTX, MP4 (Maks. 50MB)
              </p>
              <input type="file" className="hidden" accept=".pdf,.pptx,.mp4" required />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Mengunggah...' : 'Unggah Materi'}
          </button>
        </div>
      </form>
    </div>
  )
}
