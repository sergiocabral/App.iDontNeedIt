import { getDefinitions } from '@/lib/definitions'
import { KingRepository } from '@/lib/repositories/kingRepository'
import { formatAmount, splitByMarker } from '@/lib/utilsApp'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const t = await getTranslations('HomePage')
  const def = getDefinitions()

  const kings = await KingRepository.listAll()

  const nextAmount = await KingRepository.getNextAmount()

  if (!kings.length) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-lg font-medium">{t('proveRichest')}</p>
        <Link
          href="/pay"
          className="inline-block bg-green-600 text-background px-6 py-2 rounded text-lg font-semibold hover:opacity-90 transition"
        >
          {t('throwOneDollar', { amount: nextAmount.formatted })}
        </Link>
      </div>
    )
  }

  const [topKing, ...previousKings] = kings.sort(
    (a, b) => b.amount - a.amount || b.createdAt.getTime() - a.createdAt.getTime()
  )

  const pageTitle = splitByMarker(t('droppedToLeaveMark', { amount: '|' }), '|')
  const kingTitle = splitByMarker(t('wastedBecauseICan', { amount: '|' }), '|')

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
      <main className="max-w-4xl mx-auto p-8 space-y-8">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
            {pageTitle.left}{' '}
            <Link
              href="/pay"
              className="inline-block bg-green-600 hover:bg-green-500 active:scale-95 text-background px-6 py-2 rounded text-lg font-semibold transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
            >
              {formatAmount(topKing)}
            </Link>{' '}
            {pageTitle.right}
          </h1>
          <div
            className="inline-block relative h-64 w-64 mx-auto rounded-full motion-safe:animate-pulse"
            style={{ backgroundColor: topKing.imageBgColor }}
          >
            <Image
              src={`/api/file?key=${topKing.imageUrl}`}
              alt={topKing.name || 'King atual'}
              fill
              className="rounded-full object-cover shadow-lg"
            />
          </div>
          {topKing.name && <h2 className="text-2xl font-semibold">{topKing.name}</h2>}
          {topKing.message && <p className="italic">&ldquo;{topKing.message}&rdquo;</p>}
          {topKing.audioUrl && (
            <audio controls className="mx-auto">
              <source src={`/api/file?key=${topKing.audioUrl}`} />
              {t('audioNotSupported')}
            </audio>
          )}
        </section>

        {previousKings.length > 0 && (
          <section className="space-y-4 mt-24">
            <h2 className="text-2xl font-semibold">{t('richestListTitle')}</h2>
            <ul className="space-y-4">
              {previousKings.map((king) => (
                <li key={king.id} className="flex items-center gap-4 border p-4 rounded">
                  <div
                    className="relative h-20 w-20 flex-shrink-0 ring-2 ring-accent rounded-full"
                    style={{ backgroundColor: king.imageBgColor }}
                  >
                    <Link href={`/king/${king.id}`}>
                      <Image
                        src={`/api/file?key=${king.imageUrl}`}
                        alt={king.name || 'King anterior'}
                        fill
                        className="rounded-full object-cover"
                      />
                    </Link>
                  </div>

                  <div className="space-y-1">
                    {king.name && <h3 className="font-semibold">{king.name}</h3>}
                    <p className="text-muted-foreground">
                      {kingTitle.left}{' '}
                      <span className="text-xl text-green-600 font-bold">{formatAmount(king)}</span>{' '}
                      {kingTitle.right}
                    </p>
                    {king.message && (
                      <p className="italic text-sm font-bold">&ldquo;{king.message}&rdquo;</p>
                    )}
                    {king.audioUrl && (
                      <audio controls className="mx-auto w-full my-4">
                        <source src={`/api/file?key=${king.audioUrl}`} />
                        {t('audioNotSupported')}
                      </audio>
                    )}
                    <p className="text-xs text-foreground/25">{king.createdAt.toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <footer className="text-center text-sm text-muted-foreground mt-16 pb-4">
        <a href={`mailto:${def('email')}`} className="underline">
          {def('email')}
        </a>
      </footer>
    </>
  )
}
