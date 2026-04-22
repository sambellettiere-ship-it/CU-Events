import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sales } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const idNum = parseInt(id)
  if (isNaN(idNum)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const [sale] = await db.select().from(sales).where(eq(sales.id, idNum))
  if (!sale) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ sale })
}
