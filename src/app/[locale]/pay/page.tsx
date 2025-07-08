'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/app/FileUpload'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RefreshCwIcon, SparklesIcon, MessageSquareQuoteIcon, UploadIcon } from 'lucide-react'

export default function PayPage() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)

  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7))
  const [avatarBg, setAvatarBg] = useState<string | null>(null)

  const avatarUrl = `https://api.dicebear.com/8.x/lorelei/svg?seed=${avatarSeed}`

  useEffect(() => {
    setAvatarBg(getRandomColor())
  }, [])

  function getRandomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`
  }

  function refreshAvatar() {
    setAvatarSeed(Math.random().toString(36).substring(7))
    setAvatarBg(getRandomColor())
  }

  function generateName() {
    setName(`Anon-${Math.floor(1000 + Math.random() * 9000)}`)
  }

  function generateMessage() {
    setMessage('Desafio você a ser mais louco que eu.')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Pague $1 e se torne o primeiro King</h1>

        {/* Avatar com botões sobrepostos */}
        <div className="relative w-28 h-28 mx-auto">
          <Avatar className="w-28 h-28" style={{ backgroundColor: avatarBg }}>
            <AvatarImage src={avatarUrl} alt="avatar" />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>

          {/* Botão de upload (canto inferior esquerdo) */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute bottom-0 left-0 w-7 h-7"
            onClick={() => {
              // trigger algum modal de upload se quiser
              alert('Upload personalizado de avatar ainda não implementado.')
            }}
          >
            <UploadIcon className="w-3 h-3" />
          </Button>

          {/* Botão de refresh (canto inferior direito) */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 w-7 h-7"
            onClick={refreshAvatar}
          >
            <RefreshCwIcon className="w-3 h-3" />
          </Button>
        </div>

        {/* Nome */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Seu nome ou nickname (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="button" size="icon" variant="ghost" onClick={generateName}>
            <SparklesIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Frase */}
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Deixe uma frase provocadora (opcional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="button" size="icon" variant="ghost" onClick={generateMessage}>
            <MessageSquareQuoteIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Upload de Áudio */}
        <FileUpload
          accept="audio/*"
          onUploadComplete={(file, preview, type) => {
            setAudioFile(file)
            setAudioPreview(preview)
          }}
        />

        {/* Prévia do Áudio */}
        {audioPreview && <audio controls src={audioPreview} className="w-full" />}

        <Button className="w-full mt-4">Pagar $1</Button>
      </div>
    </div>
  )
}
