import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { businesses } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createToken, SessionUser } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.email, email))

  if (!business) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, business.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const sessionUser: SessionUser = {
    id: business.id,
    email: business.email,
    name: business.name,
    role: business.role || 'business',
    businessId: business.id,
  }

  const token = await createToken(sessionUser)

  const response = NextResponse.json({
    user: { id: business.id, name: business.name, email: business.email, role: business.role },
  })

  response.cookies.set('cu-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return response
}
