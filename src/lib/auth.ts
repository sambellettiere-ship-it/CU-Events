import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'
import { businesses, users } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cu-events-dev-secret-change-in-production'
)

export interface SessionUser {
  id: number
  email: string
  name: string
  role: string // 'user' | 'business' | 'admin'
  accountType: 'user' | 'business'
  businessId?: number // only set for business accounts
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('cu-session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return session
}

export async function requireBusiness(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.accountType !== 'business') {
    throw new Error('Business account required')
  }
  return session
}

export async function getBusinessById(id: number) {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id))
  return business ?? null
}

export async function getUserById(id: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
  return user ?? null
}
