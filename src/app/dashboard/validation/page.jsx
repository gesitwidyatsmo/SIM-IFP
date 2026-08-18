'use client'

import { useState, useEffect } from 'react'
import { FileText, Video, Presentation, Check, X, Eye, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { updateMediaValidationStatus } from './actions'

export default function ValidationPage() {
  const [pendingItems, setPendingItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('ADMIN')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [notification, setNotification] = useState({ type: '', text: '' })

  const loadPendingMedia = async () => {
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (prof?.role) setUserRole(prof.role)
      }

      // Query media dengan status PENDING_VALIDATION dari Supabase
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
        .eq('status', 'PENDING_VALIDATION')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setPendingItems(data)
      } else {
        const flatRes = await supabase
          .from('media_repository')
          .select('*')
          .eq('status', 'PENDING_VALIDATION')

        if (!flatRes.error && flatRes.data) {
          setPendingItems(flatRes.data)
        } else {
          setPendingItems([])
        }
      }
    } catch {
      setPendingItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingMedia()
  }, [])

  const handleApprove = async (id) => {
    setActionLoadingId(id)
    const result = await updateMediaValidationStatus(id, 'APPROVED')
    if (result.error) {
      setNotification({ type: 'error', text: result.error })
    } else {
      setPendingItems(prev => prev.filter(item => item.id !== id))
      setNotification({ type: 'success', text: 'Bahan ajar berhasil disahkan dan aktif di Repositori!' })
    }
    setActionLoadingId(null)
    setTimeout(() => setNotification({ type: '', text: '' }), 4000)
  }

  const handleReject = async (id) => {
    setActionLoadingId(id)
    const result = await updateMediaValidationStatus(id, 'REJECTED')
    if (result.error) {
      setNotification({ type: 'error', text: result.error })
    } else {
      setPendingItems(prev => prev.filter(item => item.id !== id))
      setNotification({ type: 'success', text: 'Bahan ajar telah ditolak.' })
    }
    setActionLoadingId(null)
    setTimeout(() => setNotification({ type: '', text: '' }), 4000)
  }

  const isAdmin = userRole === 'ADMIN' || userRole === 'KEPALA_SEKOLAH'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center space-x-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-[#3B82F6] text-white border border-black text-[10px] font-black uppercase">
            Verifikasi Mutu
          </span>
          <span className="text-xs font-bold text-gray-500">• SOP-IFP-04</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-black">Validasi Materi & Bahan Ajar</h1>
        <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
          Daftar modul pembelajaran digital yang menunggu tinjauan kelayakan kurikulum sebelum dipublikasikan.
        </p>
      </div>

      {!isAdmin && (
        <div className="bg-[#FEF08A] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-start text-black">
          <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-black uppercase tracking-wider">Akses Terbatas (Mode Pratinjau)</p>
            <p className="font-semibold text-gray-800 mt-0.5">
              Akun Anda memiliki peran <span className="font-black underline">{userRole}</span>. Hanya Admin atau Waka Kurikulum yang dapat mengesahkan materi.
            </p>
          </div>
        </div>
      )}

      {notification.text && (
        <div className={`p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center text-xs sm:text-sm font-bold ${
          notification.type === 'error' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#D1FAE5] text-[#065F46]'
        }`}>
          {notification.type === 'error' ? <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
          {notification.text}
        </div>
      )}

      {/* Ledger Table Container */}
      <div className="neo-card overflow-hidden bg-white">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 mx-auto text-black animate-spin mb-3" />
            <p className="text-sm font-bold text-gray-600">Memeriksa antrean validasi kurikulum...</p>
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="p-12 text-center">
            <Check className="w-12 h-12 mx-auto mb-3 text-[#10B981] stroke-[3]" />
            <p className="text-lg font-black text-black">Semua Materi Telah Divalidasi!</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              Tidak ada antrean modul atau berkas ajar yang menunggu pengesahan saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-[2.5px] border-black bg-[#F4EFE6] text-black">
                  <th className="p-4 text-xs font-black uppercase tracking-wider">Materi & Berkas</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider">Mapel & Kelas</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider">Pengunggah</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-right">Aksi Pengesahan</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {pendingItems.map((item) => {
                  const type = item.file_type || 'pdf'
                  const Icon = type === 'pdf' ? FileText : type === 'video' ? Video : Presentation
                  const iconBg = type === 'pdf' ? 'bg-[#FEE2E2] text-[#EF4444]' : type === 'video' ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#FEF08A] text-[#854D0E]'
                  const isProcessing = actionLoadingId === item.id
                  
                  return (
                    <tr key={item.id} className="hover:bg-[#FFFDF5] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] ${iconBg}`}>
                            <Icon className="w-5 h-5 stroke-[2.5]" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-black">{item.title}</p>
                            <p className="text-[11px] font-semibold text-gray-500">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-black text-black">{item.subject}</p>
                        <p className="text-[11px] font-bold text-gray-500">{item.grade_level || 'Semua Kelas'}</p>
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-800">
                        {item.profiles?.full_name || item.author_name || 'Guru'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          {item.file_url && (
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white hover:bg-[#F4EFE6] text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                              title="Pratinjau Berkas"
                            >
                              <Eye className="w-4 h-4 stroke-[2.5]" />
                            </a>
                          )}
                          
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => handleApprove(item.id)}
                                disabled={isProcessing}
                                className="neo-btn-success p-2 text-xs font-black"
                                title="Sahkan / Setujui Materi"
                              >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                              </button>
                              <button 
                                onClick={() => handleReject(item.id)}
                                disabled={isProcessing}
                                className="neo-btn-danger p-2 text-xs font-black"
                                title="Tolak Materi"
                              >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 stroke-[3]" />}
                              </button>
                            </>
                          )}
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
