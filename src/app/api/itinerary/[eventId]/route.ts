import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { itineraryItems } from '../../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession()
  if (!session || session.accountType !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { eventId } = await params
  const eventIdNum = parseInt(eventId)
  if (isNaN(eventIdNum)) {
    return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
  }

  await db
    .delete(itineraryItems)
    .where(
      and(
        eq(itineraryItems.userId, session.id),
        eq(itineraryItems.eventId, eventIdNum)
      )
    )

  return NextResponse.json({ ok: true })
}
