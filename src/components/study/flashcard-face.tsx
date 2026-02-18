'use client'

import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { AudioPlayer } from '@/components/shared/audio-player'
import { TTSButton } from '@/components/shared/tts-button'
import { getTTSLang } from '@/lib/tts/constants'
import type { CardMedia } from '@/types/database'

interface FlashcardFaceProps {
  text: string
  side: 'front' | 'back'
  media: CardMedia | null
  autoPlay?: boolean
}

export function FlashcardFace({ text, side, media, autoPlay = false }: FlashcardFaceProps) {
  const sideMedia = media?.[side]
  const tts = media?.tts
  const ttsLang = getTTSLang(tts?.lang)

  return (
    <div className="space-y-3">
      {sideMedia?.imageUrl && (
        <div className="flex justify-center">
          <img
            src={sideMedia.imageUrl}
            alt=""
            className="max-h-48 rounded-md"
          />
        </div>
      )}

      <div className="text-center">
        <MarkdownRenderer content={text} />
      </div>

      {sideMedia?.audioUrl && (
        <div className="flex justify-center">
          <AudioPlayer src={sideMedia.audioUrl} autoPlay={autoPlay} />
        </div>
      )}

      {tts?.enabled && (
        <div className="flex justify-center">
          <TTSButton text={text} lang={ttsLang} />
        </div>
      )}
    </div>
  )
}
