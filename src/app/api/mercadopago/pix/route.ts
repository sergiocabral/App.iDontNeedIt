import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { KingRepository } from '@/lib/repositories/kingRepository'
import { mpFetch } from '@/lib/mercadopago'
import { getDefinitions } from '@/lib/definitions'
import { formatAmount, sanitizeTip } from '@/lib/utilsApp'
import * as Sentry from '@sentry/nextjs'

const PIX_EXPIRATION_MINUTES = 30

export async function POST(req: NextRequest) {
  const def = getDefinitions()
  const body = await req.json().catch(() => ({}))
  const amount = await KingRepository.getNextAmount()
  const totalAmount = amount.amount + sanitizeTip(body.tip)

  // Mercado Pago rejeita o sufixo 'Z' do toISOString(); exige offset explícito.
  const expiresAt = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000)
    .toISOString()
    .replace(/Z$/, '+00:00')

  const res = await mpFetch('/v1/payments', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': randomUUID() },
    body: JSON.stringify({
      // A API espera decimal em reais, não centavos.
      transaction_amount: Math.round(totalAmount) / 100,
      description: def('appName') || "I Don't Need It",
      payment_method_id: 'pix',
      // Obrigatório; não pode ser o e-mail do dono da conta (payer == collector é rejeitado).
      payer: { email: `guest-${randomUUID().slice(0, 8)}@example.com` },
      external_reference: randomUUID(),
      date_of_expiration: expiresAt,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    console.error('Mercado Pago error:', res.status, errorBody)
    Sentry.captureMessage(`Mercado Pago Pix creation failed: ${res.status} ${errorBody}`, 'error')
    return NextResponse.json({ error: 'Failed to create Pix payment' }, { status: 502 })
  }

  const data = await res.json()
  const transactionData = data.point_of_interaction?.transaction_data

  if (!transactionData?.qr_code || !transactionData?.qr_code_base64) {
    Sentry.captureMessage(`Mercado Pago Pix response missing QR data: ${data.id}`, 'error')
    return NextResponse.json({ error: 'Pix response missing QR data' }, { status: 502 })
  }

  return NextResponse.json({
    id: data.id,
    qrCode: transactionData.qr_code,
    qrCodeBase64: transactionData.qr_code_base64,
    expiresAt: data.date_of_expiration || expiresAt,
    formatted: formatAmount({ amount: totalAmount, currency: amount.currency }),
  })
}
