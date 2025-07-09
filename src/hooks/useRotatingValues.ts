import { useState, useCallback } from 'react'

export function useRotatingValues(apiEndpoint: string) {
  const [values, setValues] = useState<string[]>([])
  const [index, setIndex] = useState(0)

  const fetchValues = useCallback(
    async (locale: string) => {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      const data = await res.json()
      setValues(data || [])
      setIndex(0)
    },
    [apiEndpoint]
  )

  const getNextValue = useCallback(() => {
    if (values.length === 0) return ''
    const value = values[index]
    setIndex((prev) => (prev + 1) % values.length)
    return value
  }, [values, index])

  return { fetchValues, getNextValue, values }
}
