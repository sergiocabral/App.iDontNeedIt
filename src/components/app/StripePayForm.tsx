'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '../ui/button'
import { useTranslations } from 'next-intl'
import { formatAmmount } from '@/lib/utils'
import * as Sentry from '@sentry/nextjs'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripePayForm() {
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
      <Checkout />
    </Elements>
  )
}

function Checkout() {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const t = useTranslations('PayPage')

  const [nextAmount, setNextAmount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/king/next')
      .then((res) => res.json())
      .then((data) => {
        setNextAmount(data.value)
      })
      .catch((error) => {
        console.error('Error fetching next amount:', error)
        Sentry.captureException(error)
      })
  }, [])

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: 'https://fb896d013c83.ngrok-free.app/api/stripe/webhook' },
    })
    setLoading(false)
  }

  return (
    <>
      <PaymentElement />
      {nextAmount && (
        <Button
          className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
          disabled={loading}
          onClick={handleSubmit}
        >
          {t('payButton', { ammount: formatAmmount(nextAmount) })}
        </Button>
      )}
    </>
  )
}
