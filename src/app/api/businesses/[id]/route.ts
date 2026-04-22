import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { businesses } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  isVerified: z.number().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const businessId = parseInt(id)
  if (isNaN(businessId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [updated] = await db
    .update(businesses)
    .set(parsed.data)
    .where(eq(businesses.id, businessId))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ business: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const businessId = parseInt(id)
  if (isNaN(businessId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  await db.delete(businesses).where(eq(businesses.id, businessId))
  return NextResponse.json({ success: true })
}
