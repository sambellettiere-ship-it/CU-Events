import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'

const BASE_URL = 'https://www.visitchampaigncounty.org'

export const visitChampaignCountyScraper: Scraper = {
  name: 'visitchampaigncounty',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      const res = await fetch(`${BASE_URL}/events/`, {
        headers: {
          'User-Agent': 'CU-Events/1.0 (cu-events.com)',
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) return events

      const html = await res.text()
      const $ = cheerio.load(html)

      // Visit Champaign County typically uses a list-based events layout
      $('article.event, .event-item, .tribe-event, .livewhale-event').each((_, el) => {
        const $el = $(el)
        const titleEl = $el.find('h2, h3, h4, .event-title, .tribe-event-title').first()
        const title = titleEl.text().trim()
        if (!title || title.length < 3) return

        const linkEl = titleEl.find('a').first() || $el.find('a[href*="event"]').first()
        const relUrl = linkEl.attr('href') || ''
        const url = relUrl.startsWith('http') ? relUrl : `${BASE_URL}${relUrl}`

        const dateText = $el.find('.tribe-event-date-start, time, .date').first().text().trim()
        const startDatetime = parseDateText(dateText)
        if (!startDatetime) return

        const description = $el.find('.tribe-event-description, .description, p').first().text().trim()
        const imageUrl = $el.find('img').first().attr('src') || undefined

        const sourceEventId = relUrl.split('/').filter(Boolean).pop() || title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)

        events.push({
          title,
          description: description || undefined,
          startDatetime,
          url: url || `${BASE_URL}/events/`,
          imageUrl,
          source: 'visitchampaigncounty',
          sourceEventId,
          categorySlug: 'community',
        })
      })
    } catch (err) {
      console.error('[visitchampaigncounty] scrape error:', err)
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
