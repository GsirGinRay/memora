'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Pencil, Trash2, BookOpen, ClipboardList, ImageIcon } from 'lucide-react'
import { useCards, useDeleteCard } from '@/hooks/use-cards'
import { CardFormDialog } from '@/components/editor/card-form-dialog'
import { ImageOcclusionEditor } from '@/components/editor/image-occlusion-editor'
import { DeleteConfirmDialog } from '@/components/cards/delete-confirm-dialog'
import { CardPreview } from '@/components/cards/card-preview'
import { toast } from 'sonner'
import type { Card as CardType } from '@/types/database'

export default function DeckDetailPage() {
  const t = useTranslations('card')
  const tCommon = useTranslations('common')
  const params = useParams()
  const deckId = params.deckId as string

  const { data: cards, isLoading } = useCards(deckId)
  const deleteCard = useDeleteCard()

  const [formOpen, setFormOpen] = useState(false)
  const [occlusionOpen, setOcclusionOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CardType | null>(null)
  const [previewCard, setPreviewCard] = useState<CardType | null>(null)

  const handleCreate = () => {
    setEditingCard(null)
    setFormOpen(true)
  }

  const handleEdit = (card: CardType) => {
    setEditingCard(card)
    setFormOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteCard.mutate(
      { id: deleteTarget.id, deckId },
      {
        onSuccess: () => {
          setDeleteTarget(null)
          toast.success(tCommon('success'))
        },
      }
    )
  }

  const cardTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      basic: t('basic'),
      cloze: t('cloze'),
      image_occlusion: t('imageOcclusion'),
      audio: t('audio'),
    }
    return labels[type] ?? type
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/decks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1">
          {t('cards')} ({cards?.length ?? 0})
        </h1>
        <div className="flex gap-2">
          <Link href={`/study/${deckId}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <BookOpen className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/quiz/${deckId}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <ClipboardList className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setOcclusionOpen(true)}
            title={t('imageOcclusion')}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addCard')}
          </Button>
        </div>
      </div>

      {cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card
              key={card.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setPreviewCard(card)}
            >
              <CardContent className="flex items-center gap-4 py-3">
                {card.cardType === 'image_occlusion' && card.mediaUrls[0] ? (
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-muted">
                    <img
                      src={card.mediaUrls[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {card.cardType === 'image_occlusion'
                      ? card.back || t('imageOcclusion')
                      : card.front || '(empty)'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {card.cardType === 'image_occlusion'
                      ? t('imageOcclusion')
                      : card.back || '(empty)'}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {cardTypeLabel(card.cardType)}
                </Badge>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(card)
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(card)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{tCommon('noData')}</p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addCard')}
          </Button>
        </div>
      )}

      <CardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deckId={deckId}
        card={editingCard}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('deleteCard')}
        description={t('confirmDelete')}
        onConfirm={handleConfirmDelete}
        isLoading={deleteCard.isPending}
      />

      <CardPreview
        open={!!previewCard}
        onOpenChange={(open) => !open && setPreviewCard(null)}
        card={previewCard}
      />

      <ImageOcclusionEditor
        open={occlusionOpen}
        onOpenChange={setOcclusionOpen}
        deckId={deckId}
      />
    </div>
  )
}
