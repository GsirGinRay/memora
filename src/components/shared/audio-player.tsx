'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
  compact?: boolean
}

export function AudioPlayer({ src, autoPlay = false, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio

    const handleEnded = () => setPlaying(false)
    const handlePause = () => setPlaying(false)
    const handlePlay = () => setPlaying(true)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    if (autoPlay) {
      audio.play().catch(() => {})
    }

    return () => {
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
    }
  }, [src, autoPlay])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }

  const replay = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  const btnSize = compact ? 'icon' : 'sm'

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size={btnSize} onClick={togglePlay} type="button">
        {playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <Button variant="ghost" size={btnSize} onClick={replay} type="button">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}
