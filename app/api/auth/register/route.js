// app/api/auth/register/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId.toString(),
        email 
      },
      process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '7d' }
    )

    // User data without password
    const user = {
      id: result.insertedId,
      name,
      email,
    }

    // Create response with token cookie
    const response = NextResponse.json(user, { status: 201 })
    
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
