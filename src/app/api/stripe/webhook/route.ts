import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PaymentRepository } from '@/lib/repositories/paymentRepository'
import Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'

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

    Sentry.captureMessage(
      `Payment received: ${intent.id} - ${intent.amount} ${intent.currency}`,
      'info'
    )

    await PaymentRepository.create({
      stripeIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
    })
  }

  return NextResponse.json({ received: true })
}

export const config = { runtime: 'edge' }
