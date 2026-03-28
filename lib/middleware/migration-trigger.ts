import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Run migrations for the first page load
  if (request.nextUrl.pathname === '/') {
    const response = NextResponse.next()

    // Add a flag to indicate migrations should run
    response.cookies.set('run-migrations', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 1 minute
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
