'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSyncStore } from '@/stores/sync-store'
import { cn } from '@/lib/utils'

export function OfflineIndicator() {
  const t = useTranslations('offline')
  const [online, setOnline] = useState(true)
  const status = useSyncStore((s) => s.status)

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

  if (online && status === 'synced') return null

  return (
    <Badge
      variant="outline"
      className={cn(
        'fixed bottom-20 left-4 lg:bottom-4 z-40 gap-1',
        !online && 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100',
        status === 'syncing' && 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-100',
        status === 'error' && 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100'
      )}
    >
      {!online && (
        <>
          <WifiOff className="h-3 w-3" />
          {t('offline')}
        </>
      )}
      {online && status === 'syncing' && (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          {t('syncing')}
        </>
      )}
      {online && status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3" />
          {t('syncError')}
        </>
      )}
    </Badge>
  )
}
