'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

type Props = {
  onUploadComplete: (file: File, previewUrl: string, type: 'image' | 'audio') => void
}

export function FileUpload({ onUploadComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [type, setType] = useState<'image' | 'audio' | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const isAudio = file.type.startsWith('audio/')
      const isImage = file.type.startsWith('image/')

      if (!isAudio && !isImage) {
        alert('Apenas imagem ou áudio são permitidos.')
        return
      }

      const url = URL.createObjectURL(file)
      setPreview(url)
      setType(isImage ? 'image' : 'audio')
      onUploadComplete(file, url, isImage ? 'image' : 'audio')
    },
    [onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'audio/*': [],
    },
  })

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      <div
        {...getRootProps()}
        className="w-full p-4 border border-dashed rounded-lg text-center cursor-pointer hover:bg-zinc-100 transition"
      >
        <input {...getInputProps()} />
        {isDragActive ? 'Solte o arquivo aqui...' : 'Arraste ou clique para enviar imagem ou áudio'}
      </div>

      {preview && type === 'image' && (
        <Image src={preview} alt="Preview" width={120} height={120} className="rounded-md" />
      )}

      {preview && type === 'audio' && (
        <audio controls src={preview} className="w-full">
          Seu navegador não suporta áudio.
        </audio>
      )}
    </div>
  )
}
