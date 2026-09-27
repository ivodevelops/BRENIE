import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-edge bg-card shadow-float md:max-w-lg md:rounded-card">
        <div className="flex items-start justify-between gap-4 border-b border-edge-faint px-5 py-4">
          <div>
            <h2 className="font-display text-lg text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-3">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-btn p-1.5 text-ink-3 transition-colors hover:bg-card-hover hover:text-ink"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
