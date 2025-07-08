import { askAi } from '@/lib/askAi'
import { getDefinitions } from '@/lib/definitions'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const def = getDefinitions()
  const body = await req.json()
  const headerLocale = req.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale =
    body.locale || headerLocale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || def('defaultLocale')

  const prompt = `Responda em ${locale}. Gere uma frase provocadora e impactante, com até 15 palavras, que pareça dita por alguém vaidoso, rico, prepotente ou excêntrico. Evite palavrões. Estilo debochado, alinhado com a ideia de alguém que pagou para se exibir publicamente.`
  console.log(prompt)
  const message = await askAi(prompt)
  return NextResponse.json({ message })
}
