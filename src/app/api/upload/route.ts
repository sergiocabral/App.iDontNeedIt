// src/app/api/upload-url/route.ts
import { NextResponse } from 'next/server'
import { generateUploadUrl } from '@/lib/r2'

export async function GET(req: Request) {
  const { filename, contentType } = Object.fromEntries(new URL(req.url).searchParams)
  if (!filename || !contentType)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const safeKey = `kings/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const url = await generateUploadUrl(safeKey, contentType as string)
  return NextResponse.json({ url, key: safeKey })
}

/**
 * // Upload no frontend
 * async function uploadFile(file: File) {
 *   const res = await fetch(`/api/upload-url?filename=${file.name}&contentType=${file.type}`);
 *   const { url, key } = await res.json();
 *   await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
 *   return key; // Salvar no banco associando ao King
 * }
 */
