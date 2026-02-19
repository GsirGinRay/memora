import type { CardType } from './database'

export type BlockType = 'text' | 'image' | 'audio' | 'divider'

export interface TextBlock {
  id: string
  type: 'text'
  label: string
  placeholder?: string
  required?: boolean
  markdown?: boolean
}

export interface ImageBlock {
  id: string
  type: 'image'
  label: string
  required?: boolean
}

export interface AudioBlock {
  id: string
  type: 'audio'
  label: string
  autoplay?: boolean
  required?: boolean
}

export interface DividerBlock {
  id: string
  type: 'divider'
  label: string
}

export type TemplateBlock = TextBlock | ImageBlock | AudioBlock | DividerBlock

export interface FieldValues {
  [blockId: string]: string
}

export interface CardTemplate {
  id: string
  name: string
  description?: string
  isBuiltIn: boolean
  builtInType?: CardType
  frontBlocks: TemplateBlock[]
  backBlocks: TemplateBlock[]
  tts?: { enabled: boolean; lang: 'en' | 'zh-TW' } | null
}
