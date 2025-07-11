'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { AudioLines, Pause, Trash2 } from 'lucide-react'

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
        <Button
          className="cursor-pointer bg-green-900 hover:bg-green-700"
          onClick={startRecording}
          title={t('startRecording')}
        >
          <AudioLines />
        </Button>
      )}

      {status == 'recording' && (
        <Button
          className="cursor-pointer bg-orange-500 hover:bg-orange-400 animate-pulse"
          onClick={stopRecording}
          title={t('stopRecording')}
        >
          <Pause />
        </Button>
      )}

      {status == 'stopped' && previewUrl && (
        <Button
          className="cursor-pointer bg-red-900 hover:bg-red-700"
          variant="destructive"
          onClick={handleDiscard}
          title={t('discardRecording')}
        >
          <Trash2 />
        </Button>
      )}

      {status != 'stopped' && (
        <div className="w-full overflow-hidden mr-11">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-nowrap text-ellipsis overflow-hidden w-full">
            <span className="font-medium text-gray-600 dark:text-gray-300">
              {t(`status-${status}`)}
            </span>
          </p>
          {status == 'recording' && (
            <div className="relative w-full overflow-hidden">
              <div className="w-full flex justify-between scale-x-100 origin-left gap-[1px] items-end h-4 pb-1 mt-2">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-orange-400 animate-wave"
                    style={{ animationDelay: `${i * 0.05}s`, height: '100%' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAudioPreview !== false && previewUrl && (
        <audio src={previewUrl} controls className="w-full" />
      )}
    </div>
  )
}
