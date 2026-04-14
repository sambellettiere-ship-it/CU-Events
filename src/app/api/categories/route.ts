import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '../../../../drizzle/schema'

export async function GET() {
  const rows = await db.select().from(categories).orderBy(categories.name)
  return NextResponse.json({ categories: rows })
}
