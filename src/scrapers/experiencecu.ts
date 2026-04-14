import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, stripHtml, truncateText, parseDate } from './fetch-utils'

const BASE_URL = 'https://experiencecu.org'

export const experienceCuScraper: Scraper = {
  name: 'experiencecu',

  async run(): Promise<ScrapedEvent[]> {
    // Try the RSS feed first – much lighter than a full HTML page
    const rssEvents = await scrapeRss()
    if (rssEvents.length > 0) return rssEvents

    // Fall back to HTML scraping
    return scrapeHtml()
  },
}

async function scrapeRss(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []
  // The Events Calendar (WordPress plugin) exposes feeds at /events/feed/
  const feedUrl = `${BASE_URL}/events/feed/`
  try {
    const res = await fetchCached(feedUrl, {
      Accept: 'application/rss+xml, text/xml, */*',
    })
    if (!res?.ok) return events

    const xml = await res.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    $('item').each((_, el) => {
      const $el = $(el)
      const title = $el.find('title').first().text().trim()
      if (!title || title.length < 3) return

      const link =
        $el.find('link').first().text().trim() ||
        $el.find('guid').first().text().trim()

      // The Events Calendar plugin includes event-specific date fields
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

      const sourceEventId =
        link
          ? link.replace(/\/$/, '').split('/').filter(Boolean).pop() || link
          : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)

      events.push({
        title,
        description,
        startDatetime,
        endDatetime,
        locationName: location,
        city: 'Champaign',
        url: link || `${BASE_URL}/events/`,
        source: 'experiencecu',
        sourceEventId,
        categorySlug: 'community',
      })
    })
  } catch (err) {
    console.error('[experiencecu rss] error:', err)
  }
  return events
}

async function scrapeHtml(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []
  try {
    const res = await fetchCached(`${BASE_URL}/events/calendar-of-events`, {
      Accept: 'text/html',
    })
    if (!res?.ok) return events

    const html = await res.text()
    const $ = cheerio.load(html)

    // Covers The Events Calendar plugin, generic article/event layouts
    const selector = [
      '.tribe-event',
      '.type-tribe_events',
      'article.event',
      '.event-item',
      '.livewhale-event',
      '.eventlist-event',
    ].join(', ')

    $(selector).each((_, el) => {
      const $el = $(el)
      const titleEl = $el
        .find('h2, h3, h4, .tribe-event-title, .event-title, .eventlist-title')
        .first()
      const title = titleEl.text().trim()
      if (!title || title.length < 3) return

      const linkHref =
        titleEl.find('a').attr('href') ||
        $el.find('a[href*="event"]').first().attr('href') ||
        $el.find('a').first().attr('href') ||
        ''
      const url = linkHref.startsWith('http') ? linkHref : `${BASE_URL}${linkHref}`

      const dateText = $el
        .find(
          '.tribe-event-date-start, .tribe-start-date, .eventlist-datetimeinfo, time, .date, .event-date'
        )
        .first()
        .text()
        .trim()
      const startDatetime = parseDate(dateText)
      if (!startDatetime) return

      const desc = $el
        .find('.tribe-event-description, .description, .eventlist-description, p')
        .first()
        .text()
        .trim()
      const imageUrl = $el.find('img').first().attr('src') || undefined
      const location =
        $el.find('.tribe-venue, .location, .event-location').first().text().trim() ||
        undefined

      const sourceEventId =
        linkHref
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
        url: url || `${BASE_URL}/events/calendar-of-events`,
        source: 'experiencecu',
        sourceEventId,
        categorySlug: 'community',
      })
    })
  } catch (err) {
    console.error('[experiencecu html] error:', err)
  }
  return events
}
