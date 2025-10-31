import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

// Make sure to add this to your .env.local file
// JWT_SECRET=your-super-secret-key-here-change-this-in-production

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Find user
    const user = await db.collection('users').findOne({ email })
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '7d' }
    )

    // User data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    }

    // Create response with token cookie
    const response = NextResponse.json(userData)
    
    // Set secure HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
