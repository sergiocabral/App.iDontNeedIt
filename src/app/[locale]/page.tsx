'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('HomePage')

  useEffect(() => {
    fetch('/api/ping', {
      method: 'POST',
      body: JSON.stringify({
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center overflow-hidden">
      <Image
        src="/img/logo.png"
        alt="idontneedit logo"
        width={200}
        height={200}
        className="animate-pulse-glow"
        priority
      />
      <h1 className="text-2xl mt-5 animate-fade-in">{t('comingSoon')}</h1>
    </div>
  )
}
