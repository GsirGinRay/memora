'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2, Archive, BookOpen, ClipboardList } from 'lucide-react'
import type { Deck } from '@/types/database'

interface DeckCardProps {
  deck: Deck
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
  onArchive: (deck: Deck) => void
}

export function DeckCard({ deck, onEdit, onDelete, onArchive }: DeckCardProps) {
  const t = useTranslations('deck')

  return (
    <Card className="relative group">
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: deck.color ?? '#6366f1' }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate pr-8">{deck.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(deck)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('editDeck')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(deck)}>
                <Archive className="mr-2 h-4 w-4" />
                {deck.is_archived ? t('unarchive') : t('archive')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(deck)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('deleteDeck')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {deck.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {deck.description}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">
            {deck.card_count} {t('cards')}
          </Badge>
          {deck.new_count > 0 && (
            <Badge variant="default" className="bg-blue-500">
              {deck.new_count} {t('new')}
            </Badge>
          )}
          {deck.due_count > 0 && (
            <Badge variant="default" className="bg-green-500">
              {deck.due_count} {t('due')}
            </Badge>
          )}
          {deck.is_archived && (
            <Badge variant="outline">{t('archived')}</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/study/${deck.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full gap-1">
              <BookOpen className="h-3 w-3" />
              {t('cards')}
            </Button>
          </Link>
          <Link href={`/quiz/${deck.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1">
              <ClipboardList className="h-3 w-3" />
              Quiz
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
