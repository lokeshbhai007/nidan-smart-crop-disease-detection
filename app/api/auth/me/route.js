// app/api/auth/me/route.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(null)
    }

    // Verify token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-fallback-secret-key'
    )
    const { payload } = await jwtVerify(token, secret)
    
    // Get user from database
    const client = await clientPromise
    const db = client.db()
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(null)
  }
}