'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Camera, ImageIcon } from 'lucide-react'
import { useUpload } from '@/hooks/use-upload'
import { toast } from 'sonner'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

interface ImageUploadProps {
  onUploaded: (url: string) => void
}

export function ImageUpload({ onUploaded }: ImageUploadProps) {
  const t = useTranslations('card.occlusion')
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const upload = useUpload()

  const handleFile = (file: File | undefined) => {
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP formats are allowed')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be under 10MB')
      return
    }

    upload.mutate(file, {
      onSuccess: (result) => onUploaded(result.url),
    })
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <p className="text-muted-foreground text-sm">{t('selectImage')}</p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => cameraRef.current?.click()}
          disabled={upload.isPending}
        >
          <Camera className="h-4 w-4" />
          {t('camera')}
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => galleryRef.current?.click()}
          disabled={upload.isPending}
        >
          <ImageIcon className="h-4 w-4" />
          {t('gallery')}
        </Button>
      </div>
      {upload.isPending && (
        <p className="text-sm text-muted-foreground">{t('uploading')}</p>
      )}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
