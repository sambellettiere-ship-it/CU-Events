import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, truncateText, parseDate } from './fetch-utils'

const BASE_URL = 'https://union.illinois.edu'

export const illiniUnionScraper: Scraper = {
  name: 'illini-union',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      const res = await fetchCached(`${BASE_URL}/events`, { Accept: 'text/html' })

      // null → 304 Not Modified; nothing new to scrape
      if (res === null) return events
      if (!res.ok) return events

      const html = await res.text()
      const $ = cheerio.load(html)

      $('.views-row, .event-item, article.event, .field-content').each((_, el) => {
        const $el = $(el)
        const titleEl = $el
          .find('h3, h2, .event-title, .views-field-title')
          .first()
        const title = titleEl.text().trim()
        if (!title || title.length < 3) return

        const relUrl =
          titleEl.find('a').attr('href') || $el.find('a').first().attr('href') || ''
        const url = relUrl.startsWith('http') ? relUrl : `${BASE_URL}${relUrl}`

        const dateText = $el
          .find('.date-display-single, .field-name-field-date, time')
          .first()
          .text()
          .trim()
        const locationText = $el
          .find('.location, .field-name-field-location')
          .first()
          .text()
          .trim()

        const startDatetime = parseDate(dateText)
        if (!startDatetime) return

        const description = $el.find('.field-name-body, .description, p').first().text().trim()

        const sourceEventId =
          url.split('/').filter(Boolean).pop() ||
          title.toLowerCase().replace(/\s+/g, '-')

        events.push({
          title,
          description: description ? truncateText(description) : undefined,
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
