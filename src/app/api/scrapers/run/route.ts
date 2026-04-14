import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { runAllScrapers } from '@/scrapers'

export async function POST() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Run scrapers without blocking the response
  runAllScrapers().catch(console.error)

  return NextResponse.json({ message: 'Scrapers started' })
}
