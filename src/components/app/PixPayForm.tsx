'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useTranslations } from 'next-intl'
import * as Sentry from '@sentry/nextjs'
import { AmountType } from '@/lib/repositories/kingRepository'
import { useToast } from '../ui/toaster'
import { CopyIcon } from 'lucide-react'

type PixData = {
  id: number
  qrCode: string
  qrCodeBase64: string
  expiresAt: string
}

export function PixPayForm({
  canPay,
  isLoading,
  onFail,
}: {
  canPay: () => Promise<false | (() => Promise<void>)>
  isLoading?: boolean
  onFail?: () => void
}) {
  const t = useTranslations('PixPayFormComponent')
  const { showToast } = useToast()

  const [nextAmount, setNextAmount] = useState<AmountType | null>(null)
  const [creating, setCreating] = useState(false)
  const [pix, setPix] = useState<PixData | null>(null)
  const [remaining, setRemaining] = useState('')
  const saveRef = useRef<null | (() => Promise<void>)>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    fetch('/api/king/next')
      .then((res) => res.json())
      .then((data) => {
        setNextAmount(data)
      })
      .catch((error) => {
        console.error('Error fetching next amount:', error)
        Sentry.captureException(error)
      })
  }, [])

  // Polling de status (5s) + verificação de expiração
  useEffect(() => {
    if (!pix) return
    finishedRef.current = false

    const finishFail = (messageKey: string) => {
      finishedRef.current = true
      clearInterval(interval)
      showToast(t(messageKey), 'error')
      setPix(null)
      onFail?.()
    }

    const interval = setInterval(async () => {
      if (finishedRef.current) return
      if (Date.now() > new Date(pix.expiresAt).getTime()) {
        finishFail('expired')
        return
      }
      try {
        const res = await fetch(`/api/mercadopago/status?id=${pix.id}`)
        const data = await res.json()
        if (finishedRef.current) return
        if (data.status === 'approved') {
          // Marca como finalizado ANTES do await para o próximo tick não salvar de novo.
          finishedRef.current = true
          clearInterval(interval)
          showToast(t('paymentSuccess'), 'success')
          await saveRef.current?.()
        } else if (data.status === 'failed') {
          finishFail('paymentError')
        }
      } catch (error) {
        console.error('Error polling Pix status:', error)
        Sentry.captureException(error)
      }
    }, 5000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pix])

  // Countdown mm:ss
  useEffect(() => {
    if (!pix) return
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((new Date(pix.expiresAt).getTime() - Date.now()) / 1000)
      )
      setRemaining(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [pix])

  const handleStart = async () => {
    setCreating(true)
    try {
      const canPayHandle = await canPay()
      if (canPayHandle === false) {
        setCreating(false)
        return
      }
      saveRef.current = canPayHandle

      const res = await fetch('/api/mercadopago/pix', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create Pix payment')
      const data = await res.json()
      if (!data.qrCode || !data.qrCodeBase64) throw new Error('Pix response missing QR data')
      setPix(data)
    } catch (error) {
      console.error('Error creating Pix payment:', error)
      Sentry.captureException(error)
      showToast(t('paymentError'), 'error')
      onFail?.()
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async () => {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix.qrCode)
      showToast(t('copied'), 'success')
    } catch (error) {
      console.error('Error copying Pix code:', error)
    }
  }

  const handleCancel = () => {
    finishedRef.current = true
    setPix(null)
    onFail?.()
  }

  if (pix) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-center font-semibold">{t('scanTitle')}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${pix.qrCodeBase64}`}
          alt="Pix QR Code"
          className="w-56 h-56 mx-auto rounded-lg border bg-white"
        />
        <Textarea
          readOnly
          value={pix.qrCode}
          rows={3}
          className="text-xs resize-none"
          onFocus={(e) => e.target.select()}
        />
        <Button
          className="w-full cursor-pointer bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
          onClick={handleCopy}
        >
          <CopyIcon className="w-4 h-4 mr-2" />
          {t('copyButton')}
        </Button>
        <p className="text-sm text-center text-muted-foreground animate-pulse">
          {t('waitingPayment', { time: remaining })}
        </p>
        <Button variant="secondary" className="w-full cursor-pointer" onClick={handleCancel}>
          {t('cancelButton')}
        </Button>
      </div>
    )
  }

  return (
    nextAmount && (
      <Button
        className="w-full mt-4 cursor-pointer bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
        disabled={creating || isLoading}
        onClick={handleStart}
      >
        {creating ? t('generating') : t('payButton', { amount: nextAmount.formatted })}
      </Button>
    )
  )
}
