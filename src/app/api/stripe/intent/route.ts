import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { KingRepository } from '@/lib/repositories/kingRepository'

export async function POST(req: NextRequest) {
  const amount = await KingRepository.getNextAmount()
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'brl',
    automatic_payment_methods: { enabled: true },
  })

  return NextResponse.json({ clientSecret: intent.client_secret })
}
