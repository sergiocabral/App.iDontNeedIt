import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uuid(): string {
  // Gera um UUID v4 simplificado (hex com hífens)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function slugify(text: string): string {
  const regexDiscardChars = /[^a-z0-9-]/g
  const regexSpaces = /(^-+|-+$|(?<=-)-+)/g
  return removeAccents(text).toLowerCase().replace(regexDiscardChars, '-').replace(regexSpaces, '')
}

export async function fetchUrlAsFile(
  url: string,
  filename: string,
  forcedContentType?: string
): Promise<File> {
  const response = await fetch(url)

  if (!response.ok) throw new Error('Failed to fetch external avatar.')

  const blob = await response.blob()

  const contentType = forcedContentType || blob.type || 'application/octet-stream'

  return new File([blob], filename, { type: contentType })
}
