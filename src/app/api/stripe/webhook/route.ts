import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { savePayment } from '@/lib/repositories/paymentRepository'
import Stripe from 'stripe'

/**
 * Webhook Stripe. Lida apenas com pagamento confirmado.
 */
export async function POST(req: NextRequest) {
  const sig = (await headers()).get('stripe-signature') as string
  const body = await req.arrayBuffer()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent

    await savePayment({
      stripeIntentId: intent.id,
      amount: intent.amount / 100,
      type: intent.metadata.type as 'KING' | 'SEAT',
    })
  }

  return NextResponse.json({ received: true })
}

export const config = { runtime: 'edge' }
