'use client'

import { useState } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function LogPenggunaanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // In a real scenario, you'd upload the file to Supabase Storage here
    // and then save the record to the `usage_logs` table.
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      e.target.reset()
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Log Penggunaan IFP</h1>
        <p className="text-zinc-400 mt-1">
          Isi form ini setelah Anda selesai menggunakan ruang Lab IFP.
        </p>
      </div>

      {isSuccess && (
        <div className="glass bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl flex items-center text-emerald-400">
          <CheckCircle className="w-5 h-5 mr-3" />
          Log penggunaan berhasil disimpan!
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Mata Pelajaran
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: IPA Kelas 8"
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Topik / Materi
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan secara singkat kegiatan yang dilakukan..."
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Waktu Mulai
              </label>
              <input
                type="time"
                required
                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Waktu Selesai
              </label>
              <input
                type="time"
                required
                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Unggah Bukti Kegiatan (Foto / Ekspor Papan Tulis)
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-hover transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-primary-400" />
              </div>
              <p className="text-sm font-medium text-zinc-300">
                Klik untuk memilih file atau tarik ke sini
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                PNG, JPG, PDF (Maks. 5MB)
              </p>
              <input type="file" className="hidden" accept="image/*,.pdf" required />
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
            {isSubmitting ? 'Menyimpan...' : 'Simpan Log'}
          </button>
        </div>
      </form>
    </div>
  )
}
