import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sales } from '../../../../drizzle/schema'
import { eq, gte, desc, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const createSaleSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['garage', 'estate', 'yard', 'moving', 'church']),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  startDatetime: z.string(),
  endDatetime: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const city = searchParams.get('city')
  const upcoming = searchParams.get('upcoming') !== 'false'

  const conditions = [eq(sales.isApproved, 1)]
  if (upcoming) {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    conditions.push(gte(sales.startDatetime, now))
  }
  if (type) conditions.push(eq(sales.type, type))
  if (city) conditions.push(eq(sales.city, city))

  const rows = await db
    .select()
    .from(sales)
    .where(and(...conditions))
    .orderBy(desc(sales.startDatetime))
    .limit(100)

  return NextResponse.json({ sales: rows })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSaleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const userId = session.accountType === 'user' ? session.id : null

  const [sale] = await db
    .insert(sales)
    .values({
      ...data,
      contactEmail: data.contactEmail || null,
      imageUrl: data.imageUrl || null,
      endDatetime: data.endDatetime || null,
      submittedByUserId: userId,
      isApproved: 1,
    })
    .returning()

  return NextResponse.json({ sale }, { status: 201 })
}
