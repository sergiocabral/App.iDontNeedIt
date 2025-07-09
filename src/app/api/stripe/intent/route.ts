import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { KingRepository } from '@/lib/repositories/kingRepository'

export async function POST() {
  const amount = await KingRepository.getNextAmount()
  const intent = await stripe.paymentIntents.create({
    amount: amount.amount,
    currency: amount.currency,
    automatic_payment_methods: { enabled: true },
  })

  return NextResponse.json({ clientSecret: intent.client_secret })
}
