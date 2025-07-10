'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { AudioLines, OctagonX, Pause } from 'lucide-react'

export interface AudioRecorderProps {
  showAudioPreview?: boolean
  onRecordingComplete: (file: File | null, url: string) => void
}

export default function AudioRecorder({
  showAudioPreview,
  onRecordingComplete,
}: AudioRecorderProps) {
  const t = useTranslations('AudioRecorderComponent')
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({ audio: true })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  /** mantém a referência estável do callback */
  const callbackRef = useRef(onRecordingComplete)
  useEffect(() => {
    callbackRef.current = onRecordingComplete
  }, [onRecordingComplete])

  /** guarda o último blob para revogar */
  const prevBlobRef = useRef<string | null>(null)

  /** dispara só quando o blob gerado muda */
  useEffect(() => {
    if (!mediaBlobUrl) return

    // revoga URL anterior
    if (prevBlobRef.current && prevBlobRef.current !== mediaBlobUrl) {
      URL.revokeObjectURL(prevBlobRef.current)
    }
    prevBlobRef.current = mediaBlobUrl
    setPreviewUrl(mediaBlobUrl)

    // converte para File e chama callback 1 única vez
    ;(async () => {
      try {
        const blob = await fetch(mediaBlobUrl).then((r) => r.blob())
        const file = new File([blob], 'recorded-audio.webm', { type: 'audio/webm' })
        callbackRef.current(file, mediaBlobUrl)
      } catch {
        setPreviewUrl(null)
        callbackRef.current(null, '')
      }
    })()

    // cleanup ao desmontar
    return () => {
      if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current)
    }
  }, [mediaBlobUrl])

  const handleDiscard = useCallback(() => {
    if (prevBlobRef.current) {
      URL.revokeObjectURL(prevBlobRef.current)
      prevBlobRef.current = null
    }
    setPreviewUrl(null)
    callbackRef.current(null, '')
    clearBlobUrl?.()
  }, [clearBlobUrl])

  return (
    <div className="flex flex-row items-center gap-2 h-12">
      {status !== 'recording' && status !== 'stopped' && (
        <Button className="cursor-pointer" onClick={startRecording} title={t('startRecording')}>
          <AudioLines />
        </Button>
      )}

      {status == 'recording' && (
        <Button className="cursor-pointer" onClick={stopRecording} title={t('stopRecording')}>
          <Pause />
        </Button>
      )}

      {status == 'stopped' && previewUrl && (
        <Button
          className="cursor-pointer"
          variant="destructive"
          onClick={handleDiscard}
          title={t('discardRecording')}
        >
          <OctagonX />
        </Button>
      )}

      {status != 'stopped' && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {t(`status-${status}`)}
          </span>
        </p>
      )}

      {showAudioPreview !== false && previewUrl && (
        <audio src={previewUrl} controls className="w-full" />
      )}
    </div>
  )
}
