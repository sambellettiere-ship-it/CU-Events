import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, truncateText, parseDate } from './fetch-utils'

const BASE_URL = 'https://www.champaignil.gov'

export const cityOfChampaignScraper: Scraper = {
  name: 'city-champaign',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      const res = await fetchCached(`${BASE_URL}/Calendar.aspx`, { Accept: 'text/html' })

      // null → 304 Not Modified; nothing new to scrape
      if (res === null) return events
      if (!res.ok) return events

      const html = await res.text()
      const $ = cheerio.load(html)

      $('.fc-event, .calendar-event, .event-listing, tr.event').each((_, el) => {
        const $el = $(el)
        const title = $el
          .find('.fc-event-title, .event-title, td.title, h3')
          .first()
          .text()
          .trim()
        if (!title || title.length < 3) return

        const relUrl = $el.find('a').first().attr('href') || ''
        const url = relUrl.startsWith('http') ? relUrl : `${BASE_URL}${relUrl}`

        const dateText = $el
          .find('.date, .event-date, td.date, time')
          .first()
          .text()
          .trim()
        const startDatetime = parseDate(dateText)
        if (!startDatetime) return

        const description = $el.find('.description, p').first().text().trim()

        const sourceEventId =
          relUrl.split('?').pop() ||
          title.toLowerCase().replace(/\s+/g, '-')

        events.push({
          title,
          description: description ? truncateText(description) : undefined,
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
