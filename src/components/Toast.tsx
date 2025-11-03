import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastKind = 'success' | 'error' | 'info'
export type ToastItem = { id: string; kind: ToastKind; message: string; ttl?: number }

type ToastContextType = {
  push: (kind: ToastKind, message: string, ttl?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((kind: ToastKind, message: string, ttl = 3000) => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { id, kind, message, ttl }])
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, ttl)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[80] bottom-4 right-4 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-md border px-3 py-2 shadow-md text-sm ${
              t.kind === 'success'
                ? 'bg-emerald-600/20 border-emerald-400/40 text-emerald-100'
                : t.kind === 'error'
                ? 'bg-rose-600/20 border-rose-400/40 text-rose-100'
                : 'bg-white/10 border-white/20 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
