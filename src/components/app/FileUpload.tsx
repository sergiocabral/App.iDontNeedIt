'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

type FileType = 'image' | 'audio'

interface FileUploadProps {
  onUploadComplete: (file: File, previewUrl: string, type: FileType) => void
}

export async function FileUpload({ onUploadComplete }: FileUploadProps) {
  const t = useTranslations('AudioRecorderComponent')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<FileType | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const isAudio = file.type.startsWith('audio/')
      const isImage = file.type.startsWith('image/')
      if (!isAudio && !isImage) {
        alert(t('invalidFileType'))
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      const type = isImage ? 'image' : 'audio'
      setFileType(type)
      onUploadComplete(file, url, type)
    },
    [onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'audio/*': [],
    },
    multiple: false,
  })

  // cleanup old blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        {...getRootProps()}
        className="w-full p-4 border border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-100 transition"
      >
        <input {...getInputProps()} />
        {isDragActive ? t('dropFileHere') : t('dragAndDropOrClick')}
      </div>

      {previewUrl && fileType === 'image' && (
        <Image
          src={previewUrl}
          alt={t('imagePreview')}
          width={120}
          height={120}
          className="rounded-md"
        />
      )}

      {previewUrl && fileType === 'audio' && (
        <audio controls src={previewUrl} className="w-full">
          {t('notSupportedAudio')}
        </audio>
      )}
    </div>
  )
}
