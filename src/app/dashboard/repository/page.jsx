import Link from 'next/link'
import { Search, Plus, Filter } from 'lucide-react'
import MediaCard from '@/components/MediaCard'

export default function RepositoryPage() {
  const dummyMedia = [
    { id: 1, title: 'Modul Interaktif Struktur Sel', subject: 'IPA', grade: 'Kelas 8', type: 'ppt', uploader: 'Budi Santoso', status: 'APPROVED' },
    { id: 2, title: 'Video Penjelasan Tata Surya', subject: 'IPA', grade: 'Kelas 7', type: 'video', uploader: 'Siti Aminah', status: 'APPROVED' },
    { id: 3, title: 'LKPD Persamaan Kuadrat', subject: 'Matematika', grade: 'Kelas 9', type: 'pdf', uploader: 'Andi Wijaya', status: 'APPROVED' },
    { id: 4, title: 'PPT Sejarah Kemerdekaan', subject: 'IPS', grade: 'Kelas 8', type: 'ppt', uploader: 'Rina Marlina', status: 'PENDING' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Repositori Media</h1>
          <p className="text-zinc-400 mt-1">Jelajahi dan unduh bahan ajar interaktif yang telah divalidasi.</p>
        </div>
        
        <Link 
          href="/dashboard/repository/upload"
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Unggah Materi
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Cari materi pembelajaran..." 
            className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <button className="flex items-center justify-center px-4 py-3 bg-surface border border-border rounded-xl text-zinc-300 hover:bg-surface-hover transition-colors">
          <Filter className="w-5 h-5 mr-2" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dummyMedia.map(media => (
          <MediaCard key={media.id} {...media} />
        ))}
      </div>
    </div>
  )
}
