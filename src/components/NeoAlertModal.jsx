'use client'

import { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export default function NeoAlertModal({
  isOpen,
  onClose,
  type = 'success',
  title,
  message,
  actionText = 'OK, Mengerti',
  onAction,
  cancelText,
  onCancel
}) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const config = {
    success: {
      headerBg: 'bg-[#10B981]',
      badgeBg: 'bg-[#D1FAE5]',
      badgeText: 'text-[#065F46]',
      badgeLabel: 'BERHASIL',
      iconBg: 'bg-[#D1FAE5]',
      iconColor: 'text-[#065F46]',
      Icon: CheckCircle2,
      btnClass: 'neo-btn-success',
      defaultTitle: 'Aksi Berhasil!',
    },
    error: {
      headerBg: 'bg-[#EF4444]',
      badgeBg: 'bg-[#FEE2E2]',
      badgeText: 'text-[#991B1B]',
      badgeLabel: 'ERROR / GAGAL',
      iconBg: 'bg-[#FEE2E2]',
      iconColor: 'text-[#991B1B]',
      Icon: XCircle,
      btnClass: 'neo-btn-danger',
      defaultTitle: 'Terjadi Kesalahan!',
    },
    warning: {
      headerBg: 'bg-[#F59E0B]',
      badgeBg: 'bg-[#FEF08A]',
      badgeText: 'text-[#854D0E]',
      badgeLabel: 'PERINGATAN',
      iconBg: 'bg-[#FEF08A]',
      iconColor: 'text-[#854D0E]',
      Icon: AlertTriangle,
      btnClass: 'neo-btn-primary',
      defaultTitle: 'Perhatian!',
    },
    info: {
      headerBg: 'bg-[#3B82F6]',
      badgeBg: 'bg-[#DBEAFE]',
      badgeText: 'text-[#1E40AF]',
      badgeLabel: 'INFORMASI',
      iconBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#1E40AF]',
      Icon: Info,
      btnClass: 'neo-btn-primary',
      defaultTitle: 'Pemberitahuan',
    },
  }[type] || config.info

  const CurrentIcon = config.Icon

  const handleAction = () => {
    if (onAction) {
      onAction()
    } else {
      onClose?.()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose?.()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Modal Dialog Card */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] max-w-md w-full overflow-hidden z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Top Decorative Bar */}
        <div className={`${config.headerBg} h-3 w-full border-b-2 border-black`} />

        <div className="p-6 md:p-7">
          {/* Header row: Badge + Close Button */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2.5 py-1 rounded-md border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] ${config.badgeBg} ${config.badgeText}`}>
              {config.badgeLabel}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              aria-label="Tutup popup"
            >
              <X className="w-4 h-4 text-black stroke-[3]" />
            </button>
          </div>

          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl border-2 border-black flex-shrink-0 flex items-center justify-center shadow-[3px_3px_0px_0px_#000] ${config.iconBg}`}>
              <CurrentIcon className={`w-7 h-7 stroke-[2.5] ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="text-xl font-black text-black leading-tight">
                {title || config.defaultTitle}
              </h3>
              <p className="text-xs text-gray-500 font-bold mt-0.5">
                Sistem Manajemen Lab IFP
              </p>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-[#FFFDF5] border-2 border-black rounded-xl p-4 mb-6 shadow-[3px_3px_0px_0px_#000]">
            <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
              {message}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {cancelText && (
              <button
                type="button"
                onClick={handleCancel}
                className="neo-btn-secondary px-5 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={handleAction}
              className={`${config.btnClass} px-6 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] w-full sm:w-auto`}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
