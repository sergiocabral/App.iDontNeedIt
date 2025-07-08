'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { Button } from '@/components/ui/button'

export interface AudioRecorderProps {
  onRecordingComplete: (file: File | null, url: string) => void
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
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
    <div className="flex flex-col items-center gap-2">
      <p>Status: {status}</p>

      <div className="flex gap-2">
        <Button onClick={startRecording} disabled={status === 'recording'}>
          Gravar
        </Button>
        <Button onClick={stopRecording} disabled={status !== 'recording'}>
          Parar
        </Button>
        {previewUrl && (
          <Button variant="destructive" onClick={handleDiscard}>
            Descartar
          </Button>
        )}
      </div>

      {/* {previewUrl && <audio src={previewUrl} controls className="w-full mt-2" />} */}
    </div>
  )
}
