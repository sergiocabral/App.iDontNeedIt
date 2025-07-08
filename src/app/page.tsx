"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const phrases: Record<string, string> = {
  pt: "Algo insano está chegando...",
  en: "Something insane is coming...",
  es: "Algo insano está por llegar...",
  fr: "Quelque chose de fou arrive...",
  de: "Etwas Verrücktes kommt bald...",
  default: "Coming soon...",
}

export default function Home() {
  const [text, setText] = useState("")

  useEffect(() => {
    const lang = navigator.language.slice(0, 2)
    setText(phrases[lang] || phrases["default"])

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center overflow-hidden">
      <Image
        src="/img/logo.png"
        alt="idontneedit logo"
        width={200}
        height={200}
        className="animate-pulse-glow"
        priority
      />
      <h1 className="text-2xl mt-5 animate-fade-in">{text}</h1>
    </div>
  )
}
