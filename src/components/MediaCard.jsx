import { Download, FileText, Video, Presentation } from 'lucide-react'

export default function MediaCard({ title, subject, grade, type, uploader, status }) {
  // Select icon based on type
  const Icon = type === 'pdf' ? FileText : type === 'video' ? Video : Presentation
  const iconColor = type === 'pdf' ? 'text-red-400' : type === 'video' ? 'text-blue-400' : 'text-amber-400'
  const iconBg = type === 'pdf' ? 'bg-red-400/10' : type === 'video' ? 'bg-blue-400/10' : 'bg-amber-400/10'

  return (
    <div className="glass-card p-5 group hover:border-primary-500/50 transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        {status === 'APPROVED' ? (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            DISETUJUI
          </span>
        ) : status === 'PENDING' ? (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            MENUNGGU
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            DITOLAK
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-primary-300 font-medium">{subject} • {grade}</p>
        <p className="text-xs text-zinc-500 mt-2">Diupload oleh: {uploader}</p>
      </div>

      {status === 'APPROVED' && (
        <div className="mt-6 pt-4 border-t border-border">
          <button className="w-full flex items-center justify-center py-2 bg-surface-hover hover:bg-primary-600 hover:text-white text-zinc-300 rounded-lg transition-colors group-hover:border-primary-500">
            <Download className="w-4 h-4 mr-2" />
            Unduh Materi
          </button>
        </div>
      )}
    </div>
  )
}
