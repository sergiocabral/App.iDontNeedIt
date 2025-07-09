'use client'

import React, { createContext, useContext, useState } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import clsx from 'clsx'

type ToastVariants = 'info' | 'success' | 'error' | 'warning'

const variantClasses: Record<ToastVariants, string> = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
}

type ToastContextType = {
  showToast: (message: string, variant?: ToastVariants) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState<string | undefined>(undefined)

  function showToast(message: string, variant?: ToastVariants) {
    setMessage(message)
    setVariant(variant)
    setOpen(true)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className={clsx(
            'fixed bottom-4 right-4 px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3',
            variantClasses[variant as ToastVariants]
          )}
          duration={5000}
        >
          <Toast.Title className="text-sm font-medium flex-1">{message}</Toast.Title>
          <Toast.Close className="text-xl font-bold px-2 py-1 leading-none">
            <X className="w-4 h-4" />
          </Toast.Close>
        </Toast.Root>

        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
