'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CardMedia } from '@/types/database'

interface TTSSettingsProps {
  media: CardMedia
  onMediaChange: (media: CardMedia) => void
}

export function TTSSettings({ media, onMediaChange }: TTSSettingsProps) {
  const t = useTranslations('card')

  const ttsEnabled = media.tts?.enabled ?? false
  const ttsLang = media.tts?.lang ?? 'en'

  const handleToggle = () => {
    onMediaChange({
      ...media,
      tts: { enabled: !ttsEnabled, lang: ttsLang },
    })
  }

  const handleLangChange = (lang: 'en' | 'zh-TW') => {
    onMediaChange({
      ...media,
      tts: { enabled: ttsEnabled, lang },
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="tts-toggle">{t('media.tts')}</Label>
        <button
          id="tts-toggle"
          type="button"
          role="switch"
          aria-checked={ttsEnabled}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            ttsEnabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              ttsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {ttsEnabled && (
        <div className="space-y-2">
          <Label>{t('media.ttsLang')}</Label>
          <Select value={ttsLang} onValueChange={(v) => handleLangChange(v as 'en' | 'zh-TW')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('media.ttsEnglish')}</SelectItem>
              <SelectItem value="zh-TW">{t('media.ttsChinese')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
