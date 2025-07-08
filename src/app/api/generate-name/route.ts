import { askAi } from '@/lib/askAi'
import { getDefinitions } from '@/lib/definitions'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const def = getDefinitions()
  const body = await req.json()
  const headerLocale = req.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale =
    body.locale || headerLocale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || def('defaultLocale')

  const prompt = `Gere no idioma do locale ${locale} um nome anônimo criativo com 2 palavras, que soe como o apelido de alguém excêntrico e rico. Pode parecer nome de usuário, codinome ou apelido. Evite números, use apenas letras.`

  const name = await askAi(prompt)
  return NextResponse.json({ name })
}
