import { NextResponse } from 'next/server'
import { generateUploadUrl } from '@/lib/storage-s3'
import { slugify, uuid } from '@/lib/utils'

export async function POST(req: Request) {
  const { contentType, folder } = await req.json()

  if (!contentType) {
    return NextResponse.json({ error: 'The contentType is required.' }, { status: 400 })
  }

  const safeFolder = slugify(folder || 'general')
  const safeKey = `${safeFolder}/${uuid()}`

  try {
    const url = await generateUploadUrl(safeKey, contentType)
    return NextResponse.json({ url, key: safeKey })
  } catch (error) {
    console.error('Error generating upload URL:', error)
    return NextResponse.json({ error: 'Failed to generate upload URL.' }, { status: 500 })
  }
}
