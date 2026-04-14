import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, truncateText, parseDate } from './fetch-utils'

const BASE_URL = 'https://www.visitchampaigncounty.org'

export const visitChampaignCountyScraper: Scraper = {
  name: 'visitchampaigncounty',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      const res = await fetchCached(`${BASE_URL}/events/`, { Accept: 'text/html' })

      // null → 304 Not Modified; nothing new to scrape
      if (res === null) return events
      if (!res.ok) return events

      const html = await res.text()
      const $ = cheerio.load(html)

      $('article.event, .event-item, .tribe-event, .livewhale-event').each((_, el) => {
        const $el = $(el)
        const titleEl = $el
          .find('h2, h3, h4, .event-title, .tribe-event-title')
          .first()
        const title = titleEl.text().trim()
        if (!title || title.length < 3) return

        const linkEl = titleEl.find('a').first()
        const relUrl = linkEl.attr('href') || $el.find('a[href*="event"]').first().attr('href') || ''
        const url = relUrl.startsWith('http') ? relUrl : `${BASE_URL}${relUrl}`

        const dateText = $el
          .find('.tribe-event-date-start, time, .date')
          .first()
          .text()
          .trim()
        const startDatetime = parseDate(dateText)
        if (!startDatetime) return

        const description = $el
          .find('.tribe-event-description, .description, p')
          .first()
          .text()
          .trim()
        const imageUrl = $el.find('img').first().attr('src') || undefined

        const sourceEventId =
          relUrl.split('/').filter(Boolean).pop() ||
          title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)

        events.push({
          title,
          description: description ? truncateText(description) : undefined,
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
