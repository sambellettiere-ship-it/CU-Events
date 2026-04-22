import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events, categories, businesses } from '../../../../../drizzle/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  startDatetime: z.string().optional(),
  endDatetime: z.string().optional().nullable(),
  allDay: z.boolean().optional(),
  locationName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  url: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ticketUrl: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  categoryId: z.number().optional().nullable(),
  isApproved: z.number().optional(),
  isFeatured: z.number().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const eventId = parseInt(id)
  if (isNaN(eventId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const [row] = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      shortDescription: events.shortDescription,
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
      ticketUrl: events.ticketUrl,
      price: events.price,
      isFeatured: events.isFeatured,
      isApproved: events.isApproved,
      source: events.source,
      viewCount: events.viewCount,
      createdAt: events.createdAt,
      categoryId: events.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
      businessId: events.businessId,
      businessName: businesses.name,
      businessWebsite: businesses.website,
      businessPhone: businesses.phone,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .leftJoin(businesses, eq(events.businessId, businesses.id))
    .where(and(eq(events.id, eventId), eq(events.isApproved, 1)))

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Increment view count
  await db
    .update(events)
    .set({ viewCount: sql`${events.viewCount} + 1` })
    .where(eq(events.id, eventId))

  return NextResponse.json({ event: row })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const eventId = parseInt(id)
  if (isNaN(eventId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const [existing] = await db.select().from(events).where(eq(events.id, eventId))
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = session.role === 'admin'
  const isBusinessOwner = session.accountType === 'business' && existing.businessId === session.businessId
  const isUserOwner = session.accountType === 'user' && existing.submittedByUserId === session.id
  if (!isAdmin && !isBusinessOwner && !isUserOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  const shortDesc = data.description ? data.description.slice(0, 160).trim() : undefined
  const { allDay, ...restData } = data

  // Non-admins cannot change approval/featured status
  if (!isAdmin) {
    delete restData.isApproved
    delete restData.isFeatured
  }

  const [updated] = await db
    .update(events)
    .set({
      ...restData,
      ...(shortDesc ? { shortDescription: shortDesc } : {}),
      ...(allDay !== undefined ? { allDay: allDay ? 1 : 0 } : {}),
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(events.id, eventId))
    .returning()

  return NextResponse.json({ event: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const eventId = parseInt(id)
  if (isNaN(eventId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const [existing] = await db.select().from(events).where(eq(events.id, eventId))
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = session.role === 'admin'
  const isBusinessOwner = session.accountType === 'business' && existing.businessId === session.businessId
  const isUserOwner = session.accountType === 'user' && existing.submittedByUserId === session.id
  if (!isAdmin && !isBusinessOwner && !isUserOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.delete(events).where(eq(events.id, eventId))
  return NextResponse.json({ success: true })
}
