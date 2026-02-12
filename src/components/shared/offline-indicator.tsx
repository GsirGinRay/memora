'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function OfflineIndicator() {
  const t = useTranslations('offline')
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <Badge
      variant="outline"
      className="fixed bottom-20 left-4 lg:bottom-4 z-40 gap-1 bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100"
    >
      <WifiOff className="h-3 w-3" />
      {t('offline')}
    </Badge>
  )
}
