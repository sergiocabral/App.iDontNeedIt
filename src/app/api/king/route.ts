import { KingRepository } from '@/lib/repositories/kingRepository'
import { sanitizeTip } from '@/lib/utilsApp'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, message, imageBgColor, imageUrl, audioUrl, locale, tip } = await req.json()

  // Degrau e moeda resolvidos no servidor; o cliente só informa a gorjeta.
  const base = await KingRepository.getNextAmount()

  const king = await KingRepository.create({
    name,
    message,
    imageBgColor,
    imageUrl,
    audioUrl,
    locale,
    baseAmount: base.amount,
    amount: base.amount + sanitizeTip(tip),
    currency: base.currency,
  })

  return NextResponse.json({ success: true, id: king.id })
}
