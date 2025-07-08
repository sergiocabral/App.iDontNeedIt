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
  prompt = `Não responda em pt-br; Responda no idioma '${locale}'. Gere um total de ${count} resultados, 1 por linha:\n\n${prompt}`
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
    'Nomes anônimos com 2 palavras, que soe como o apelido de alguém excêntrico e rico. Pode parecer nome de usuário, codinome ou apelido. Evite números, use apenas letras.',
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
    'Frase provocadora e impactante, com até 15 palavras, que pareça dita por alguém vaidoso, rico, prepotente ou excêntrico. Evite palavrões. Estilo debochado, alinhado com a ideia de alguém que pagou para se exibir publicamente.',
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
