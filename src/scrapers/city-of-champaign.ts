import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'

const BASE_URL = 'https://www.champaignil.gov'

export const cityOfChampaignScraper: Scraper = {
  name: 'city-champaign',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      const res = await fetch(`${BASE_URL}/Calendar.aspx`, {
        headers: {
          'User-Agent': 'CU-Events/1.0 (cu-events.com)',
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) return events

      const html = await res.text()
      const $ = cheerio.load(html)

      // Parse the City of Champaign events calendar
      $('.fc-event, .calendar-event, .event-listing, tr.event').each((_, el) => {
        const $el = $(el)
        const title = $el.find('.fc-event-title, .event-title, td.title, h3').first().text().trim()
        if (!title || title.length < 3) return

        const linkEl = $el.find('a').first()
        const relUrl = linkEl.attr('href') || ''
        const url = relUrl.startsWith('http') ? relUrl : `${BASE_URL}${relUrl}`

        const dateText = $el.find('.date, .event-date, td.date, time').first().text().trim()
        const startDatetime = parseDateText(dateText)
        if (!startDatetime) return

        const sourceEventId = relUrl.split('?').pop() || title.toLowerCase().replace(/\s+/g, '-')

        events.push({
          title,
          startDatetime,
          city: 'Champaign',
          url: url || `${BASE_URL}/Calendar.aspx`,
          source: 'city-champaign',
          sourceEventId,
          categorySlug: 'community',
        })
      })
    } catch (err) {
      console.error('[city-champaign] scrape error:', err)
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
