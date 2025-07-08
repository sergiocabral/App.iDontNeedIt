import { openai } from '@/lib/ai'

export async function askAi(prompt: string) {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  })

  return response.choices[0].message?.content?.trim() || ''
}
