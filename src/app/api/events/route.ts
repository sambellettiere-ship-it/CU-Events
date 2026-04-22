import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events, categories, businesses } from '../../../../drizzle/schema'
import { eq, and, gte, lte, like, or, desc, asc, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startDatetime: z.string(),
  endDatetime: z.string().optional(),
  allDay: z.boolean().optional(),
  locationName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  url: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  ticketUrl: z.string().url().optional().or(z.literal('')),
  price: z.string().optional(),
  categoryId: z.number().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceType: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']).optional(),
  recurrenceEndDate: z.string().optional(),
  recurrenceDaysOfWeek: z.string().optional(), // JSON string
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const businessId = searchParams.get('businessId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = (page - 1) * limit

  // Lazily expire featured listings
  await db
    .update(events)
    .set({ isFeatured: 0 })
    .where(
      and(
        eq(events.isFeatured, 1),
        sql`${events.featuredUntil} IS NOT NULL`,
        sql`${events.featuredUntil} < datetime('now')`
      )
    )

  const conditions = [eq(events.isApproved, 1)]

  if (start) conditions.push(gte(events.startDatetime, start))
  if (end) conditions.push(lte(events.startDatetime, end))
  if (category) {
    const cat = await db.select().from(categories).where(eq(categories.slug, category))
    if (cat.length) conditions.push(eq(events.categoryId, cat[0].id))
  }
  if (search) {
    conditions.push(
      or(
        like(events.title, `%${search}%`),
        like(events.description, `%${search}%`),
        like(events.locationName, `%${search}%`)
      )!
    )
  }
  if (featured === 'true') conditions.push(eq(events.isFeatured, 1))
  if (businessId) conditions.push(eq(events.businessId, parseInt(businessId)))

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      shortDescription: events.shortDescription,
      description: events.description,
      startDatetime: events.startDatetime,
      endDatetime: events.endDatetime,
      allDay: events.allDay,
      locationName: events.locationName,
      address: events.address,
      city: events.city,
      latitude: events.latitude,
      longitude: events.longitude,
      url: events.url,
      imageUrl: events.imageUrl,
      price: events.price,
      isFeatured: events.isFeatured,
      isRecurring: events.isRecurring,
      recurrenceType: events.recurrenceType,
      source: events.source,
      categoryId: events.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
      businessId: events.businessId,
      businessName: businesses.name,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .leftJoin(businesses, eq(events.businessId, businesses.id))
    .where(and(...conditions))
    .orderBy(desc(events.isFeatured), asc(events.startDatetime))
    .limit(limit)
    .offset(offset)

  return NextResponse.json({ events: rows, page, limit })
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

  const parsed = createEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const shortDesc = data.description
    ? data.description.slice(0, 160).trim()
    : undefined

  const isBusiness = session.accountType === 'business'

  const [event] = await db
    .insert(events)
    .values({
      ...data,
      shortDescription: shortDesc,
      allDay: data.allDay ? 1 : 0,
      isRecurring: data.isRecurring ? 1 : 0,
      recurrenceType: data.isRecurring ? (data.recurrenceType ?? null) : null,
      recurrenceEndDate: data.isRecurring ? (data.recurrenceEndDate ?? null) : null,
      recurrenceDaysOfWeek: data.isRecurring ? (data.recurrenceDaysOfWeek ?? null) : null,
      businessId: isBusiness ? session.businessId! : null,
      submittedByUserId: isBusiness ? null : session.id,
      source: isBusiness ? 'business' : 'user',
      sourceEventId: isBusiness
        ? `business-${session.businessId!}-${Date.now()}`
        : `user-${session.id}-${Date.now()}`,
      url: data.url || null,
      imageUrl: data.imageUrl || null,
      ticketUrl: data.ticketUrl || null,
      isApproved: 0,
    })
    .returning()

  return NextResponse.json({ event }, { status: 201 })
}
