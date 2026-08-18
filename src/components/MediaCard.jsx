import { Download, FileText, Video, Presentation, Trash2 } from 'lucide-react'

export default function MediaCard({ id, title, subject, grade_level, file_type, file_url, profiles, author_name, status, isAdmin, onDelete }) {
  const type = file_type || 'pdf'
  const uploaderName = profiles?.full_name || author_name || 'Guru Pengampu'
  
  // Icon & styling berdasarkan tipe berkas
  const Icon = type === 'pdf' ? FileText : type === 'video' ? Video : Presentation
  const iconBg = type === 'pdf' ? 'bg-[#FEE2E2] text-[#EF4444]' : type === 'video' ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#FEF08A] text-[#854D0E]'

  return (
    <div className="neo-card-interactive p-5 flex flex-col h-full bg-white justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] ${iconBg}`}>
            <Icon className="w-5 h-5 stroke-[2.5]" />
          </div>
          
          {status === 'APPROVED' ? (
            <span className="neo-stamp neo-stamp-approved text-[10px]">
              ✓ DISETUJUI
            </span>
          ) : status === 'PENDING_VALIDATION' ? (
            <span className="neo-stamp neo-stamp-pending text-[10px]">
              ⏳ MENUNGGU
            </span>
          ) : (
            <span className="neo-stamp neo-stamp-danger text-[10px]">
              ✕ DITOLAK
            </span>
          )}
        </div>

        <h3 className="font-black text-black text-base line-clamp-2 leading-snug mb-1">
          {title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1E40AF] border border-black font-bold text-[10px]">
            {subject}
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-black font-bold text-[10px]">
            {grade_level || 'Semua Kelas'}
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-500 mt-2.5">
          Oleh: <span className="text-black font-bold">{uploaderName}</span>
        </p>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center gap-2">
        {file_url && (
          <a
            href={file_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="neo-btn-secondary flex-1 py-2 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
            Unduh / Buka
          </a>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete?.({ id, title })}
            className="p-2 bg-[#FEE2E2] hover:bg-[#EF4444] text-[#991B1B] hover:text-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer"
            title="Hapus Bahan Ajar Ini"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  )
}
