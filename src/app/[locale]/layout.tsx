import type { Metadata } from 'next'
import Script from 'next/script'
import { Copse } from 'next/font/google'
import '../globals.css'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'

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
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://idontneedit.org',
      siteName: t('title'),
      locale: locale.replace('-', '_'),
      type: 'website',
      images: ['/opengraph-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('twitter'),
      site: '@qynea',
      creator: '@qynea',
      images: ['/opengraph-image.png'],
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
    <html lang="en">
      <body className={`${copse.variable} antialiased`}>
        <Script
          async
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
