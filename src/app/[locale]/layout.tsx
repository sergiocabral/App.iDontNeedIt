import type { Metadata } from 'next'
import Script from 'next/script'
import { Copse } from 'next/font/google'
import '../globals.css'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { getDefinitions } from '@/lib/definitions'

const copse = Copse({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-copse',
  display: 'swap',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const def = await getDefinitions(locale)
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: def('appName'),
    description: t('description'),
    openGraph: {
      title: def('appName'),
      description: t('description'),
      url: def('website'),
      siteName: def('appName'),
      locale: locale.replace('-', '_'),
      type: 'website',
      images: ['/img/opengraph-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: def('appName'),
      description: t('description'),
      site: def('website'),
      creator: def('twitterCreator'),
      images: ['/img/opengraph-image.png'],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang="en" className="light">
      <body className={`${copse.variable} antialiased`}>
        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
