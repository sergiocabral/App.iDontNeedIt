import { getTranslations } from 'next-intl/server'

export async function getDefinitions(locale?: string) {
  const defaultLocale = 'en'
  try {
    return await getTranslations({ locale: locale || defaultLocale, namespace: 'Definitions' })
  } catch {
    return await getTranslations({ locale: defaultLocale, namespace: 'Definitions' })
  }
}
