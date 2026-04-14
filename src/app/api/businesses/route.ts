import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { businesses } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, password, website, phone, description } = parsed.data

  const [existing] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.email, email))

  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const [business] = await db
    .insert(businesses)
    .values({
      name,
      email,
      passwordHash,
      website: website || null,
      phone: phone || null,
      description: description || null,
    })
    .returning({ id: businesses.id, name: businesses.name, email: businesses.email })

  return NextResponse.json({ business }, { status: 201 })
}
