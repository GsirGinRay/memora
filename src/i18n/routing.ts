import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['zh-TW', 'en'],
  defaultLocale: 'zh-TW',
})

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
