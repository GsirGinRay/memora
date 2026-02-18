'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { AudioPlayer } from '@/components/shared/audio-player'
import { useUpload } from '@/hooks/use-upload'
import { ImagePlus, Music, X } from 'lucide-react'
import type { CardMedia } from '@/types/database'

interface MediaUploadSectionProps {
  side: 'front' | 'back'
  media: CardMedia
  onMediaChange: (media: CardMedia) => void
}

export function MediaUploadSection({
  side,
  media,
  onMediaChange,
}: MediaUploadSectionProps) {
  const t = useTranslations('card')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const upload = useUpload()

  const sideMedia = media[side]
  const imageUrl = sideMedia?.imageUrl
  const audioUrl = sideMedia?.audioUrl

  const updateSideMedia = (updates: { imageUrl?: string; audioUrl?: string }) => {
    const currentSide = media[side] ?? {}
    onMediaChange({
      ...media,
      [side]: { ...currentSide, ...updates },
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await upload.mutateAsync(file)
      updateSideMedia({ imageUrl: result.url })
    } catch {
      // error handled by useUpload
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await upload.mutateAsync(file)
      updateSideMedia({ audioUrl: result.url })
    } catch {
      // error handled by useUpload
    }

    if (audioInputRef.current) {
      audioInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    updateSideMedia({ imageUrl: undefined })
  }

  const removeAudio = () => {
    updateSideMedia({ audioUrl: undefined })
  }

  return (
    <div className="space-y-2">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleAudioUpload}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={upload.isPending}
        >
          <ImagePlus className="h-4 w-4 mr-1" />
          {t('media.uploadImage')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => audioInputRef.current?.click()}
          disabled={upload.isPending}
        >
          <Music className="h-4 w-4 mr-1" />
          {t('media.uploadAudio')}
        </Button>
      </div>

      {imageUrl && (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt=""
            className="max-h-32 rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {audioUrl && (
        <div className="flex items-center gap-2 rounded-md border p-2">
          <AudioPlayer src={audioUrl} compact />
          <span className="text-sm text-muted-foreground flex-1 truncate">{audioUrl.split('/').pop()}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={removeAudio}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {upload.isPending && (
        <p className="text-xs text-muted-foreground">{t('occlusion.uploading')}</p>
      )}
    </div>
  )
}
