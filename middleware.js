// middleware.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Protected routes
  const protectedRoutes = ['/detection', '/chatbot', '/history', '/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-fallback-secret-key'
      )
      await jwtVerify(token, secret)
      
      // Token is valid, continue
      return NextResponse.next()
    } catch (error) {
      // Token is invalid, redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('token')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/detection/:path*',
    '/chatbot/:path*', 
    '/history/:path*',
    '/dashboard/:path*',
  ]
}
