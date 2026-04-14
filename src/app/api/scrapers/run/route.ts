import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { runAllScrapers } from '@/scrapers'

// Force dynamic execution so Next.js doesn't try to aggressively cache this route
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // Allows up to 5 minutes if you eventually deploy to Vercel/Railway

export async function POST() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // FIX: We MUST await this process. Otherwise, Next.js kills the background
    // promise the millisecond the response below is returned to the client.
    await runAllScrapers()
    
    return NextResponse.json({ message: 'Scrapers completed successfully' })
  } catch (error) {
    console.error('[API] Scraper run failed:', error)
    return NextResponse.json({ error: 'Scraper execution failed' }, { status: 500 })
  }
}
