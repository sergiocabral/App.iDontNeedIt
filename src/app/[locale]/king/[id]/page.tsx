import { getTranslations } from 'next-intl/server'
import { KingRepository } from '@/lib/repositories/kingRepository'
import { formatAmount, getFlagImageUrl, splitByMarker } from '@/lib/utilsApp'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getDefinitions } from '@/lib/definitions'

export default async function KingPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params

  const t = await getTranslations('KingPage')
  const def = getDefinitions()
  const king = await KingRepository.getById(id)

  if (!king) return notFound()

  const title = splitByMarker(t('title', { date: '|' }), '|')
  const description = splitByMarker(t('description', { amount: '|' }), '|')

  return (
    <>
      <header className="flex items-center justify-center py-4">
        <Image
          src="/img/logo.png"
          alt={def('appName')}
          width={256}
          height={256}
          className="h-24 w-auto"
        />
      </header>
      <main className="max-w-xl mx-auto p-8 space-y-8 text-center">
        <h1 className="text-3xl font-bold">
          {title.left} {king.createdAt.toLocaleDateString(locale)} {title.right}
        </h1>

        <div
          className="relative h-64 w-64 mx-auto rounded-full ring-4 ring-green-600"
          style={{ backgroundColor: king.imageBgColor }}
        >
          <Image
            src={`/api/file?key=${king.imageUrl}`}
            alt={king.name || 'King'}
            fill
            className="rounded-full object-cover shadow-lg"
          />
        </div>

        <div>
          <Image
            src={getFlagImageUrl(king.locale)}
            width={24}
            height={24}
            alt="flag"
            className="inline-block w-6 h-4 mr-2 rounded"
          />
        </div>

        {king.name && <h2 className="text-2xl font-semibold">{king.name}</h2>}

        <p className="text-muted-foreground">
          {description.left}{' '}
          <span className="text-xl text-green-600 font-bold">{formatAmount(king)}</span>{' '}
          {description.right}
        </p>

        {king.message && <p className="italic text-lg">&ldquo;{king.message}&rdquo;</p>}

        {king.audioUrl && (
          <audio controls className="mx-auto">
            <source src={`/api/file?key=${king.audioUrl}`} />
            {t('audioNotSupported')}
          </audio>
        )}

        <div className="space-x-4 pt-6">
          <Link
            href="/"
            className="inline-block bg-gray-700 text-white px-5 py-2 rounded hover:bg-gray-800 transition"
          >
            {t('backHome')}
          </Link>
        </div>
      </main>
      <footer className="text-center text-sm text-muted-foreground mt-16 pb-4">
        <a href={`mailto:${def('email')}`} className="underline">
          {def('email')}
        </a>
      </footer>
    </>
  )
}
