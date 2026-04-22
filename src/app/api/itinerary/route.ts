import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { itineraryItems, events, categories } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.accountType !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startDatetime: events.startDatetime,
      endDatetime: events.endDatetime,
      locationName: events.locationName,
      address: events.address,
      city: events.city,
      price: events.price,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(itineraryItems)
    .innerJoin(events, eq(itineraryItems.eventId, events.id))
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .where(eq(itineraryItems.userId, session.id))
    .orderBy(events.startDatetime)

  return NextResponse.json({ items: rows })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.accountType !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { eventId } = body as { eventId?: number }
  if (!eventId || typeof eventId !== 'number') {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 })
  }

  await db
    .insert(itineraryItems)
    .values({ userId: session.id, eventId })
    .onConflictDoNothing()

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE() {
  const session = await getSession()
  if (!session || session.accountType !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await db
    .delete(itineraryItems)
    .where(eq(itineraryItems.userId, session.id))

  return NextResponse.json({ ok: true })
}
