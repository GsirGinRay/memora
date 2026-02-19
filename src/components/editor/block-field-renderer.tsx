'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageIcon, Volume2, X } from 'lucide-react'
import { useUpload } from '@/hooks/use-upload'
import { AudioPlayer } from '@/components/shared/audio-player'
import type { TemplateBlock } from '@/types/card-template'

interface BlockFieldRendererProps {
  block: TemplateBlock
  value: string
  onChange: (value: string) => void
}

export function BlockFieldRenderer({ block, value, onChange }: BlockFieldRendererProps) {
  const t = useTranslations('template')

  if (block.type === 'divider') {
    return <hr className="my-2" />
  }

  return (
    <div className="space-y-1">
      <Label className="text-sm">
        {block.label}
        {'required' in block && block.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </Label>

      {block.type === 'text' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={block.placeholder ?? block.label}
          required={block.required}
        />
      )}

      {block.type === 'image' && (
        <ImageFieldInput value={value} onChange={onChange} t={t} />
      )}

      {block.type === 'audio' && (
        <AudioFieldInput value={value} onChange={onChange} t={t} />
      )}
    </div>
  )
}

function ImageFieldInput({
  value,
  onChange,
  t,
}: {
  value: string
  onChange: (v: string) => void
  t: ReturnType<typeof useTranslations>
}) {
  const upload = useUpload()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate(file, {
      onSuccess: (result) => onChange(result.url),
    })
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="max-h-32 rounded-md border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-md p-4 justify-center">
          <ImageIcon className="h-4 w-4" />
          {upload.isPending ? '...' : t('uploadImage')}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      )}
    </div>
  )
}

function AudioFieldInput({
  value,
  onChange,
  t,
}: {
  value: string
  onChange: (v: string) => void
  t: ReturnType<typeof useTranslations>
}) {
  const upload = useUpload()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate(file, {
      onSuccess: (result) => onChange(result.url),
    })
  }

  return (
    <div>
      {value ? (
        <div className="flex items-center gap-2">
          <AudioPlayer src={value} compact />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-md p-4 justify-center">
          <Volume2 className="h-4 w-4" />
          {upload.isPending ? '...' : t('uploadAudio')}
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      )}
    </div>
  )
}
