import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'

const BASE_URL = 'https://union.illinois.edu'

export const illiniUnionScraper: Scraper = {
  name: 'illini-union',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      const res = await fetch(`${BASE_URL}/events`, {
        headers: {
          'User-Agent': 'CU-Events/1.0 (cu-events.com)',
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) return events

      const html = await res.text()
      const $ = cheerio.load(html)

      // Parse event listings from the Illini Union events page
      $('.views-row, .event-item, article.event, .field-content').each((_, el) => {
        const $el = $(el)
        const titleEl = $el.find('h3, h2, .event-title, .views-field-title').first()
        const title = titleEl.text().trim()
        if (!title || title.length < 3) return

        const linkEl = titleEl.find('a').first() || $el.find('a').first()
        const relUrl = linkEl.attr('href') || ''
        const url = relUrl.startsWith('http') ? relUrl : `${BASE_URL}${relUrl}`

        const dateText = $el.find('.date-display-single, .field-name-field-date, time').first().text().trim()
        const locationText = $el.find('.location, .field-name-field-location').first().text().trim()

        const startDatetime = parseDateText(dateText)
        if (!startDatetime) return

        const sourceEventId = url.split('/').filter(Boolean).pop() || title.toLowerCase().replace(/\s+/g, '-')

        events.push({
          title,
          startDatetime,
          locationName: locationText || 'Illini Union',
          city: 'Urbana',
          url,
          source: 'illini-union',
          sourceEventId,
          categorySlug: 'community',
        })
      })
    } catch (err) {
      console.error('[illini-union] scrape error:', err)
    }

    return events
  },
}

function parseDateText(text: string): string | null {
  if (!text) return null
  try {
    const d = new Date(text)
    if (isNaN(d.getTime())) return null
    return d.toISOString().replace('T', ' ').slice(0, 19)
  } catch {
    return null
  }
}
