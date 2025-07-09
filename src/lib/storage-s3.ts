import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME
const endpoint = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL

if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !endpoint) {
  throw new Error('Missing Cloudflare R2 environment variables.')
}

export const s3Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

export async function generateUploadUrl(key: string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })
  return await getSignedUrl(s3Client, cmd, { expiresIn: 3600 })
}

export async function getPresignedUrl(key: string) {
  key = endpoint && key.indexOf(endpoint) === 0 ? key.substring(endpoint.length + 1) : key
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })
  return await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 })
}
