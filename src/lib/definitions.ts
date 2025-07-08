import { promises as fs } from 'fs'
import path from 'path'

export async function getDefinitions() {
  const filePath = path.resolve(process.cwd(), 'messages/_definitions.json')
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const dict = JSON.parse(fileContent)

  return function def(key: string): string {
    return dict[key] || ''
  }
}
