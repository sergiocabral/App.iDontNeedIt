import { getPresignedUrl } from '@/lib/storage-s3'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  if (!key) {
    return new Response('Missing key', { status: 400 })
  }

  try {
    const url = await getPresignedUrl(key)
    const res = await fetch(url)

    if (!res.ok) {
      return new Response('Failed to fetch file', { status: res.status })
    }

    const headers = new Headers()
    const contentType = res.headers.get('content-type')
    const contentLength = res.headers.get('content-length')

    if (contentType) headers.set('Content-Type', contentType)
    if (contentLength) headers.set('Content-Length', contentLength)

    return new Response(res.body, {
      status: 200,
      headers,
    })
  } catch {
    return new Response('Internal Server Error', { status: 500 })
  }
}
