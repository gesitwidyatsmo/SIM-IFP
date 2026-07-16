'use client'

import { useState } from 'react'
import { FileText, FileSpreadsheet, CheckCircle, TrendingUp, MonitorPlay, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MonevPage() {
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')

  // Dummy Data for Charts
  const usageData = [
    { name: 'Senin', sesi: 4 },
    { name: 'Selasa', sesi: 6 },
    { name: 'Rabu', sesi: 3 },
    { name: 'Kamis', sesi: 7 },
    { name: 'Jumat', sesi: 5 },
    { name: 'Sabtu', sesi: 2 },
  ]

  const handleExport = (type) => {
    if (type === 'pdf') {
      setIsExportingPdf(true)
      setTimeout(() => {
        setIsExportingPdf(false)
        setExportSuccess('Laporan PDF berhasil diunduh!')
        setTimeout(() => setExportSuccess(''), 3000)
      }, 1500)
    } else {
      setIsExportingCsv(true)
      setTimeout(() => {
        setIsExportingCsv(false)
        setExportSuccess('Data CSV berhasil diunduh!')
        setTimeout(() => setExportSuccess(''), 3000)
      }, 1500)
    }
  }

  // Custom Tooltip for Recharts to match Dark Mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border-primary-500/20">
          <p className="text-zinc-200 font-medium mb-1">{label}</p>
          <p className="text-primary-400 font-bold">{payload[0].value} Sesi Penggunaan</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Monev</h1>
          <p className="text-zinc-400 mt-1">Monitoring dan Evaluasi penggunaan Interactive Flat Panel.</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => handleExport('csv')}
            disabled={isExportingCsv}
            className="flex items-center px-4 py-2 bg-surface hover:bg-emerald-500/10 text-emerald-400 border border-border hover:border-emerald-500/30 text-sm font-medium rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {isExportingCsv ? 'Mengekspor...' : 'Ekspor CSV'}
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            disabled={isExportingPdf}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isExportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="glass bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl flex items-center text-emerald-400">
          <CheckCircle className="w-5 h-5 mr-3" />
          {exportSuccess}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-start space-x-4">
          <div className="p-3 bg-primary-500/10 rounded-xl">
            <MonitorPlay className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Sesi Minggu Ini</p>
            <p className="text-3xl font-bold text-foreground mt-1">27</p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +15% dari minggu lalu
            </p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Rata-rata Jam / Hari</p>
            <p className="text-3xl font-bold text-foreground mt-1">4.5<span className="text-lg text-zinc-500 ml-1">jam</span></p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start space-x-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Tingkat Kerusakan</p>
            <p className="text-3xl font-bold text-foreground mt-1">2<span className="text-lg text-zinc-500 ml-1">kasus</span></p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="glass-card p-6 md:p-8">
        <h2 className="text-lg font-bold text-foreground mb-6">Tren Penggunaan IFP (Seminggu Terakhir)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
              <Bar dataKey="sesi" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
