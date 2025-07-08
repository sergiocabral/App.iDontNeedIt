import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const payload = await request.json()
  const userAgent = payload.userAgent ?? request.headers.get('user-agent') ?? 'unknown'
  const referrer = payload.referrer ?? request.headers.get('referer') ?? 'unknown'
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  try {
    await prisma.accessLog.create({
      data: { ip, userAgent, referrer },
    })

    console.info(`[AccessLog] [${new Date().toISOString()}] Logged access from IP ${ip}`)
  } catch (err) {
    console.warn(`[AccessLog] [${new Date().toISOString()}] Failed to log access`, {
      ip,
      userAgent,
      referrer,
      error: (err as Error).message,
    })
  }

  return NextResponse.json({ ok: true })
}
