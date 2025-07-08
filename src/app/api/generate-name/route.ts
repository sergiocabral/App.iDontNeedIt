import { askAi } from '@/lib/askAi'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const queryLocale = url.searchParams.get('locale')
  const headerLocale = req.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale = queryLocale || headerLocale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en'

  const prompt = `Gere no idioma do locale ${locale} um nome anônimo criativo com 2 palavras, que soe como o apelido de alguém excêntrico e rico. Pode parecer nome de usuário, codinome ou apelido. Evite números, use apenas letras.`

  const name = await askAi(prompt)
  return NextResponse.json({ name })
}
