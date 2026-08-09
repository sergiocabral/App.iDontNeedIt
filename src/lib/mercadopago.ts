const MP_BASE_URL = 'https://api.mercadopago.com'

export function mpFetch(path: string, init?: RequestInit) {
  return fetch(`${MP_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })
}
