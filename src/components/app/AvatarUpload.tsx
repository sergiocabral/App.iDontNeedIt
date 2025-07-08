'use client'

import { UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '../ui/button'
import { useTranslations } from 'next-intl'

interface AvatarUploadProps {
  title?: string
  onImageSelected: (file: File, previewUrl: string) => void
}

export function AvatarUpload({ title, onImageSelected }: AvatarUploadProps) {
  const t = useTranslations('AvatarUploadComponent')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert(t('invalidFileType'))
      return
    }

    const preview = URL.createObjectURL(file)
    onImageSelected(file, preview)
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute bottom-0 left-0 w-7 h-7"
        title={title}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon className="w-3 h-3" />
      </Button>
    </>
  )
}
