import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, stripHtml, truncateText, parseDate } from './fetch-utils'

const BASE_URL = 'https://calendars.illinois.edu'

export const universityOfIlloisScraper: Scraper = {
  name: 'university-of-illinois',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      const res = await fetchCached(`${BASE_URL}/UIUC/calendar.rss`, {
        Accept: 'application/rss+xml, text/xml, */*',
      })

      // null → 304 Not Modified; skip parsing, existing DB records are current
      if (res === null) return events

      if (!res.ok) {
        return scrapeHtmlCalendar()
      }

      const xml = await res.text()
      const $ = cheerio.load(xml, { xmlMode: true })

      $('item').each((_, el) => {
        const $el = $(el)
        const title = $el.find('title').first().text().trim()
        if (!title || title.length < 3) return

        const link = $el.find('link').first().text().trim()
        const pubDate = $el.find('pubDate').first().text().trim()
        const rawDesc = $el.find('description').first().text().trim()
        const description = rawDesc
          ? truncateText(stripHtml(rawDesc))
          : undefined

        const startDatetime = parseDate(pubDate)
        if (!startDatetime) return

        const sourceEventId =
          link.split('/').filter(Boolean).pop() ||
          title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)

        events.push({
          title,
          description,
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

  try {
    const res = await fetchCached(`${BASE_URL}/UIUC`, { Accept: 'text/html' })
    if (!res?.ok) return events

    const html = await res.text()
    const $ = cheerio.load(html)

    $('.lwe-event, .event, article').each((_, el) => {
      const $el = $(el)
      const title = $el.find('h2, h3, .title').first().text().trim()
      if (!title || title.length < 3) return

      const link = $el.find('a').first().attr('href') || ''
      const url = link.startsWith('http') ? link : `${BASE_URL}${link}`
      const dateText = $el.find('time, .date').first().text().trim()
      const startDatetime = parseDate(dateText)
      if (!startDatetime) return

      events.push({
        title,
        startDatetime,
        city: 'Urbana',
        url,
        source: 'university-of-illinois',
        sourceEventId:
          link.split('/').filter(Boolean).pop() ||
          title.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
        categorySlug: 'education',
      })
    })
  } catch (err) {
    console.error('[university-of-illinois html] scrape error:', err)
  }

  return events
}
