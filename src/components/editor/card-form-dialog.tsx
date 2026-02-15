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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateCard, useUpdateCard } from '@/hooks/use-cards'
import { parseClozeText, validateClozeText } from '@/lib/cloze/parser'
import { toast } from 'sonner'
import type { Card, CardType } from '@/types/database'
import { ImageOcclusionEditor } from './image-occlusion-editor'

interface CardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
  card?: Card | null
}

export function CardFormDialog({
  open,
  onOpenChange,
  deckId,
  card,
}: CardFormDialogProps) {
  const t = useTranslations('card')
  const tCommon = useTranslations('common')

  const createCard = useCreateCard()
  const updateCard = useUpdateCard()

  const [cardType, setCardType] = useState<CardType>('basic')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [hint, setHint] = useState('')
  const [tags, setTags] = useState('')
  const [occlusionOpen, setOcclusionOpen] = useState(false)

  useEffect(() => {
    if (card) {
      setCardType(card.cardType)
      setFront(card.front)
      setBack(card.back)
      setHint(card.hint ?? '')
      setTags(card.tags.join(', '))
    } else {
      setCardType('basic')
      setFront('')
      setBack('')
      setHint('')
      setTags('')
    }
  }, [card, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const clozeData =
      cardType === 'cloze' && validateClozeText(front)
        ? parseClozeText(front)
        : null

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

  return (
    <>
    <ImageOcclusionEditor
      open={occlusionOpen}
      onOpenChange={setOcclusionOpen}
      deckId={deckId}
    />
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{card ? t('editCard') : t('addCard')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('cardType')}</Label>
            <Select
              value={cardType}
              onValueChange={(v) => {
                const newType = v as CardType
                if (newType === 'image_occlusion' && !card) {
                  setOcclusionOpen(true)
                  onOpenChange(false)
                  return
                }
                setCardType(newType)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">{t('basic')}</SelectItem>
                <SelectItem value="cloze">{t('cloze')}</SelectItem>
                <SelectItem value="image_occlusion">{t('imageOcclusion')}</SelectItem>
                <SelectItem value="audio">{t('audio')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            </TabsContent>

            <TabsContent value="preview" className="min-h-[200px]">
              <div className="rounded-md border p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('front')}</p>
                  <p className="whitespace-pre-wrap">{front || '(empty)'}</p>
                </div>
                <hr />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('back')}</p>
                  <p className="whitespace-pre-wrap">{back || '(empty)'}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !front.trim()}>
              {isLoading ? '...' : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
