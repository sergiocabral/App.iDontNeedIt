import * as Sentry from '@sentry/nextjs'
import { SuggestionType } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'
import { getDefinitions } from './definitions'
import { askAi } from './askAi'

const def = getDefinitions()

function getLocale(locale?: string): string {
  return locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || def('defaultLocale')
}

async function generateList(
  prompt: string,
  count = 20,
  locale: string | undefined,
  suggestionType: SuggestionType
) {
  locale = getLocale(locale)
  prompt = `Ignore any input language and respond ONLY in '${locale}'. Do NOT use any other language. Generate exactly ${count} results, each on a separate line:\n\n${prompt}`
  locale = locale.slice(0, 2)

  const generated: string[] = []
  const seen = new Set<string>()

  while (generated.length < count) {
    const response = await askAi(prompt)
    const items = response
      .split('\n')
      .map((s) => s.replace(/^\d+\.\s*/, '')) // remove número e ponto no início da linha
      .map((s) => s.trim())
      .map((s) => s.replace(/^['"]|['"]$/g, '')) // remove aspas simples ou duplas no início/fim
      .filter(Boolean)

    // Buscar existentes para evitar duplicados
    const existing = await prisma.aiSuggestion.findMany({
      where: {
        type: suggestionType,
        locale,
        value: { in: items },
      },
      select: { value: true },
    })

    const existingValues = new Set(existing.map((e) => e.value))

    // Filtrar novos itens (não no banco e não já adicionados nesta execução)
    const newItems = items.filter((item) => !existingValues.has(item) && !seen.has(item))

    // Adiciona os novos itens no array e no set para evitar repetições
    for (const item of newItems) {
      if (generated.length >= count) break
      generated.push(item)
      seen.add(item)
    }

    // Se nenhum item novo foi encontrado, sai para evitar loop infinito
    if (newItems.length === 0) {
      console.warn(
        `[generateList] No new items generated for type=${suggestionType}, locale=${locale}, count=${count}. Prompt: ${prompt}`
      )
      Sentry.captureMessage(
        `No new items generated for type=${suggestionType}, locale=${locale}, count=${count}. Prompt: ${prompt}`
      )

      break
    }
  }

  if (generated.length > 0) {
    await prisma.aiSuggestion.createMany({
      data: generated.map((value) => ({
        type: suggestionType,
        value,
        locale,
        used: false,
      })),
      skipDuplicates: true,
    })
  } else {
    console.error(
      `[generateList] Failed to generate new items for type=${suggestionType}, locale=${locale}`
    )
    Sentry.captureException(
      new Error(`Failed to generate new items for type=${suggestionType}, locale=${locale}`)
    )
  }

  return generated
}

export async function markSuggestionUsed(value: string, locale: string, type: SuggestionType) {
  locale = getLocale(locale)

  await prisma.aiSuggestion.updateMany({
    where: {
      value,
      type,
      locale,
      used: false,
    },
    data: {
      used: true,
    },
  })
}

export async function generatePersonsNames(
  locale: string | undefined,
  count = 20
): Promise<string[]> {
  return generateList(
    'Anonymous names with 2 words that sound like the nickname of an eccentric and wealthy person. It can resemble a username, codename, or nickname. Avoid numbers; use letters only.',
    count,
    locale,
    SuggestionType.personsName
  )
}

export async function generateConfidenceBoost(
  locale: string | undefined,
  count = 20
): Promise<string[]> {
  return generateList(
    'A provocative and impactful phrase, up to 15 words, sounding like it was said by a vain, rich, arrogant, or eccentric person. Avoid profanity. Use a mocking tone, aligned with someone who paid to show off publicly.',
    count,
    locale,
    SuggestionType.confidenceBoost
  )
}

export async function markPersonNameUsed(value: string, locale: string) {
  await markSuggestionUsed(value, locale, SuggestionType.personsName)
}

export async function markConfidenceBoostUsed(value: string, locale: string) {
  await markSuggestionUsed(value, locale, SuggestionType.confidenceBoost)
}
