'use client'

import { useEffect, useRef } from 'react'
import { speak, stopSpeaking, isWebSpeechSupported } from '@/lib/tts/speech'
import { getTTSLang } from '@/lib/tts/constants'
import type { CardMedia } from '@/types/database'

interface UseAutoTTSOptions {
  text: string
  media: CardMedia | null
  side: 'front' | 'back'
  trigger: boolean
}

export function useAutoTTS({ text, media, side, trigger }: UseAutoTTSOptions) {
  const lastTriggerRef = useRef<string>('')

  useEffect(() => {
    if (!trigger) return
    if (!media?.tts?.enabled) return
    if (!isWebSpeechSupported()) return

    const triggerKey = `${side}-${text}`
    if (lastTriggerRef.current === triggerKey) return
    lastTriggerRef.current = triggerKey

    const sideMedia = media[side]
    if (sideMedia?.audioUrl) return

    const lang = getTTSLang(media.tts.lang)
    speak(text, lang).catch(() => {})

    return () => {
      stopSpeaking()
    }
  }, [trigger, text, media, side])
}
