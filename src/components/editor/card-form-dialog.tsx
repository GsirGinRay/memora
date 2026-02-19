'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateCard, useUpdateCard } from '@/hooks/use-cards'
import { useTemplates } from '@/hooks/use-templates'
import { parseClozeText, validateClozeText } from '@/lib/cloze/parser'
import { MediaUploadSection } from '@/components/editor/media-upload-section'
import { TTSSettings } from '@/components/editor/tts-settings'
import { TemplateCardForm } from '@/components/editor/template-card-form'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { AudioPlayer } from '@/components/shared/audio-player'
import { TemplateEditorDialog } from '@/components/templates/template-editor-dialog'
import { isBuiltInTemplateId } from '@/lib/templates/built-in'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import type { Card, CardType, CardMedia } from '@/types/database'
import type { CardTemplate, FieldValues } from '@/types/card-template'
import { ImageOcclusionEditor } from './image-occlusion-editor'

interface CardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
  card?: Card | null
}

const EMPTY_MEDIA: CardMedia = {}

function getFirstTextBlockValue(
  template: CardTemplate,
  side: 'front' | 'back',
  fieldValues: FieldValues
): string {
  const blocks = side === 'front' ? template.frontBlocks : template.backBlocks
  const textBlock = blocks.find((b) => b.type === 'text')
  return textBlock ? (fieldValues[textBlock.id] ?? '') : ''
}

export function CardFormDialog({
  open,
  onOpenChange,
  deckId,
  card,
}: CardFormDialogProps) {
  const t = useTranslations('card')
  const tCommon = useTranslations('common')
  const tTemplate = useTranslations('template')

  const createCard = useCreateCard()
  const updateCard = useUpdateCard()
  const { data: templates } = useTemplates()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('built-in-basic')
  const [cardType, setCardType] = useState<CardType>('basic')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [hint, setHint] = useState('')
  const [tags, setTags] = useState('')
  const [media, setMedia] = useState<CardMedia>(EMPTY_MEDIA)
  const [fieldValues, setFieldValues] = useState<FieldValues>({})
  const [occlusionOpen, setOcclusionOpen] = useState(false)
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId) ?? null
  const isCustomTemplate = selectedTemplate && !selectedTemplate.isBuiltIn
  const isBuiltIn = selectedTemplate?.isBuiltIn ?? true

  useEffect(() => {
    if (card) {
      setCardType(card.cardType)
      setFront(card.front)
      setBack(card.back)
      setHint(card.hint ?? '')
      setTags(card.tags.join(', '))
      setMedia(card.media ?? EMPTY_MEDIA)
      setFieldValues(card.fieldValues ?? {})
      if (card.templateId) {
        setSelectedTemplateId(card.templateId)
      } else {
        const builtInId = `built-in-${card.cardType}`
        setSelectedTemplateId(builtInId)
      }
    } else {
      setSelectedTemplateId('built-in-basic')
      setCardType('basic')
      setFront('')
      setBack('')
      setHint('')
      setTags('')
      setMedia(EMPTY_MEDIA)
      setFieldValues({})
    }
  }, [card, open])

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)

    const tmpl = templates?.find((t) => t.id === templateId)
    if (!tmpl) return

    if (tmpl.isBuiltIn && tmpl.builtInType) {
      setCardType(tmpl.builtInType)
      if (tmpl.builtInType === 'image_occlusion' && !card) {
        setOcclusionOpen(true)
        onOpenChange(false)
        return
      }
    } else {
      setCardType('basic')
    }

    setFieldValues({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (isCustomTemplate && selectedTemplate) {
      const frontText = getFirstTextBlockValue(selectedTemplate, 'front', fieldValues)
      const backText = getFirstTextBlockValue(selectedTemplate, 'back', fieldValues)

      const payload = {
        deckId,
        cardType: 'basic' as CardType,
        front: frontText || 'Template card',
        back: backText || '',
        hint: hint || undefined,
        tags: tagList,
        templateId: selectedTemplate.id,
        fieldValues,
        media: null as CardMedia | null,
      }

      if (card) {
        updateCard.mutate(
          { id: card.id, ...payload },
          {
            onSuccess: () => {
              onOpenChange(false)
              toast.success(tCommon('success'))
            },
          }
        )
      } else {
        createCard.mutate(payload, {
          onSuccess: () => {
            onOpenChange(false)
            toast.success(tCommon('success'))
          },
        })
      }
      return
    }

    const clozeData =
      cardType === 'cloze' && validateClozeText(front)
        ? parseClozeText(front)
        : null

    const hasMedia = media.front || media.back || media.tts
    const mediaPayload = hasMedia ? media : null

    if (card) {
      updateCard.mutate(
        {
          id: card.id,
          deckId,
          cardType,
          front,
          back,
          hint: hint || undefined,
          tags: tagList,
          clozeData,
          media: mediaPayload,
          templateId: isBuiltInTemplateId(selectedTemplateId) ? null : null,
          fieldValues: null,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            toast.success(tCommon('success'))
          },
        }
      )
    } else {
      createCard.mutate(
        {
          deckId,
          cardType,
          front,
          back,
          hint: hint || undefined,
          tags: tagList,
          clozeData,
          media: mediaPayload,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            toast.success(tCommon('success'))
          },
        }
      )
    }
  }

  const isLoading = createCard.isPending || updateCard.isPending
  const canSubmit = isCustomTemplate
    ? true
    : front.trim().length > 0

  return (
    <>
    <ImageOcclusionEditor
      open={occlusionOpen}
      onOpenChange={setOcclusionOpen}
      deckId={deckId}
    />
    <TemplateEditorDialog
      open={templateEditorOpen}
      onOpenChange={setTemplateEditorOpen}
    />
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? t('editCard') : t('addCard')}</DialogTitle>
        </DialogHeader>

        {card?.cardType === 'image_occlusion' ? (
          <div className="space-y-4">
            {card.mediaUrls[0] && (
              <div className="relative rounded-md overflow-hidden border">
                <img
                  src={card.mediaUrls[0]}
                  alt=""
                  className="w-full h-auto block"
                  draggable={false}
                />
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                >
                  {(card.occlusionData ?? []).map((rect, i) => (
                    <g key={rect.id}>
                      <rect
                        x={rect.x}
                        y={rect.y}
                        width={rect.width}
                        height={rect.height}
                        fill={`rgba(239, 68, 68, ${rect.id === card.front ? 0.7 : 0.3})`}
                        stroke="white"
                        strokeWidth="0.3"
                        rx="0.5"
                      />
                      <text
                        x={rect.x + rect.width / 2}
                        y={rect.y + rect.height / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="2.5"
                        fontWeight="bold"
                      >
                        {rect.label || `#${i + 1}`}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground mb-1">{t('back')}</p>
              <p className="text-lg">{card.back}</p>
            </div>
            {card.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {card.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{tTemplate('selectTemplate')}</Label>
            <div className="flex gap-2">
              <Select
                value={selectedTemplateId}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{tTemplate('builtIn')}</SelectLabel>
                    {templates
                      ?.filter((tmpl) => tmpl.isBuiltIn)
                      .map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id}>
                          {tmpl.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                  {templates?.some((tmpl) => !tmpl.isBuiltIn) && (
                    <>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>{tTemplate('custom')}</SelectLabel>
                        {templates
                          ?.filter((tmpl) => !tmpl.isBuiltIn)
                          .map((tmpl) => (
                            <SelectItem key={tmpl.id} value={tmpl.id}>
                              {tmpl.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setTemplateEditorOpen(true)}
                title={tTemplate('createTemplate')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isCustomTemplate && selectedTemplate ? (
            <>
              <TemplateCardForm
                template={selectedTemplate}
                fieldValues={fieldValues}
                onFieldValuesChange={setFieldValues}
              />
              <div className="space-y-2">
                <Label htmlFor="hint">{t('hint')}</Label>
                <Input
                  id="hint"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder={t('hint')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">{t('tags')}</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </>
          ) : (
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="edit" className="flex-1">
                  {tCommon('edit')}
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  {t('preview')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front">{t('front')}</Label>
                  <textarea
                    id="front"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder={
                      cardType === 'cloze' ? t('clozeHint') : t('front')
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">{t('media.markdownSupported')}</p>
                  <MediaUploadSection
                    side="front"
                    media={media}
                    onMediaChange={setMedia}
                  />
                </div>

                {cardType !== 'cloze' && (
                  <div className="space-y-2">
                    <Label htmlFor="back">{t('back')}</Label>
                    <textarea
                      id="back"
                      value={back}
                      onChange={(e) => setBack(e.target.value)}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder={t('back')}
                    />
                    <MediaUploadSection
                      side="back"
                      media={media}
                      onMediaChange={setMedia}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="hint">{t('hint')}</Label>
                  <Input
                    id="hint"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder={t('hint')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">{t('tags')}</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <TTSSettings media={media} onMediaChange={setMedia} />
              </TabsContent>

              <TabsContent value="preview" className="min-h-[200px]">
                <div className="rounded-md border p-4 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('front')}</p>
                    {media.front?.imageUrl && (
                      <img src={media.front.imageUrl} alt="" className="max-h-32 rounded-md mb-2" />
                    )}
                    <MarkdownRenderer content={front || '(empty)'} />
                    {media.front?.audioUrl && (
                      <AudioPlayer src={media.front.audioUrl} />
                    )}
                  </div>
                  <hr />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('back')}</p>
                    {media.back?.imageUrl && (
                      <img src={media.back.imageUrl} alt="" className="max-h-32 rounded-md mb-2" />
                    )}
                    <MarkdownRenderer content={back || '(empty)'} />
                    {media.back?.audioUrl && (
                      <AudioPlayer src={media.back.audioUrl} />
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !canSubmit}>
              {isLoading ? '...' : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
