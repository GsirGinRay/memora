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
import type { Deck } from '@/types/database'

const COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#8b5cf6', '#ef4444',
]

interface DeckFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deck?: Deck | null
  onSubmit: (data: { name: string; description: string; color: string }) => void
  isLoading?: boolean
}

export function DeckFormDialog({
  open,
  onOpenChange,
  deck,
  onSubmit,
  isLoading,
}: DeckFormDialogProps) {
  const t = useTranslations('deck')
  const tCommon = useTranslations('common')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    if (deck) {
      setName(deck.name)
      setDescription(deck.description ?? '')
      setColor(deck.color ?? COLORS[0])
    } else {
      setName('')
      setDescription('')
      setColor(COLORS[0])
    }
  }, [deck, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim(), color })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deck ? t('editDeck') : t('createDeck')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deck-name">{t('deckName')}</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('deckName')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deck-desc">{t('deckDescription')}</Label>
            <Input
              id="deck-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('deckDescription')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('deckColor')}</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? '...' : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
