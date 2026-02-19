'use client'

import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { AudioPlayer } from '@/components/shared/audio-player'
import type { TemplateBlock, FieldValues } from '@/types/card-template'

interface BlockRendererProps {
  blocks: TemplateBlock[]
  fieldValues: FieldValues
}

export function BlockRenderer({ blocks, fieldValues }: BlockRendererProps) {
  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <SingleBlockRenderer
          key={block.id}
          block={block}
          value={fieldValues[block.id] ?? ''}
        />
      ))}
    </div>
  )
}

function SingleBlockRenderer({
  block,
  value,
}: {
  block: TemplateBlock
  value: string
}) {
  if (!value && block.type !== 'divider') return null

  switch (block.type) {
    case 'text':
      return block.markdown ? (
        <MarkdownRenderer content={value} className="text-lg" />
      ) : (
        <p className="text-lg whitespace-pre-wrap">{value}</p>
      )

    case 'image':
      return value ? (
        <img
          src={value}
          alt={block.label}
          className="max-h-64 rounded-md mx-auto"
        />
      ) : null

    case 'audio':
      return value ? (
        <AudioPlayer src={value} autoPlay={block.autoplay} />
      ) : null

    case 'divider':
      return <hr />

    default:
      return null
  }
}
