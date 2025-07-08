import { generateConfidenceBoost } from '@/lib/aiGenerators'
import { getDefinitions } from '@/lib/definitions'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const def = getDefinitions()

  let body: Record<string, any>
  try {
    body = await req.json()
  } catch (e) {
    body = {}
  }

  const headerLocale = req.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale =
    body.locale || headerLocale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || def('defaultLocale')

  const values = await generateConfidenceBoost(locale)

  return NextResponse.json(values)
}
