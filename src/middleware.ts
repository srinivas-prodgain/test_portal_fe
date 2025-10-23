import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const middleware = (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl

  // Check if user is trying to access the exam page
  if (pathname === '/exam') {
    const candidateId = searchParams.get('candidate_id')

    // If no candidate_id is present, redirect to form1
    if (!candidateId || candidateId.trim() === '') {
      const formUrl = new URL('/form1', request.url)
      return NextResponse.redirect(formUrl)
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
