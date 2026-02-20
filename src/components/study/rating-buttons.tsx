'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { Rating } from '@/types/database'
import type { SchedulingOption } from '@/lib/fsrs/scheduler'

interface RatingButtonsProps {
  options?: SchedulingOption[]
  onRate: (rating: Rating) => void
  disabled?: boolean
}

const ratingColors: Record<Rating, string> = {
  1: 'bg-red-500 hover:bg-red-600 text-white',
  2: 'bg-orange-500 hover:bg-orange-600 text-white',
  3: 'bg-green-500 hover:bg-green-600 text-white',
  4: 'bg-blue-500 hover:bg-blue-600 text-white',
}

const ratingKeys: Record<Rating, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
}

const ALL_RATINGS: Rating[] = [1, 2, 3, 4]

export function RatingButtons({ options, onRate, disabled }: RatingButtonsProps) {
  const t = useTranslations('study')

  const labels: Record<Rating, string> = {
    1: t('again'),
    2: t('hard'),
    3: t('good'),
    4: t('easy'),
  }

  if (options) {
    return (
      <div className="flex gap-2 justify-center w-full max-w-lg mx-auto">
        {options.map((option) => (
          <Button
            key={option.rating}
            className={`flex-1 flex flex-col gap-1 h-auto py-3 ${ratingColors[option.rating]}`}
            onClick={() => onRate(option.rating)}
            disabled={disabled}
          >
            <span className="font-medium">{labels[option.rating]}</span>
            <span className="text-xs opacity-80">{option.interval}</span>
            <span className="text-[10px] opacity-60 hidden md:inline">({ratingKeys[option.rating]})</span>
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 justify-center w-full max-w-lg mx-auto">
      {ALL_RATINGS.map((rating) => (
        <Button
          key={rating}
          className={`flex-1 flex flex-col gap-1 h-auto py-3 ${ratingColors[rating]}`}
          onClick={() => onRate(rating)}
          disabled={disabled}
        >
          <span className="font-medium">{labels[rating]}</span>
          <span className="text-[10px] opacity-60 hidden md:inline">({ratingKeys[rating]})</span>
        </Button>
      ))}
    </div>
  )
}
