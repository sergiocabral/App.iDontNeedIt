import type { Metadata } from 'next'
import Script from 'next/script'
import { Copse } from 'next/font/google'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getDefinitions } from '@/lib/definitions'
import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/toaster'

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
  const def = getDefinitions()
  const t = await getTranslations({ locale, namespace: 'LocaleLayout' })

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

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }, { locale: 'es' }]
}

interface Props {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  const defaultMessages = (await import('@/../messages/en.json')).default

  let localeMessages = {}
  try {
    localeMessages = (await import(`@/../messages/${locale}.json`)).default
  } catch {}

  const messages = { ...defaultMessages, ...localeMessages }

  return (
    <html lang="en" className="light">
      <body
        className={`${copse.variable} antialiased min-h-screen bg-gradient-to-b from-[#f3e8ff] via-[#f9f5ff] to-[#fdfcfe]`}
      >
        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
