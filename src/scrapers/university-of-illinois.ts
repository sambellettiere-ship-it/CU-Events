import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'

const BASE_URL = 'https://calendars.illinois.edu'

export const universityOfIlloisScraper: Scraper = {
  name: 'university-of-illinois',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      // UIUC Events Calendar RSS/JSON feed
      const res = await fetch(`${BASE_URL}/UIUC/calendar.rss`, {
        headers: {
          'User-Agent': 'CU-Events/1.0 (cu-events.com)',
          Accept: 'application/rss+xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        // Try the HTML calendar as fallback
        return await scrapeHtmlCalendar()
      }

      const xml = await res.text()
      const $ = cheerio.load(xml, { xmlMode: true })

      $('item').each((_, el) => {
        const $el = $(el)
        const title = $el.find('title').first().text().trim()
        if (!title || title.length < 3) return

        const link = $el.find('link').first().text().trim()
        const pubDate = $el.find('pubDate').first().text().trim()
        const description = $el.find('description').first().text().replace(/<[^>]+>/g, '').trim()

        const startDatetime = pubDate ? new Date(pubDate).toISOString().replace('T', ' ').slice(0, 19) : null
        if (!startDatetime) return

        const sourceEventId = link.split('/').filter(Boolean).pop() || title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)

        events.push({
          title,
          description: description || undefined,
          startDatetime,
          city: 'Urbana',
          url: link || `${BASE_URL}/UIUC`,
          source: 'university-of-illinois',
          sourceEventId,
          categorySlug: 'education',
        })
      })
    } catch (err) {
      console.error('[university-of-illinois] scrape error:', err)
    }

    return events
  },
}

async function scrapeHtmlCalendar(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []
  const BASE = 'https://calendars.illinois.edu'

  try {
    const res = await fetch(`${BASE}/UIUC`, {
      headers: {
        'User-Agent': 'CU-Events/1.0 (cu-events.com)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return events

    const html = await res.text()
    const $ = cheerio.load(html)

    $('.lwe-event, .event, article').each((_, el) => {
      const $el = $(el)
      const title = $el.find('h2, h3, .title').first().text().trim()
      if (!title || title.length < 3) return

      const link = $el.find('a').first().attr('href') || ''
      const url = link.startsWith('http') ? link : `${BASE}${link}`
      const dateText = $el.find('time, .date').first().text().trim()

      const startDatetime = dateText ? (() => {
        try {
          const d = new Date(dateText)
          return isNaN(d.getTime()) ? null : d.toISOString().replace('T', ' ').slice(0, 19)
        } catch { return null }
      })() : null

      if (!startDatetime) return

      events.push({
        title,
        startDatetime,
        city: 'Urbana',
        url,
        source: 'university-of-illinois',
        sourceEventId: link.split('/').filter(Boolean).pop() || title.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
        categorySlug: 'education',
      })
    })
  } catch (err) {
    console.error('[university-of-illinois html] scrape error:', err)
  }

  return events
}
