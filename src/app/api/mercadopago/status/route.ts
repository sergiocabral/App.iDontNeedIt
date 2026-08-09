import { NextRequest, NextResponse } from 'next/server'
import { mpFetch } from '@/lib/mercadopago'

const FAILED_STATUSES = ['rejected', 'cancelled', 'refunded', 'charged_back']

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const res = await mpFetch(`/v1/payments/${encodeURIComponent(id)}`)
  if (!res.ok) {
    // Fail-safe: erro transitório mantém o polling do cliente vivo.
    return NextResponse.json({ status: 'pending' })
  }

  const data = await res.json()
  const status =
    data.status === 'approved'
      ? 'approved'
      : FAILED_STATUSES.includes(data.status)
        ? 'failed'
        : 'pending'

  return NextResponse.json({ status })
}
