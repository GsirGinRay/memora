'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'
import { speak, stopSpeaking, isWebSpeechSupported } from '@/lib/tts/speech'

interface TTSButtonProps {
  text: string
  lang?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function TTSButton({ text, lang = 'en-US', size = 'icon' }: TTSButtonProps) {
  const [playing, setPlaying] = useState(false)

  if (!isWebSpeechSupported()) return null

  const handleClick = async () => {
    if (playing) {
      stopSpeaking()
      setPlaying(false)
      return
    }

    setPlaying(true)
    try {
      await speak(text, lang)
    } catch {
      // TTS failed silently
    } finally {
      setPlaying(false)
    }
  }

  return (
    <Button variant="ghost" size={size} onClick={handleClick}>
      {playing ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  )
}
