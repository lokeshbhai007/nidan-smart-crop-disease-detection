// app/api/auth/logout/route.js
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  // Clear auth cookie
  response.cookies.set('token', '', { 
    maxAge: 0,
    path: '/',
  })
  
  return response
}