import { KingRepository } from '@/lib/repositories/kingRepository'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, message, imageUrl, audioUrl, amount } = await req.json()

  const king = await KingRepository.create({ name, message, imageUrl, audioUrl, amount })

  return NextResponse.json({ success: true, id: king.id })
}
