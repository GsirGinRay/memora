export const TTS_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  'zh-TW': 'zh-TW',
}

export function getTTSLang(lang: string | undefined): string {
  return TTS_LANG_MAP[lang ?? 'en'] ?? 'en-US'
}
