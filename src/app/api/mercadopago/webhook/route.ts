import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { mpFetch } from '@/lib/mercadopago'
import { PaymentRepository } from '@/lib/repositories/paymentRepository'
import * as Sentry from '@sentry/nextjs'

const CLOCK_TOLERANCE_SECONDS = 300

/**
 * Assinatura do Mercado Pago: manifesto `id:{data.id};request-id:{x-request-id};ts:{ts};`
 * (pares com valor ausente são omitidos), HMAC-SHA256 com o secret do webhook,
 * comparado em tempo constante. O `data.id` vem da QUERY STRING da notificação.
 */
function verifySignature(request: NextRequest): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return false

  const signatureHeader = request.headers.get('x-signature')
  if (!signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, ...rest] = part.split('=')
      return [key?.trim(), rest.join('=').trim()]
    })
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1 || !/^\d+$/.test(ts)) return false

  const driftSeconds = Math.abs(Date.now() - Number(ts) * 1000) / 1000
  if (driftSeconds > CLOCK_TOLERANCE_SECONDS) return false

  const dataId =
    request.nextUrl.searchParams.get('data.id') || request.nextUrl.searchParams.get('data_id')
  const requestId = request.headers.get('x-request-id')

  const manifestParts: string[] = []
  if (dataId) manifestParts.push(`id:${dataId}`)
  if (requestId) manifestParts.push(`request-id:${requestId}`)
  manifestParts.push(`ts:${ts}`)
  const manifest = `${manifestParts.join(';')};`

  const computed = createHmac('sha256', secret).update(manifest).digest('hex')
  const computedBuffer = Buffer.from(computed)
  const receivedBuffer = Buffer.from(v1)
  return (
    computedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(computedBuffer, receivedBuffer)
  )
}

export async function POST(request: NextRequest) {
  if (!verifySignature(request)) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  let body: { type?: string; data?: { id?: string | number } } = {}
  try {
    body = await request.json()
  } catch {
    // Corpo é só sinal; segue com a query string.
  }

  const topic = body.type || request.nextUrl.searchParams.get('topic') || ''
  const paymentId = String(body.data?.id || request.nextUrl.searchParams.get('data.id') || '')

  if (topic !== 'payment' || !paymentId) {
    return NextResponse.json({ received: true })
  }

  // Nunca confiar no corpo da notificação: buscar o estado autoritativo no MP.
  const res = await mpFetch(`/v1/payments/${encodeURIComponent(paymentId)}`)
  if (!res.ok) {
    // 500 força o Mercado Pago a reentregar a notificação depois.
    return new NextResponse('Failed to fetch payment', { status: 500 })
  }

  const payment = await res.json()
  if (payment.status === 'approved') {
    const existing = await PaymentRepository.getByMercadoPagoId(paymentId)
    if (!existing) {
      const amount = Math.round((payment.transaction_amount ?? 0) * 100)
      const currency = (payment.currency_id || 'BRL').toLowerCase()

      Sentry.captureMessage(`Payment received (Pix): ${paymentId} - ${amount} ${currency}`, 'info')

      await PaymentRepository.create({
        mercadoPagoPaymentId: paymentId,
        amount,
        currency,
      })
    }
  }

  return NextResponse.json({ received: true })
}
