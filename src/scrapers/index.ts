import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { events, categories, scraperRuns } from '../../drizzle/schema'
import { eq, sql } from 'drizzle-orm'
import path from 'path'
import type { ScrapedEvent } from './base'
import { illiniUnionScraper } from './illini-union'
import { cityOfChampaignScraper } from './city-of-champaign'
import { visitChampaignCountyScraper } from './visitchampaigncounty'
import { universityOfIlloisScraper } from './university-of-illinois'
import { experienceCuScraper } from './experiencecu'
import { smilePolitelyScraper } from './smilepolitely'

const SCRAPERS = [
  illiniUnionScraper,
  cityOfChampaignScraper,
  visitChampaignCountyScraper,
  universityOfIlloisScraper,
  experienceCuScraper,
  smilePolitelyScraper,
]

function getDb() {
  const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'cu-events.db')
  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return drizzle(sqlite, { schema: { events, categories, scraperRuns } })
}

export async function runAllScrapers() {
  const db = getDb()

  // Get category ID mapping
  const allCats = await db.select().from(categories)
  const catMap = new Map(allCats.map((c) => [c.slug, c.id]))

  for (const scraper of SCRAPERS) {
    const startedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
    let runId: number | undefined

    // Insert scraper run record
    try {
      const [run] = await db
        .insert(scraperRuns)
        .values({ scraperName: scraper.name, startedAt, status: 'running' })
        .returning({ id: scraperRuns.id })
      runId = run.id
    } catch {
      // Continue even if tracking fails
    }

    let eventsFound = 0
    let eventsInserted = 0
    let eventsUpdated = 0
    let errorMessage: string | undefined

    try {
      console.log(`[scrapers] Running ${scraper.name}…`)
      const scraped = await scraper.run()
      eventsFound = scraped.length
      console.log(`[scrapers] ${scraper.name}: found ${eventsFound} events`)

      for (const event of scraped) {
        if (!event.title || !event.startDatetime || !event.sourceEventId) continue

        const categoryId = event.categorySlug ? catMap.get(event.categorySlug) : undefined

        const toInsert = {
          title: event.title,
          description: event.description ?? null,
          shortDescription: event.description ? event.description.slice(0, 160).trim() : null,
          startDatetime: event.startDatetime,
          endDatetime: event.endDatetime ?? null,
          locationName: event.locationName ?? null,
          address: event.address ?? null,
          city: event.city ?? 'Champaign',
          url: event.url,
          imageUrl: event.imageUrl ?? null,
          price: event.price ?? null,
          categoryId: categoryId ?? null,
          source: event.source,
          sourceEventId: event.sourceEventId,
          isApproved: 1,
        }

        try {
          const result = await db
            .insert(events)
            .values(toInsert)
            .onConflictDoUpdate({
              target: [events.source, events.sourceEventId],
              set: {
                title: sql`excluded.title`,
                description: sql`excluded.description`,
                startDatetime: sql`excluded.start_datetime`,
                endDatetime: sql`excluded.end_datetime`,
                locationName: sql`excluded.location_name`,
                updatedAt: sql`(datetime('now'))`,
              },
            })
            .returning({ id: events.id })

          if (result.length > 0) eventsInserted++
          else eventsUpdated++
        } catch {
          // Skip individual failures
        }
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err)
      console.error(`[scrapers] ${scraper.name} failed:`, errorMessage)
    }

    // Update run record
    if (runId) {
      try {
        const finishedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
        await db
          .update(scraperRuns)
          .set({
            finishedAt,
            status: errorMessage ? 'error' : 'success',
            eventsFound,
            eventsInserted,
            eventsUpdated,
            errorMessage: errorMessage ?? null,
          })
          .where(eq(scraperRuns.id, runId))
      } catch {
        // Ignore
      }
    }

    console.log(
      `[scrapers] ${scraper.name}: done. inserted=${eventsInserted}, updated=${eventsUpdated}${errorMessage ? `, error=${errorMessage}` : ''}`
    )
  }
}
