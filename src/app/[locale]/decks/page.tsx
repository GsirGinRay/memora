'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DeckCard } from '@/components/cards/deck-card'
import { DeckFormDialog } from '@/components/cards/deck-form-dialog'
import { DeleteConfirmDialog } from '@/components/cards/delete-confirm-dialog'
import { useDecks, useCreateDeck, useUpdateDeck, useDeleteDeck } from '@/hooks/use-decks'
import { toast } from 'sonner'
import type { Deck } from '@/types/database'

export default function DecksPage() {
  const t = useTranslations('deck')
  const tCommon = useTranslations('common')

  const { data: decks, isLoading } = useDecks()
  const createDeck = useCreateDeck()
  const updateDeck = useUpdateDeck()
  const deleteDeck = useDeleteDeck()

  const [formOpen, setFormOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Deck | null>(null)

  const handleCreate = () => {
    setEditingDeck(null)
    setFormOpen(true)
  }

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck)
    setFormOpen(true)
  }

  const handleFormSubmit = (data: { name: string; description: string; color: string }) => {
    if (editingDeck) {
      updateDeck.mutate(
        { id: editingDeck.id, ...data },
        {
          onSuccess: () => {
            setFormOpen(false)
            toast.success(tCommon('success'))
          },
        }
      )
    } else {
      createDeck.mutate(data, {
        onSuccess: () => {
          setFormOpen(false)
          toast.success(tCommon('success'))
        },
      })
    }
  }

  const handleDelete = (deck: Deck) => {
    setDeleteTarget(deck)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteDeck.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
        toast.success(tCommon('success'))
      },
    })
  }

  const handleArchive = (deck: Deck) => {
    updateDeck.mutate({
      id: deck.id,
      isArchived: !deck.isArchived,
    })
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('myDecks')}</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('createDeck')}
        </Button>
      </div>

      {decks && decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{tCommon('noData')}</p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createDeck')}
          </Button>
        </div>
      )}

      <DeckFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deck={editingDeck}
        onSubmit={handleFormSubmit}
        isLoading={createDeck.isPending || updateDeck.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('deleteDeck')}
        description={t('confirmDelete')}
        onConfirm={handleConfirmDelete}
        isLoading={deleteDeck.isPending}
      />
    </div>
  )
}
