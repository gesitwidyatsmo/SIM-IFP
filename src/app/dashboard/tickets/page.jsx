'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, AlertCircle, CheckCircle2, Clock, Wrench, Loader2, User, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { updateTicketStatus, deleteTicket } from './actions'
import NeoAlertModal from '@/components/NeoAlertModal'

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [userRole, setUserRole] = useState('GUEST')
  const [updatingId, setUpdatingId] = useState(null)

  // Modal delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const loadTickets = async () => {
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

      // Query tickets murni dari database Supabase
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_code,
          reporter_name,
          issue_desc,
          severity,
          status,
          created_at,
          resolved_at,
          ifp_assets (
            asset_code,
            room_location
          ),
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setTickets(data)
      } else {
        const flatRes = await supabase.from('tickets').select('*')
        if (!flatRes.error && flatRes.data) {
          setTickets(flatRes.data)
        } else {
          setTickets([])
        }
      }
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleStatusChange = async (ticketId, nextStatus) => {
    setUpdatingId(ticketId)
    await updateTicketStatus(ticketId, nextStatus)
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t))
    setUpdatingId(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    const targetId = deleteTarget.id
    const targetCode = deleteTarget.code
    const result = await deleteTicket(targetId)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result?.error) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus Tiket',
        message: result.error,
      })
    } else {
      setTickets((prev) => prev.filter((t) => t.id !== targetId))
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Tiket Berhasil Dihapus',
        message: `Laporan kerusakan (${targetCode}) telah berhasil dihapus dari database.`,
      })
    }
  }

  const filteredTickets = tickets.filter(t => {
    const assetStr = `${t.ifp_assets?.asset_code || ''} ${t.ifp_assets?.room_location || ''}`.toLowerCase()
    const descStr = (t.issue_desc || '').toLowerCase()
    const codeStr = (t.ticket_code || '').toLowerCase()
    const reporterStr = (t.reporter_name || t.profiles?.full_name || '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return assetStr.includes(q) || descStr.includes(q) || codeStr.includes(q) || reporterStr.includes(q)
  })

  const isAdmin = userRole === 'ADMIN' || userRole === 'KEPALA_SEKOLAH'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#EF4444] text-white border border-black text-[10px] font-black uppercase">
              Standar 5P & Sarpras
            </span>
            <span className="text-xs font-bold text-gray-500">• SOP-IFP-03</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-black">Laporan Kerusakan & Troubleshooting</h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
            Pusat tiket penanganan kendala teknis layar, audio, kabel, dan perawatan berkala IFP.
          </p>
        </div>
        
        <Link 
          href="/dashboard/tickets/create"
          className="neo-btn-danger px-5 py-3 text-sm font-black whitespace-nowrap shadow-[3px_3px_0px_0px_#000]"
        >
          <Plus className="w-5 h-5 mr-2 stroke-[3]" />
          Buat Laporan Baru
        </Link>
      </div>

      {/* Filter Search */}
      <div className="neo-card p-4 bg-white">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode tiket (TKT-...), nama pelapor, lokasi aset, atau gejala masalah..." 
            className="neo-input w-full pl-10 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* List Tiket */}
      {loading ? (
        <div className="text-center py-20 bg-white neo-card">
          <Loader2 className="w-8 h-8 mx-auto text-black animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-600">Memeriksa catatan tiket sarpras 5P...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="neo-card p-12 text-center bg-white">
          <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-black text-black">Belum Ada Kendala Aktif</p>
          <p className="text-xs font-semibold text-gray-500 mt-1 max-w-md mx-auto">
            {tickets.length === 0 
              ? 'Seluruh perangkat Interactive Flat Panel saat ini dalam kondisi prima dan siap digunakan.' 
              : 'Tidak ditemukan tiket dengan kata kunci pencarian Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => {
            const isProcessing = updatingId === ticket.id
            const reporterDisplay = ticket.reporter_name || ticket.profiles?.full_name || 'Guru / Pelapor'

            return (
              <div 
                key={ticket.id} 
                className="neo-card p-5 bg-white hover:bg-[#FFFDF5] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono font-black text-xs bg-black text-white px-2 py-0.5 rounded">
                      {ticket.ticket_code || 'TKT-IFP'}
                    </span>
                    
                    {ticket.status === 'OPEN' && (
                      <span className="neo-stamp neo-stamp-danger text-[10px]">
                        <AlertCircle className="w-3 h-3 mr-1" /> TERBUKA
                      </span>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <span className="neo-stamp neo-stamp-pending text-[10px]">
                        <Clock className="w-3 h-3 mr-1" /> SEDANG DITANGANI
                      </span>
                    )}
                    {ticket.status === 'CLOSED' && (
                      <span className="neo-stamp neo-stamp-approved text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> SELESAI
                      </span>
                    )}

                    {ticket.severity === 'HIGH' && (
                      <span className="px-2 py-0.5 rounded bg-[#EF4444] text-white border border-black font-black text-[10px] uppercase">
                        Kritis
                      </span>
                    )}
                    {ticket.severity === 'MEDIUM' && (
                      <span className="px-2 py-0.5 rounded bg-[#F59E0B] text-black border border-black font-black text-[10px] uppercase">
                        Sedang
                      </span>
                    )}
                    {ticket.severity === 'LOW' && (
                      <span className="px-2 py-0.5 rounded bg-gray-200 text-black border border-black font-black text-[10px] uppercase">
                        Ringan
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-black mb-1">
                    {ticket.ifp_assets?.room_location || 'Aset IFP'} {ticket.ifp_assets?.asset_code ? `(${ticket.ifp_assets.asset_code})` : ''}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed bg-[#FFFDF5] p-2.5 rounded-lg border border-black/20">
                    {ticket.issue_desc}
                  </p>
                </div>
                
                <div className="flex flex-col md:items-end justify-between gap-3 text-sm flex-shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-gray-700 flex items-center md:justify-end">
                      <User className="w-3.5 h-3.5 mr-1 text-black" />
                      Pelapor: <span className="text-black font-black ml-1">{reporterDisplay}</span>
                    </p>
                    <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-2 pt-2 border-t md:border-t-0 border-black/10">
                      {ticket.status === 'OPEN' && (
                        <button
                          onClick={() => handleStatusChange(ticket.id, 'IN_PROGRESS')}
                          disabled={isProcessing}
                          className="neo-btn-primary px-3 py-1.5 text-xs font-black"
                        >
                          {isProcessing ? 'Memproses...' : 'Mulai Tangani'}
                        </button>
                      )}
                      {ticket.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(ticket.id, 'CLOSED')}
                          disabled={isProcessing}
                          className="neo-btn-success px-3 py-1.5 text-xs font-black"
                        >
                          {isProcessing ? 'Menutup...' : 'Tandai Selesai'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: ticket.id, code: ticket.ticket_code || 'TKT-IFP' })}
                        className="p-1.5 bg-[#FEE2E2] hover:bg-[#EF4444] text-[#991B1B] hover:text-white border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        title="Hapus Laporan Kerusakan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Laporan Kerusakan */}
      {deleteTarget && (
        <NeoAlertModal
          isOpen={Boolean(deleteTarget)}
          type="warning"
          title="Hapus Laporan Kerusakan?"
          message={`Apakah Anda yakin ingin menghapus tiket laporan kerusakan (${deleteTarget.code}) secara permanen?\n\nData yang dihapus tidak dapat dipulihkan.`}
          actionText={isDeleting ? 'Menghapus...' : 'Ya, Hapus Tiket'}
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
