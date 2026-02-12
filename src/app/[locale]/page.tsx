'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Sparkles, Flame } from 'lucide-react'
import { useTodayStats, useStreakDays } from '@/hooks/use-stats'
import { useDecks } from '@/hooks/use-decks'

export default function DashboardPage() {
  const t = useTranslations('dashboard')

  const { data: todayStats } = useTodayStats()
  const { data: streak } = useStreakDays()
  const { data: decks } = useDecks()

  const totalDue = decks?.reduce((sum, d) => sum + d.due_count, 0) ?? 0
  const totalNew = decks?.reduce((sum, d) => sum + d.new_count, 0) ?? 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('welcome')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('todayStudy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayStats?.totalReviews ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('dueCards')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t('newCards')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalNew}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" />
              {t('streak')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {streak ?? 0}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                {t('days')}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {decks && decks.length > 0 ? (
        <div className="space-y-4">
          {decks
            .filter((d) => !d.is_archived)
            .slice(0, 5)
            .map((deck) => (
              <Link key={deck.id} href={`/study/${deck.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{deck.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {deck.card_count} {t('dueCards').toLowerCase()}
                      </p>
                    </div>
                    <Button size="sm">{t('startStudy')}</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t('noDecks')}</p>
          <Link href="/decks">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              {t('startStudy')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
