'use client'

import { useState, useEffect } from 'react'
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingUp, 
  MonitorPlay, 
  AlertCircle, 
  Loader2, 
  Printer, 
  BarChart3, 
  Clock, 
  CheckCheck, 
  ExternalLink, 
  Image as ImageIcon,
  Trash2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/utils/supabase/client'
import { deleteUsageLog } from '../log/actions'
import NeoAlertModal from '@/components/NeoAlertModal'

// Fungsi kalkulasi durasi jam realisasi
function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 1.5 // Standar default 2 JP / 1.5 Jam
  try {
    const toMinutes = (t) => {
      if (typeof t !== 'string') return null
      const parts = t.trim().split(':')
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10)
        if (!isNaN(h) && !isNaN(m)) return h * 60 + m
      }
      return null
    }
    const s = toMinutes(startTime)
    const e = toMinutes(endTime)
    if (s !== null && e !== null && e > s) {
      return Math.round(((e - s) / 60) * 10) / 10
    }
  } catch {
    // fallback
  }
  return 1.5
}

export default function MonevPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })
  const [stats, setStats] = useState({
    totalRealized: 0,
    totalScheduled: 0,
    realizationRate: 0,
    totalHours: 0,
    avgHoursPerSession: 0,
    totalTicketsOpen: 0,
    chartData: [
      { name: 'Senin', sesi: 0 },
      { name: 'Selasa', sesi: 0 },
      { name: 'Rabu', sesi: 0 },
      { name: 'Kamis', sesi: 0 },
      { name: 'Jumat', sesi: 0 },
      { name: 'Sabtu', sesi: 0 },
      { name: 'Ahad', sesi: 0 },
    ],
    logsList: [],
  })

  useEffect(() => {
    async function loadMonevData() {
      setLoading(true)
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

      let safeLogs = []
      let safeSchedules = []
      let openTicketsCount = 0

      // 1. Ambil data realisasi utama dari tabel usage_logs
      const logsRes = await supabase
        .from('usage_logs')
        .select(`
          id,
          teacher_name,
          subject,
          topic,
          start_time,
          end_time,
          evidence_url,
          created_at,
          ifp_assets (
            room_location,
            asset_code
          ),
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (!logsRes.error && logsRes.data) {
        safeLogs = logsRes.data
      } else {
        const flatLogs = await supabase.from('usage_logs').select('*')
        if (!flatLogs.error && flatLogs.data) safeLogs = flatLogs.data
      }

      // 2. Ambil data schedules sebagai pembanding keterlaksanaan (rencana vs riil)
      const schedulesRes = await supabase
        .from('schedules')
        .select('id, title, start_time, end_time, status')
        .neq('status', 'REJECTED')

      if (!schedulesRes.error && schedulesRes.data) {
        safeSchedules = schedulesRes.data
      }

      // 3. Ambil data tickets kendala teknis yang masih terbuka
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, status')
        .neq('status', 'CLOSED')

      openTicketsCount = tickets?.length || 0

      // 4. Hitung sebaran hari realisasi berdasarkan created_at di usage_logs
      const daysCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 }
      let totalCalculatedHours = 0

      safeLogs.forEach((item) => {
        // Durasi jam
        const dur = calculateHours(item.start_time, item.end_time)
        totalCalculatedHours += dur

        // Hari
        let dateObj = null
        if (item.created_at) {
          dateObj = new Date(item.created_at)
        }
        if (dateObj && !isNaN(dateObj.getTime())) {
          const dayIndex = dateObj.getDay()
          if (daysCount[dayIndex] !== undefined) {
            daysCount[dayIndex]++
          }
        }
      })

      const chartFormatted = [
        { name: 'Senin', sesi: daysCount[1] },
        { name: 'Selasa', sesi: daysCount[2] },
        { name: 'Rabu', sesi: daysCount[3] },
        { name: 'Kamis', sesi: daysCount[4] },
        { name: 'Jumat', sesi: daysCount[5] },
        { name: 'Sabtu', sesi: daysCount[6] },
        { name: 'Ahad', sesi: daysCount[0] },
      ]

      const totalRealized = safeLogs.length
      const totalScheduled = safeSchedules.length
      
      // Tingkat Keterlaksanaan
      let rate = 100
      if (totalScheduled > 0) {
        rate = Math.min(100, Math.round((totalRealized / totalScheduled) * 100))
      } else if (totalRealized === 0) {
        rate = 0
      }

      const avgHoursPerSession = totalRealized > 0 
        ? (totalCalculatedHours / totalRealized).toFixed(1) 
        : '0'

      setStats({
        totalRealized,
        totalScheduled,
        realizationRate: rate,
        totalHours: totalCalculatedHours.toFixed(1),
        avgHoursPerSession,
        totalTicketsOpen: openTicketsCount,
        chartData: chartFormatted,
        logsList: safeLogs,
      })

      setLoading(false)
    }

    loadMonevData()
  }, [])

  // Fungsi Ekspor CSV Realisasi Penggunaan
  const handleExportCsv = () => {
    const headers = [
      'No', 
      'Tanggal Realisasi', 
      'Guru Pengajar', 
      'Ruangan / Unit IFP', 
      'Mata Pelajaran', 
      'Topik / Ringkasan Aktivitas', 
      'Waktu Mulai', 
      'Waktu Selesai', 
      'Estimasi Durasi', 
      'Status Bukti Foto'
    ]

    const rows = stats.logsList.map((item, idx) => {
      let dateFormatted = '-'
      if (item.created_at) {
        const d = new Date(item.created_at)
        dateFormatted = d.toLocaleDateString('id-ID')
      }

      const teacher = item.teacher_name || item.profiles?.full_name || 'Guru'
      const room = item.ifp_assets?.room_location || item.ifp_assets?.asset_code || '-'
      const subject = item.subject || '-'
      const topic = (item.topic || '').replace(/"/g, '""')
      const startTime = item.start_time || '-'
      const endTime = item.end_time || '-'
      const dur = calculateHours(item.start_time, item.end_time)
      const evidence = item.evidence_url ? 'Ada Bukti Foto' : 'Tanpa Bukti'

      return [
        idx + 1,
        `"${dateFormatted}"`,
        `"${teacher}"`,
        `"${room}"`,
        `"${subject}"`,
        `"${topic}"`,
        `"${startTime}"`,
        `"${endTime}"`,
        `"${dur} Jam"`,
        `"${evidence}"`
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Laporan_Realisasi_Log_IFP_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setExportSuccess('Data Riil Log Penggunaan berhasil diekspor ke format CSV!')
    setTimeout(() => setExportSuccess(''), 3500)
  }

  // Handler Hapus Log Penggunaan
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    const targetId = deleteTarget.id
    const targetDesc = `${deleteTarget.teacher} - ${deleteTarget.subject}`
    const result = await deleteUsageLog(targetId)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result?.error) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus Log',
        message: result.error,
      })
    } else {
      setStats((prev) => {
        const updatedList = prev.logsList.filter((log) => log.id !== targetId)
        return {
          ...prev,
          logsList: updatedList,
          totalRealized: updatedList.length,
        }
      })
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Log Berhasil Dihapus',
        message: `Catatan log penggunaan (${targetDesc}) telah berhasil dihapus dari database.`,
      })
    }
  }

  const handlePrintPdf = () => {
    window.print()
  }

  // Custom Tooltip Neobrutalism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
          <p className="text-black font-black text-xs uppercase mb-0.5">{label}</p>
          <p className="text-[#3B82F6] font-black text-sm">{payload[0].value} Sesi Realisasi Riil</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#FFE600] text-black border border-black text-[10px] font-black uppercase">
              Dashboard Monev
            </span>
            <span className="text-xs font-bold text-gray-500">• Berbasis Realisasi Log (SOP-IFP-07)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-black">Statistik & Laporan Monitoring Evaluasi</h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
            Metrik akurat dihitung langsung dari log realisasi pembelajaran, bukti foto, dan durasi operasional IFP.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={handleExportCsv}
            className="neo-btn-secondary px-4 py-2.5 text-xs font-black"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#065F46] stroke-[2.5]" />
            Ekspor CSV Realisasi
          </button>
          <button 
            onClick={handlePrintPdf}
            className="neo-btn-primary px-4 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
          >
            <Printer className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Cetak Laporan / PDF
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="bg-[#D1FAE5] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center text-[#065F46] font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          {exportSuccess}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white neo-card">
          <Loader2 className="w-8 h-8 mx-auto text-black animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-600">Menghitung metrik realisasi pemanfaatan IFP...</p>
        </div>
      ) : (
        <>
          {/* Summary Bento Cards: 4 Metrik Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Realisasi */}
            <div className="bg-[#FEF08A] p-5 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-800">Total Sesi Realisasi</p>
                <div className="p-2 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <MonitorPlay className="w-5 h-5 text-black" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-black">{stats.totalRealized} <span className="text-sm font-bold text-gray-700">Sesi</span></p>
                <p className="text-[11px] font-bold text-[#065F46] mt-1 flex items-center">
                  <CheckCheck className="w-3.5 h-3.5 mr-1" /> Terverifikasi Buku Tamu Log
                </p>
              </div>
            </div>

            {/* Tingkat Keterlaksanaan */}
            <div className="bg-[#D1FAE5] p-5 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-800">Keterlaksanaan</p>
                <div className="p-2 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <TrendingUp className="w-5 h-5 text-[#065F46]" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-[#065F46]">{stats.realizationRate}<span className="text-xl font-black">%</span></p>
                <p className="text-[11px] font-bold text-gray-600 mt-1">
                  {stats.totalRealized} dari {stats.totalScheduled} jadwal terencana
                </p>
              </div>
            </div>

            {/* Total Durasi Jam */}
            <div className="bg-[#DBEAFE] p-5 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-800">Akumulasi Durasi</p>
                <div className="p-2 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <Clock className="w-5 h-5 text-[#1E40AF]" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-[#1E40AF]">{stats.totalHours} <span className="text-sm font-bold text-gray-700">Jam</span></p>
                <p className="text-[11px] font-bold text-gray-600 mt-1">
                  Rata-rata ~{stats.avgHoursPerSession} jam / sesi
                </p>
              </div>
            </div>

            {/* Tiket 5P Kendala */}
            <div className="bg-[#FEE2E2] p-5 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-800">Tiket 5P Terbuka</p>
                <div className="p-2 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-[#991B1B]">{stats.totalTicketsOpen} <span className="text-sm font-bold text-gray-700">Kasus</span></p>
                <p className="text-[11px] font-bold text-[#991B1B] mt-1">
                  Kendala teknis butuh tindak lanjut
                </p>
              </div>
            </div>

          </div>

          {/* Charts Section: Distribusi Hari Pembelajaran Riil */}
          <div className="neo-card p-6 md:p-8 bg-white">
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-black">
              <div>
                <h2 className="text-base sm:text-lg font-black text-black">
                  Distribusi Hari Pemanfaatan IFP (Berdasarkan Log Aktual)
                </h2>
                <p className="text-xs font-bold text-gray-500">
                  Frekuensi sesi pembelajaran nyata yang terselenggara dari hari Senin s.d. Ahad
                </p>
              </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" stroke="#121212" fontSize={12} tickLine={false} axisLine={{ stroke: '#121212', strokeWidth: 2 }} fontStyle="bold" />
                  <YAxis stroke="#121212" fontSize={12} tickLine={false} axisLine={{ stroke: '#121212', strokeWidth: 2 }} allowDecimals={false} fontStyle="bold" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4EFE6', opacity: 0.8 }} />
                  <Bar dataKey="sesi" fill="#3B82F6" stroke="#121212" strokeWidth={2} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabel Riwayat Log Pembelajaran Terkini */}
          <div className="neo-card p-6 bg-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black">
              <div>
                <h2 className="text-base font-black text-black">Riwayat Realisasi Log Pembelajaran IFP</h2>
                <p className="text-xs font-bold text-gray-500">Entri buku tamu digital dan dokumentasi mengajar guru</p>
              </div>
              <span className="neo-badge bg-[#E0E7FF] text-[#3730A3] text-xs">
                {stats.logsList.length} Total Entri
              </span>
            </div>

            {stats.logsList.length === 0 ? (
              <div className="text-center py-10 bg-[#F9FAFB] rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-sm font-bold text-gray-500">Belum ada riwayat pengisian log penggunaan dari guru.</p>
                <p className="text-xs font-semibold text-gray-400 mt-1">Guru dapat mengisi formulir di menu "Log Penggunaan" setelah selesai sesi kelas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-black bg-[#F4EFE6] text-black">
                      <th className="p-3 text-xs font-black uppercase">Tanggal</th>
                      <th className="p-3 text-xs font-black uppercase">Guru Pengajar</th>
                      <th className="p-3 text-xs font-black uppercase">Ruang / Unit IFP</th>
                      <th className="p-3 text-xs font-black uppercase">Mapel</th>
                      <th className="p-3 text-xs font-black uppercase">Topik Materi</th>
                      <th className="p-3 text-xs font-black uppercase">Jam Realisasi</th>
                      <th className="p-3 text-xs font-black uppercase text-center">Bukti Foto</th>
                      {isAdmin && <th className="p-3 text-xs font-black uppercase text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {stats.logsList.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FFFDF5] transition-colors">
                        <td className="p-3 font-mono font-bold text-gray-600 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                        </td>
                        <td className="p-3 font-black text-black whitespace-nowrap">
                          {log.teacher_name || log.profiles?.full_name || 'Guru'}
                        </td>
                        <td className="p-3 font-bold text-gray-700 whitespace-nowrap">
                          {log.ifp_assets?.room_location ? (
                            <span className="px-2 py-0.5 rounded bg-gray-100 border border-black/30 font-semibold text-xs">
                              {log.ifp_assets.room_location}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 font-black text-[#1E40AF] whitespace-nowrap">{log.subject}</td>
                        <td className="p-3 font-medium text-gray-700 max-w-xs truncate" title={log.topic}>
                          {log.topic}
                        </td>
                        <td className="p-3 font-mono font-semibold text-gray-600 whitespace-nowrap">
                          {log.start_time && log.end_time 
                            ? `${log.start_time} - ${log.end_time}` 
                            : (log.start_time || '-')}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {log.evidence_url ? (
                            <a 
                              href={log.evidence_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#D1FAE5] text-[#065F46] border border-black text-[11px] font-black hover:bg-[#A7F3D0] transition-colors"
                            >
                              <ImageIcon className="w-3.5 h-3.5 mr-1" />
                              <span>Lihat Foto</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                            </a>
                          ) : (
                            <span className="text-xs font-semibold text-gray-400 italic">Tanpa Foto</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ 
                                id: log.id, 
                                teacher: log.teacher_name || log.profiles?.full_name || 'Guru', 
                                subject: log.subject 
                              })}
                              className="p-1.5 bg-[#FEE2E2] hover:bg-[#EF4444] text-[#991B1B] hover:text-white border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                              title="Hapus Entri Log Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Konfirmasi Hapus Log Penggunaan */}
      {deleteTarget && (
        <NeoAlertModal
          isOpen={Boolean(deleteTarget)}
          type="warning"
          title="Hapus Catatan Log Penggunaan?"
          message={`Apakah Anda yakin ingin menghapus catatan log mengajar (${deleteTarget.teacher} - ${deleteTarget.subject}) secara permanen?\n\nData dan berkas foto bukti terkait akan dihapus dari sistem.`}
          actionText={isDeleting ? 'Menghapus...' : 'Ya, Hapus Log'}
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
