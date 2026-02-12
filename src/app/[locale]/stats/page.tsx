'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Target, Flame, BarChart3 } from 'lucide-react'
import {
  useTodayStats,
  useReviewTrend,
  useCardDistribution,
  useStreakDays,
} from '@/hooks/use-stats'
import { ReviewTrendChart } from '@/components/shared/review-trend-chart'
import { CardDistributionChart } from '@/components/shared/card-distribution-chart'

export default function StatsPage() {
  const t = useTranslations('stats')
  const tCommon = useTranslations('common')

  const { data: todayStats, isLoading: loadingToday } = useTodayStats()
  const { data: trend, isLoading: loadingTrend } = useReviewTrend(30)
  const { data: distribution, isLoading: loadingDist } = useCardDistribution()
  const { data: streak, isLoading: loadingStreak } = useStreakDays()

  const isLoading = loadingToday || loadingTrend || loadingDist || loadingStreak

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('todayReviews')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : todayStats?.totalReviews ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('accuracyRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : `${todayStats?.accuracy ?? 0}%`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" />
              {t('streakDays')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : streak ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('totalReviews')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading
                ? '...'
                : trend?.reduce((sum, d) => sum + d.count, 0) ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('reviewTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            {trend && trend.length > 0 ? (
              <ReviewTrendChart data={trend} />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {tCommon('noData')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cardDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {distribution && distribution.length > 0 ? (
              <CardDistributionChart data={distribution} />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {tCommon('noData')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
