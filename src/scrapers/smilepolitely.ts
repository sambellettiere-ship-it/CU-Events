import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, stripHtml, truncateText, parseDate } from './fetch-utils'

const BASE_URL = 'https://www.smilepolitely.com'

export const smilePolitelyScraper: Scraper = {
  name: 'smilepolitely',

  async run(): Promise<ScrapedEvent[]> {
    // Prefer RSS – far less bandwidth than full HTML pages
    const rssEvents = await scrapeRss()
    if (rssEvents.length > 0) return rssEvents

    return scrapeHtml()
  },
}

async function scrapeRss(): Promise<ScrapedEvent[]> {
  // Smile Politely is WordPress-based; try events-specific feeds before the
  // global feed to get the most relevant content with the least data transfer.
  const feedCandidates = [
    `${BASE_URL}/events/feed/`,
    `${BASE_URL}/things-to-do/feed/`,
    `${BASE_URL}/arts/feed/`,
  ]

  for (const feedUrl of feedCandidates) {
    const events = await parseFeed(feedUrl)
    if (events.length > 0) return events
  }

  return []
}

async function parseFeed(feedUrl: string): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []
  try {
    const res = await fetchCached(feedUrl, {
      Accept: 'application/rss+xml, text/xml, */*',
    })
    if (!res?.ok) return events

    const xml = await res.text()
    const $ = cheerio.load(xml, { xmlMode: true })
    const items = $('item')
    if (!items.length) return events

    items.each((_, el) => {
      const $el = $(el)
      const title = $el.find('title').first().text().trim()
      if (!title || title.length < 3) return

      const link =
        $el.find('link').first().text().trim() ||
        $el.find('guid').first().text().trim()

      // The Events Calendar plugin provides structured event dates
      const eventStart =
        $el.find('tribe\\:startdate, ev\\:startdate').first().text().trim() ||
        $el.find('pubDate').first().text().trim()
      const startDatetime = parseDate(eventStart)
      if (!startDatetime) return

      const endDatetime =
        parseDate($el.find('tribe\\:enddate, ev\\:enddate').first().text().trim()) ??
        undefined

      const rawDesc = $el.find('description').first().text().trim()
      const description = rawDesc ? truncateText(stripHtml(rawDesc)) : undefined

      const location =
        $el.find('tribe\\:venuename, tribe\\:venue').first().text().trim() || undefined

      const sourceEventId = link
        ? link.replace(/\/$/, '').split('/').filter(Boolean).pop() || link
        : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)

      events.push({
        title,
        description,
        startDatetime,
        endDatetime,
        locationName: location,
        city: 'Champaign',
        url: link || BASE_URL,
        source: 'smilepolitely',
        sourceEventId,
        categorySlug: 'arts',
      })
    })
  } catch (err) {
    console.error(`[smilepolitely rss] ${feedUrl} error:`, err)
  }
  return events
}

async function scrapeHtml(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []
  const pageCandidates = [
    `${BASE_URL}/events/`,
    `${BASE_URL}/things-to-do/`,
  ]

  for (const pageUrl of pageCandidates) {
    try {
      const res = await fetchCached(pageUrl, { Accept: 'text/html' })
      if (!res?.ok) continue

      const html = await res.text()
      const $ = cheerio.load(html)

      const selector = [
        '.tribe-event',
        '.type-tribe_events',
        'article.event',
        '.event-listing',
        '.event-item',
      ].join(', ')

      $(selector).each((_, el) => {
        const $el = $(el)
        const titleEl = $el
          .find('h2, h3, h4, .tribe-event-title, .entry-title')
          .first()
        const title = titleEl.text().trim()
        if (!title || title.length < 3) return

        const linkHref =
          titleEl.find('a').attr('href') ||
          $el.find('a').first().attr('href') ||
          ''
        const url = linkHref.startsWith('http') ? linkHref : `${BASE_URL}${linkHref}`

        const dateText = $el
          .find('.tribe-event-date-start, time, .date, .event-date')
          .first()
          .text()
          .trim()
        const startDatetime = parseDate(dateText)
        if (!startDatetime) return

        const desc = $el
          .find('.tribe-event-description, .description, p')
          .first()
          .text()
          .trim()
        const imageUrl = $el.find('img').first().attr('src') || undefined
        const location =
          $el.find('.tribe-venue, .location').first().text().trim() || undefined

        const sourceEventId = linkHref
          ? linkHref.replace(/\/$/, '').split('/').filter(Boolean).pop() ||
            title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
          : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)

        events.push({
          title,
          description: desc ? truncateText(desc) : undefined,
          startDatetime,
          locationName: location,
          imageUrl,
          city: 'Champaign',
          url: url || BASE_URL,
          source: 'smilepolitely',
          sourceEventId,
          categorySlug: 'arts',
        })
      })

      if (events.length > 0) return events
    } catch (err) {
      console.error(`[smilepolitely html] ${pageUrl} error:`, err)
    }
  }

  return events
}
