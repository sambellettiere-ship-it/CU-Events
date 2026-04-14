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

      if (!res || !res.ok) return events

      const html = await res.text()
      const $ = cheerio.load(html)

      // Broadened the selectors to ensure we don't miss UI changes
      const eventElements = $('article.event, .event-item, .tribe-event, .livewhale-event, .event-list-item, div.event')
      
      eventElements.each((_, el) => {
        const $el = $(el)
        const titleEl = $el.find('h2, h3, h4, .event-title, .tribe-event-title').first()
        let title = titleEl.text().trim()

        // Fallback if title element not found but it's nested in a link
        if (!title) {
          title = $el.find('a[title]').attr('title') || $el.find('a').first().text().trim()
        }

        if (!title || title.length < 3) return

        const linkEl = titleEl.find('a').first()
        const relUrl = linkEl.attr('href') || $el.find('a[href*="event"]').first().attr('href') || ''
        const url = relUrl.startsWith('http') ? relUrl : `${BASE_URL}${relUrl.startsWith('/') ? '' : '/'}${relUrl}`

        const dateText = $el.find('.tribe-event-date-start, time, .date, .event-date').first().text().trim()
        let startDatetime = parseDate(dateText)

        // Try an alternate element if the primary one fails
        if (!startDatetime) {
          const altDateText = $el.find('span.date, span.time').text().trim()
          startDatetime = parseDate(altDateText)
        }

        if (!startDatetime) {
          console.warn(`[visitchampaigncounty] Skipped "${title}" due to unparsable date: "${dateText}"`)
          return
        }

        const description = $el.find('.tribe-event-description, .description, p').first().text().trim()
        const imageUrl = $el.find('img').first().attr('src') || undefined

        const sourceEventId = relUrl.split('/').filter(Boolean).pop() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)

        events.push({
          title,
          description: description ? truncateText(description) : undefined,
          startDatetime,
          url: url || `${BASE_URL}/events/`,
          imageUrl: imageUrl?.startsWith('http') ? imageUrl : (imageUrl ? `${BASE_URL}${imageUrl}` : undefined),
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
