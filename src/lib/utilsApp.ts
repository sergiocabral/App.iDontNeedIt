export function formatAmmount(data: { amount: number; currency: string }): string {
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
