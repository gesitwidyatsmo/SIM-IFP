import { Search, Award, Download, Calendar } from 'lucide-react'

export default function TrainingPage() {
  const trainingRecords = [
    {
      id: 1,
      teacher: 'Budi Santoso',
      role: 'Guru IPA',
      trainings: [
        { name: 'Pelatihan Dasar Penggunaan IFP', date: '2026-06-10', certUrl: '#' },
        { name: 'Pembuatan Bahan Ajar Interaktif', date: '2026-07-05', certUrl: '#' }
      ]
    },
    {
      id: 2,
      teacher: 'Siti Aminah',
      role: 'Guru IPS',
      trainings: [
        { name: 'Pelatihan Dasar Penggunaan IFP', date: '2026-06-10', certUrl: '#' }
      ]
    },
    {
      id: 3,
      teacher: 'Andi Wijaya',
      role: 'Tutor Matematika',
      trainings: []
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pelatihan Kompetensi Guru</h1>
          <p className="text-zinc-400 mt-1">Lacak riwayat sertifikasi dan pelatihan penggunaan IFP.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Cari nama guru..." 
          className="w-full md:w-1/2 bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainingRecords.map((record) => (
          <div key={record.id} className="glass-card flex flex-col overflow-hidden h-full">
            <div className="p-6 border-b border-border bg-surface-hover/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                  {record.teacher.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{record.teacher}</h2>
                  <p className="text-sm text-zinc-400">{record.role}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex-1 bg-surface/50">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Riwayat Pelatihan</h3>
              
              {record.trainings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-zinc-500">Belum ada riwayat pelatihan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {record.trainings.map((t, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 mr-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Award className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-200">{t.name}</p>
                        <div className="flex items-center mt-1 text-xs text-zinc-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {t.date}
                        </div>
                        <button className="mt-2 flex items-center text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                          <Download className="w-3 h-3 mr-1" /> Unduh Sertifikat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
