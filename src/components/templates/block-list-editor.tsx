'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2, Type, ImageIcon, Volume2, Minus, ChevronDown, ChevronRight } from 'lucide-react'
import { BlockConfigForm } from './block-config-form'
import type { TemplateBlock, BlockType } from '@/types/card-template'

interface BlockListEditorProps {
  blocks: TemplateBlock[]
  onChange: (blocks: TemplateBlock[]) => void
  side: 'front' | 'back'
}

function generateBlockId(type: BlockType, side: string): string {
  return `${side}-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const BLOCK_TYPE_ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  image: ImageIcon,
  audio: Volume2,
  divider: Minus,
}

function SortableBlock({
  block,
  onUpdate,
  onRemove,
}: {
  block: TemplateBlock
  onUpdate: (updated: TemplateBlock) => void
  onRemove: () => void
}) {
  const t = useTranslations('template')
  const [expanded, setExpanded] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = BLOCK_TYPE_ICONS[block.type]

  return (
    <div ref={setNodeRef} style={style} className="border rounded-md bg-background">
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm flex-1 truncate">{block.label}</span>
        <span className="text-xs text-muted-foreground">{t(`blockType.${block.type}`)}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {expanded && (
        <div className="px-2 pb-2">
          <BlockConfigForm block={block} onChange={onUpdate} />
        </div>
      )}
    </div>
  )
}

export function BlockListEditor({ blocks, onChange, side }: BlockListEditorProps) {
  const t = useTranslations('template')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    onChange(arrayMove(blocks, oldIndex, newIndex))
  }

  const addBlock = (type: BlockType) => {
    const defaultLabels: Record<BlockType, string> = {
      text: 'Text',
      image: 'Image',
      audio: 'Audio',
      divider: 'Divider',
    }
    const base = {
      id: generateBlockId(type, side),
      type,
      label: defaultLabels[type],
    }
    const newBlock: TemplateBlock = type === 'text'
      ? { ...base, type: 'text', required: false, markdown: true }
      : type === 'image'
        ? { ...base, type: 'image', required: false }
        : type === 'audio'
          ? { ...base, type: 'audio', autoplay: false, required: false }
          : { ...base, type: 'divider' }

    onChange([...blocks, newBlock])
  }

  const updateBlock = (index: number, updated: TemplateBlock) => {
    const next = blocks.map((b, i) => (i === index ? updated : b))
    onChange(next)
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <SortableBlock
                key={block.id}
                block={block}
                onUpdate={(updated) => updateBlock(index, updated)}
                onRemove={() => removeBlock(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t('noBlocks')}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock('text')}>
          <Type className="h-3 w-3 mr-1" />
          {t('addText')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock('image')}>
          <ImageIcon className="h-3 w-3 mr-1" />
          {t('addImage')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock('audio')}>
          <Volume2 className="h-3 w-3 mr-1" />
          {t('addAudio')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addBlock('divider')}>
          <Minus className="h-3 w-3 mr-1" />
          {t('addDivider')}
        </Button>
      </div>
    </div>
  )
}
