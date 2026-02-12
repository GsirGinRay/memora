import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
  const isPublicRoute =
    isAuthPage ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')

  // Check for Auth.js session token (JWT strategy)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ??
    request.cookies.get('__Secure-authjs.session-token')?.value

  if (!sessionToken && !isPublicRoute) {
    const locale = pathname.split('/')[1] || 'zh-TW'
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  if (sessionToken && isAuthPage) {
    const locale = pathname.split('/')[1] || 'zh-TW'
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(zh-TW|en)/:path*'],
}
