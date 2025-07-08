import { askAi } from '@/lib/askAi'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const queryLocale = url.searchParams.get('locale')
  const headerLocale = req.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale = queryLocale || headerLocale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en'

  const prompt = `Gere no idioma do locale ${locale} uma frase provocadora e impactante, com até 15 palavras, que pareça dita por alguém vaidoso, rico, prepotente ou excêntrico. Evite palavrões. Estilo debochado, alinhado com a ideia de alguém que pagou para se exibir publicamente.`

  const message = await askAi(prompt)
  return NextResponse.json({ message })
}
