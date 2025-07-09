import { KingRepository } from '@/lib/repositories/kingRepository'
import { formatAmmount } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  const splitByMarker = (text: string, marker: string = 'ammount') => {
    const mark = '|'
    const values: Record<string, string> = {}
    values[marker] = mark
    text = t(text, values)
    const left = text.substring(0, text.indexOf(mark))
    const right = text === left ? '' : text.substring(text.indexOf(mark) + mark.length)
    return { left, right }
  }

  const kings = await KingRepository.listAll()

  const nextAmmount = await KingRepository.getNextAmount()

  if (!kings.length) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-lg font-medium">{t('proveRichest')}</p>
        <Link
          href="/pay"
          className="inline-block bg-green-600 text-background px-6 py-2 rounded text-lg font-semibold hover:opacity-90 transition"
        >
          {t('throwOneDollar', { ammount: nextAmmount.formatted })}
        </Link>
      </div>
    )
  }

  const [topKing, ...previousKings] = kings.sort(
    (a, b) => b.amount - a.amount || b.createdAt.getTime() - a.createdAt.getTime()
  )

  const pageTitle = splitByMarker('droppedToLeaveMark')
  const kingTitle = splitByMarker('wastedBecauseICan')

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          {pageTitle.left}{' '}
          <Link
            href="/pay"
            className="inline-block bg-green-600 text-background px-6 py-2 rounded text-2xl font-semibold hover:opacity-90 transition"
          >
            {formatAmmount(topKing)}
          </Link>{' '}
          {pageTitle.right}
        </h1>
        <div
          className="inline-block relative h-64 w-64 mx-auto rounded-full"
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
                  <Image
                    src={`/api/file?key=${king.imageUrl}`}
                    alt={king.name || 'King anterior'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  {king.name && <h3 className="font-semibold">{king.name}</h3>}
                  <p className="text-muted-foreground">
                    {kingTitle.left}{' '}
                    <span className="text-xl text-green-600 font-bold">{formatAmmount(king)}</span>{' '}
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
  )
}
