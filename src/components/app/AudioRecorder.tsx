'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { Button } from '@/components/ui/button'

export interface AudioRecorderProps {
  onRecordingComplete: (file: File | null, url: string) => void
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({ audio: true })

  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (mediaBlobUrl) {
      setLocalBlobUrl(mediaBlobUrl)
      fetch(mediaBlobUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'recorded-audio.webm', { type: 'audio/webm' })
          onRecordingComplete(file, mediaBlobUrl)
        })
        .catch(() => {
          // Opcional: limpar estado ou avisar falha
          setLocalBlobUrl(null)
          onRecordingComplete(null, '')
        })
    }
  }, [mediaBlobUrl, onRecordingComplete])

  const handleDiscard = useCallback(() => {
    setLocalBlobUrl(null)
    onRecordingComplete(null, '')
    clearBlobUrl?.()
  }, [clearBlobUrl, onRecordingComplete])

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
        {localBlobUrl && (
          <Button variant="destructive" onClick={handleDiscard}>
            Descartar
          </Button>
        )}
      </div>

      {/* {localBlobUrl && <audio src={localBlobUrl} controls className="w-full mt-2" />} */}
    </div>
  )
}
