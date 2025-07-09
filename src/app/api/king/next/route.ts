import { KingRepository } from '@/lib/repositories/kingRepository'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const nextAmount = await KingRepository.getNextAmount()
  return NextResponse.json({ value: nextAmount })
}
