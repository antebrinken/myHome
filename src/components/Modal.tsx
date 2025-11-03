import type { PropsWithChildren, ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
}

export default function Modal({ open, onClose, title, children }: PropsWithChildren<ModalProps>) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        {title != null && (
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">{title}</div>
            <button className="text-slate-300 hover:text-white" onClick={onClose}>Close</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
