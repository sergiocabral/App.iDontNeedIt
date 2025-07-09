'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '../ui/button'
import { useTranslations } from 'next-intl'
import * as Sentry from '@sentry/nextjs'
import { AmountType } from '@/lib/repositories/kingRepository'
import { useRouter } from 'next/navigation'
import { useToast } from '../ui/toaster'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripePayForm({
  onClick,
  isLoading,
}: {
  onClick?: () => void | boolean | Promise<void | boolean>
  isLoading?: boolean
}) {
  const [clientSecret, setClientSecret] = useState<string>()

  useEffect(() => {
    fetch('/api/stripe/intent', {
      method: 'POST',
    })
      .then((r) => r.json())
      .then((d) => setClientSecret(d.clientSecret))
  }, [])

  if (!clientSecret) return null

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Checkout onClick={onClick} isLoading={isLoading} />
    </Elements>
  )
}

function Checkout({
  onClick,
  isLoading,
}: {
  onClick?: () => void | boolean | Promise<void | boolean>
  isLoading?: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('StripePayFormComponent')
  const router = useRouter()
  const { showToast } = useToast()

  const [nextAmount, setNextAmount] = useState<AmountType | null>(null)
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

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)

    try {
      showToast(t('paymentSending'), 'info')
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: 'if_required',
      })

      if (result.error) {
        setLoading(false)
        console.error(result.error)
        showToast(t('paymentError'), 'error')
        return
      }

      let redirect = true
      if (onClick) {
        redirect = (await onClick()) !== false
      }

      showToast(t('paymentSuccess'), 'success')
      if (redirect) setTimeout(() => router.push('/'), 500)
    } catch (error) {
      setLoading(false)
      showToast(t('paymentError'), 'error')
      console.error('Payment confirmation error:', error)
      Sentry.captureException(error)
    }
  }

  return (
    <>
      <PaymentElement />
      {nextAmount && (
        <Button
          className="w-full mt-4 cursor-pointer bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
          disabled={loading || isLoading}
          onClick={handleSubmit}
        >
          {t('payButton', { amount: nextAmount.formatted })}
        </Button>
      )}
    </>
  )
}
