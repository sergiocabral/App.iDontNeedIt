import { useState } from 'react'

export function useRotatingValues(apiEndpoint: string) {
  const [values, setValues] = useState<string[]>([])
  const [index, setIndex] = useState(0)

  async function fetchValues(locale: string) {
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    })
    const data = await res.json()
    setValues(data || [])
    setIndex(0)
  }

  function getNextValue() {
    if (values.length === 0) return ''
    const value = values[index]
    setIndex((prev) => (prev + 1) % values.length)
    return value
  }

  return { fetchValues, getNextValue, values }
}
