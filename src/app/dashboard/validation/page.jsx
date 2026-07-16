'use client'

import { useState } from 'react'
import { FileText, Video, Presentation, Check, X, Eye } from 'lucide-react'

export default function ValidationPage() {
  const [pendingItems, setPendingItems] = useState([
    { id: 1, title: 'Modul Ekosistem Darat', subject: 'IPA', grade: 'Kelas 7', type: 'pdf', uploader: 'Budi Santoso', date: '2026-07-15' },
    { id: 2, title: 'Video Simulasi Tata Surya', subject: 'IPA', grade: 'Kelas 8', type: 'video', uploader: 'Siti Aminah', date: '2026-07-16' },
    { id: 3, title: 'PPT Aljabar Dasar', subject: 'Matematika', grade: 'Kelas 7', type: 'ppt', uploader: 'Andi Wijaya', date: '2026-07-16' },
  ])

  const handleApprove = (id) => {
    setPendingItems(pendingItems.filter(item => item.id !== id))
    // Trigger success toast/notification here in real app
  }

  const handleReject = (id) => {
    setPendingItems(pendingItems.filter(item => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Validasi Materi</h1>
        <p className="text-zinc-400 mt-1">Daftar bahan ajar yang menunggu tinjauan dari Admin/Kurikulum.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {pendingItems.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Check className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
            <p className="text-lg font-medium text-zinc-300">Semua materi telah divalidasi!</p>
            <p className="text-sm">Tidak ada antrean materi yang menunggu tinjauan saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="p-4 text-sm font-semibold text-zinc-300">Materi</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300">Kategori</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300">Pengunggah</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingItems.map((item) => {
                  const Icon = item.type === 'pdf' ? FileText : item.type === 'video' ? Video : Presentation
                  const iconColor = item.type === 'pdf' ? 'text-red-400' : item.type === 'video' ? 'text-blue-400' : 'text-amber-400'
                  
                  return (
                    <tr key={item.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-surface border border-border`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                            <p className="text-xs text-zinc-500">{item.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-zinc-300">{item.subject}</p>
                        <p className="text-xs text-zinc-500">{item.grade}</p>
                      </td>
                      <td className="p-4 text-sm text-zinc-300">
                        {item.uploader}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="p-2 bg-surface hover:bg-primary-500/20 text-zinc-400 hover:text-primary-400 border border-border rounded-lg transition-colors"
                            title="Pratinjau"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleApprove(item.id)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-colors"
                            title="Setujui"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(item.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                            title="Tolak"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
