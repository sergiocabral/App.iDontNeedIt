import { KingRepository } from '@/lib/repositories/kingRepository'
import { NextResponse } from 'next/server'

export async function GET() {
  const nextAmount = await KingRepository.getNextAmount()
  return NextResponse.json(nextAmount)
}
