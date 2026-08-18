'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Library, Loader2, Sparkles, Trash2 } from 'lucide-react'
import MediaCard from '@/components/MediaCard'
import { createClient } from '@/utils/supabase/client'
import { deleteMedia } from './actions'
import NeoAlertModal from '@/components/NeoAlertModal'

export default function RepositoryPage() {
  const [mediaList, setMediaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('ALL')
  const [selectedGrade, setSelectedGrade] = useState('ALL')

  // Modal State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Cek role user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (prof?.role === 'ADMIN' || prof?.role === 'KEPALA_SEKOLAH') {
          setIsAdmin(true)
        }
      }

      // Load media
      const { data, error } = await supabase
        .from('media_repository')
        .select(`
          id,
          title,
          subject,
          grade_level,
          author_name,
          file_url,
          file_type,
          status,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setMediaList(data)
      } else {
        const flatRes = await supabase
          .from('media_repository')
          .select('*')
          .eq('status', 'APPROVED')

        if (!flatRes.error && flatRes.data) {
          setMediaList(flatRes.data)
        } else {
          setMediaList([])
        }
      }
      setLoading(false)
    }

    loadData()
  }, [])

  const handleDeleteClick = (target) => {
    setDeleteTarget(target)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    const targetId = deleteTarget.id
    const targetTitle = deleteTarget.title
    const result = await deleteMedia(targetId)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result?.error) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: result.error,
      })
    } else {
      setMediaList((prev) => prev.filter((m) => m.id !== targetId))
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Bahan Ajar Dihapus',
        message: `Bahan ajar "${targetTitle}" berhasil dihapus dari repositori sistem.`,
      })
    }
  }

  // Filter list
  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'ALL' || item.subject === selectedSubject
    const matchesGrade = selectedGrade === 'ALL' || item.grade_level === selectedGrade

    return matchesSearch && matchesSubject && matchesGrade
  })

  const subjects = [
    'ALL',
    'Informatika',
    'Matematika',
    'Matematika Tingkat Lanjut',
    'IPA',
    'Biologi',
    'Fisika',
    'Kimia',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Bahasa Inggris Tingkat Lanjut',
    'Bahasa Arab',
    'Pendidikan Pancasila (PPKn)',
    'Sejarah Indonesia',
    'IPS',
    'Ekonomi',
    'Geografi',
    'Sosiologi',
    'PABP (Pendidikan Agama Islam)',
    'Aswaja',
    'BMK (Bimbingan Membaca Kitab)',
    'Khot (Kaligrafi)',
    'Seni Rupa / Seni Budaya',
    'PJOK',
    'Budaya Melayu Riau (BMR)',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#FB923C] text-white border border-black text-[10px] font-black uppercase">
              Repositori Terverifikasi
            </span>
            <span className="text-xs font-bold text-gray-500">• SOP-IFP-04</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-black">Repositori Bahan Ajar Interaktif</h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
            Pusat modul presentasi, video pembelajaran, dan materi sentuh yang telah divalidasi Kurikulum.
          </p>
        </div>
        
        <Link 
          href="/dashboard/repository/upload"
          className="neo-btn-primary px-5 py-3 text-sm font-black whitespace-nowrap shadow-[3px_3px_0px_0px_#000]"
        >
          <Plus className="w-5 h-5 mr-2 stroke-[3]" />
          Unggah Bahan Ajar
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="neo-card p-4 flex flex-col md:flex-row gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi pembelajaran, topik optik, struktur sel, rumus..." 
            className="neo-input w-full pl-10 text-xs sm:text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="neo-input text-xs cursor-pointer max-w-[200px]"
          >
            <option value="ALL">Semua Mapel</option>
            {subjects.filter(s => s !== 'ALL').map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>

          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="neo-input text-xs cursor-pointer"
          >
            <option value="ALL">Semua Kelas</option>
            <option value="Kelas 7">Kelas 7 (SMP)</option>
            <option value="Kelas 8">Kelas 8 (SMP)</option>
            <option value="Kelas 9">Kelas 9 (SMP)</option>
            <option value="Kelas 10">Kelas 10 (SMA)</option>
            <option value="Kelas 11">Kelas 11 (SMA)</option>
            <option value="Kelas 12">Kelas 12 (SMA)</option>
            <option value="Umum / Semua Tingkat">Umum</option>
          </select>
        </div>
      </div>

      {/* Grid Bahan Ajar */}
      {loading ? (
        <div className="text-center py-20 bg-white neo-card">
          <Loader2 className="w-8 h-8 mx-auto text-black animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-600">Memuat berkas bahan ajar repositori...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="neo-card p-12 text-center bg-white">
          <Library className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-black text-black">Belum Ada Bahan Ajar</p>
          <p className="text-xs font-semibold text-gray-500 mt-1 max-w-md mx-auto">
            {mediaList.length === 0 
              ? 'Belum ada materi pembelajaran yang disetujui kurikulum. Unggah modul pertama Anda sekarang!' 
              : 'Tidak ditemukan bahan ajar yang cocok dengan kata kunci pencarian Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMedia.map((media) => (
            <MediaCard 
              key={media.id} 
              {...media} 
              isAdmin={isAdmin}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Bahan Ajar */}
      {deleteTarget && (
        <NeoAlertModal
          isOpen={Boolean(deleteTarget)}
          type="warning"
          title="Hapus Bahan Ajar?"
          message={`Apakah Anda yakin ingin menghapus bahan ajar "${deleteTarget.title}" secara permanen dari Repositori?\n\nBerkas yang dihapus tidak dapat dipulihkan.`}
          actionText={isDeleting ? 'Menghapus...' : 'Ya, Hapus Bahan Ajar'}
          onAction={handleConfirmDelete}
          cancelText="Batalkan"
          onCancel={() => setDeleteTarget(null)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Modal Feedback Notifikasi */}
      <NeoAlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
