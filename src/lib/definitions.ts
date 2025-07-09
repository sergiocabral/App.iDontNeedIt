import definitions from '@/../messages/_definitions.json'

export function getDefinitions() {
  return function def(key: string): string {
    return (definitions as unknown as Record<string, string>)[key] || ''
  }
}
