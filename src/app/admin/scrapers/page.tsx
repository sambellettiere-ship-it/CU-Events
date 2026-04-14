import { db } from '@/lib/db'
import { scraperRuns } from '../../../../drizzle/schema'
import { desc } from 'drizzle-orm'
import ScraperControls from './ScraperControls'

export default async function AdminScrapersPage() {
  const runs = await db
    .select()
    .from(scraperRuns)
    .orderBy(desc(scraperRuns.startedAt))
    .limit(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Scrapers</h1>
      <ScraperControls runs={runs} />
    </div>
  )
}
