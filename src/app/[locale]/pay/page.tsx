'use client'

import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RefreshCwIcon, SparklesIcon, MessageSquareQuoteIcon, CircleUserRound } from 'lucide-react'
import { getDefinitions } from '@/lib/definitions'
import { useRotatingValues } from '@/hooks/useRotatingValues'
import { useParams } from 'next/navigation'
import { AvatarUpload } from '@/components/app/AvatarUpload'
import * as Sentry from '@sentry/nextjs'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { fetchUrlAsFile } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'

const AudioRecorder = dynamic(
  () => import('@/components/app/AudioRecorder').then((mod) => mod.default),
  { ssr: false }
)

export default function PayPage() {
  const def = getDefinitions()
  const t = useTranslations('PayPage')
  const { locale } = useParams<{ locale: string }>()

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)

  audioFile?.toString() // Para evitar erro de linting, não é usado diretamente

  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).substring(7))
  const [avatarBg, setAvatarBg] = useState('')
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')

  const [loading, setLoading] = useState(false)

  const { showToast } = useToast()

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

  // Gera a URL do avatar baseado no seed, ou usa a imagem customizada
  useEffect(() => {
    if (!customAvatarFile) {
      const url = (
        process.env.NEXT_PUBLIC_AVATAR_GENERATOR_URL || def('dicerbearAvatarGeneratorUrl')
      ).replace('{seed}', avatarSeed)
      setAvatarUrl(url)
    }
  }, [avatarSeed, customAvatarFile, def])

  // Rotina para gerar cor HSL aleatória pastel
  const getRandomColor = useCallback(() => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`
  }, [])

  useEffect(() => {
    setAvatarBg(getRandomColor())
  }, [getRandomColor])

  // Refresh: limpa avatar custom, gera novo seed e cor
  const refreshAvatar = useCallback(() => {
    setCustomAvatarFile(null)
    setAvatarSeed(Math.random().toString(36).substring(7))
    setAvatarBg(getRandomColor())
  }, [getRandomColor])

  // Rotinas para nomes e mensagens usando hook customizado
  const {
    fetchValues: fetchNames,
    getNextValue: getNextName,
    values: names,
  } = useRotatingValues('/api/generate/name')

  const {
    fetchValues: fetchMessages,
    getNextValue: getNextMessage,
    values: messages,
  } = useRotatingValues('/api/generate/message')

  const fetchNamesMemo = useCallback(() => fetchNames(locale), [fetchNames, locale])
  const fetchMessagesMemo = useCallback(() => fetchMessages(locale), [fetchMessages, locale])

  useEffect(() => {
    fetchNamesMemo()
    fetchMessagesMemo()
  }, [fetchNamesMemo, fetchMessagesMemo])

  // Gerar nome aleatório se disponível
  const handleGenerateName = useCallback(() => {
    if (names.length === 0) return
    setName(getNextName())
  }, [names, getNextName])

  // Gerar mensagem aleatória se disponível
  const handleGenerateMessage = useCallback(() => {
    if (messages.length === 0) return
    setMessage(getNextMessage())
  }, [messages, getNextMessage])

  async function uploadFile(file: File, folder: string): Promise<string> {
    const maxSizeMB = 1
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const actualMB = (file.size / 1024 / 1024).toFixed(2)
      throw new Error(t('fileLimit', { actualMB, maxSizeMB }))
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type, folder }),
    })

    if (!res.ok) {
      throw new Error('Failed to get upload URL.')
    }

    const { url, key } = await res.json()

    const uploadRes = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file.')
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${key}`

    return publicUrl
  }

  const handlePayClick = async () => {
    setLoading(true)
    try {
      let finalImageUrl: string
      try {
        if (customAvatarFile) {
          finalImageUrl = await uploadFile(customAvatarFile, 'avatar')
        } else {
          const dicebearFile = await fetchUrlAsFile(avatarUrl, 'dicebear.png')
          finalImageUrl = await uploadFile(dicebearFile, 'avatar')
        }
      } catch (error) {
        showToast((error as Error).message, 'error')
        setLoading(false)
        return
      }

      let finalAudioUrl: string | undefined
      try {
        finalAudioUrl = audioFile ? await uploadFile(audioFile, 'audio') : undefined
      } catch (error) {
        showToast((error as Error).message, 'error')
        setLoading(false)
        return
      }

      const response = await fetch('/api/king', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          message,
          imageUrl: finalImageUrl,
          audioUrl: finalAudioUrl,
          amount: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save king data.')
      }

      showToast('Data saved successfully!', 'success')
    } catch (error) {
      console.error('Error during saving king data:', error)
      Sentry.captureException(error)
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">{t('title', { ammount: '$1' })}</h1>

        {/* Avatar com botões sobrepostos */}
        <div className="relative w-28 h-28 mx-auto">
          <Avatar className="w-28 h-28" style={{ backgroundColor: avatarBg }}>
            <AvatarImage src={avatarUrl} alt={t('avatarAlt')} />
            <AvatarFallback className="flex items-center justify-center bg-purple-200">
              <CircleUserRound className="w-16 h-16 text-purple-800" />
            </AvatarFallback>
          </Avatar>

          {/* Upload de avatar (esquerda) */}
          <AvatarUpload
            title={t('generateAvatarButton')}
            onImageSelected={(file, preview) => {
              setCustomAvatarFile(file)
              setAvatarUrl(preview)
              setAvatarBg('transparent')
              setAvatarSeed('') // para pausar avatar gerado
            }}
          />

          {/* Botão refresh (direita) */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 w-7 h-7"
            title={t('uploadAvatarButton')}
            onClick={refreshAvatar}
          >
            <RefreshCwIcon className="w-3 h-3" />
          </Button>
        </div>

        {/* Nome com botão de geração */}
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title={t('generateNameButton')}
            onClick={handleGenerateName}
          >
            <SparklesIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Frase com botão de geração */}
        <div className="flex items-center gap-2">
          <Textarea
            placeholder={t('messagePlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title={t('generateMessageButton')}
            onClick={handleGenerateMessage}
          >
            <MessageSquareQuoteIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Upload de áudio */}
        <AudioRecorder
          onRecordingComplete={(file, url) => {
            setAudioFile(file)
            setAudioPreview(url)
          }}
        />

        {/* Preview do áudio */}
        {audioPreview && <audio controls src={audioPreview} className="w-full" />}

        <Button
          className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
          disabled={loading}
          onClick={handlePayClick}
        >
          {t('payButton', { ammount: '$1' })}
        </Button>
      </div>
    </div>
  )
}
