import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { KingRepository } from '@/lib/repositories/kingRepository'
import { sanitizeTip } from '@/lib/utilsApp'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const amount = await KingRepository.getNextAmount()
  const intent = await stripe.paymentIntents.create({
    amount: amount.amount + sanitizeTip(body.tip),
    currency: amount.currency,
    automatic_payment_methods: { enabled: true },
  })

  return NextResponse.json({ clientSecret: intent.client_secret })
}

// Sincroniza o valor do intent com a gorjeta atual antes do confirm no cliente.
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const clientSecret = typeof body.clientSecret === 'string' ? body.clientSecret : ''
  const intentId = clientSecret.split('_secret')[0]

  if (!intentId.startsWith('pi_')) {
    return NextResponse.json({ error: 'Invalid clientSecret' }, { status: 400 })
  }

  const amount = await KingRepository.getNextAmount()
  await stripe.paymentIntents.update(intentId, {
    amount: amount.amount + sanitizeTip(body.tip),
  })

  return NextResponse.json({ ok: true })
}
