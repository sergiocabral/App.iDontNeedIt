import { getDefinitions } from './definitions'

const def = getDefinitions()

export function formatAmount(data: { amount: number; currency: string }): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount / 100)
}

export function splitByMarker(text: string, marker: string) {
  const left = text.substring(0, text.indexOf(marker))
  const right = text === left ? '' : text.substring(text.indexOf(marker) + marker.length)
  return { left, right }
}

export function getFlagEmoji(locale: string): string {
  const countryCode = locale.split(/[-_]/)[1]?.toUpperCase() || def('defaultCountry').toUpperCase()
  return countryCode.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

export function getFlagImageUrl(locale: string): string {
  const countryCode = locale.split(/[-_]/)[1]?.toLowerCase() || def('defaultCountry').toLowerCase()
  return `https://flagcdn.com/w40/${countryCode}.png`
}
