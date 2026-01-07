"use client"

import * as React from "react"
import { createPortal } from "react-dom"

type ToastType = "default" | "destructive" | "success"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastType
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toast = React.useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant }])

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {mounted && createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[350px]">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`
                p-4 rounded-lg shadow-lg border text-sm transition-all duration-300 animate-in slide-in-from-right-full
                ${t.variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-gray-200 text-gray-900'}
              `}
            >
              {t.title && <div className="font-semibold mb-1">{t.title}</div>}
              {t.description && <div className="text-gray-500 text-xs">{t.description}</div>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
