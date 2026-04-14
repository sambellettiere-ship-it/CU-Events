import * as cheerio from 'cheerio'
import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, parseDate } from './fetch-utils'

const BASE_URL = 'https://experiencecu.org'

export const experienceCuScraper: Scraper = {
  name: 'experiencecu',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []
    
    try {
      // Fetch the main calendar page HTML
      const res = await fetchCached(`${BASE_URL}/events/calendar-of-events/`, {
        Accept: 'text/html',
      })
      
      if (!res?.ok) {
        console.error(`[experiencecu] Failed to fetch. Status: ${res.status}`)
        return events
      }

      const html = await res.text()
      const $ = cheerio.load(html)

      // Simpleview sites typically wrap listings in these specific classes
      const selectors = ['.listing', '.item', '.event-item', '.crm-listing', '.event']
      
      $(selectors.join(', ')).each((_, el) => {
        const $el = $(el)
        
        // Find the main title link
        const titleEl = $el.find('.title a, h2 a, h3 a, h4 a, .event-title a').first()
        let title = titleEl.text().trim()
        
        // If we couldn't find a nested link, try the wrapper or first heading
        if (!title) {
           title = $el.find('.title, h2, h3, h4').first().text().trim()
        }

        if (!title || title.length < 3) return

        // Clean up title (Sometimes Simpleview prepends "Events - " for SEO)
        if (title.startsWith('Events - ')) {
          title = title.replace('Events - ', '').trim()
        }

        // Get the link
        const linkHref = titleEl.attr('href') || $el.find('a[href*="event="]').first().attr('href') || ''
        const url = linkHref.startsWith('http') ? linkHref : `${BASE_URL}${linkHref}`
        
        // Simpleview uses a reliable unique ID in the URL, e.g., ?event=20506
        let sourceEventId = ''
        const eventIdMatch = url.match(/event=(\d+)/)
        if (eventIdMatch) {
          sourceEventId = eventIdMatch[1] // Perfect unique ID
        } else {
          sourceEventId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
        }

        // Find Date
        const dateText = $el.find('.date, .event-date, .date-display-single, .dates').first().text().trim()
        const startDatetime = parseDate(dateText)
        
        // If we can't figure out the date, we have to skip it so it doesn't break your DB
        if (!startDatetime) return 

        // Find Location
        const locationName = $el.find('.location, .venue, .event-location').first().text().trim() || undefined

        // Find Image (if available on the list view)
        const imageUrl = $el.find('.image img, .photo img, img').first().attr('src') || undefined
        const absoluteImageUrl = imageUrl && !imageUrl.startsWith('http') ? `${BASE_URL}${imageUrl}` : imageUrl

        events.push({
          title,
          description: undefined, // List views usually don't have full descriptions here
          startDatetime,
          locationName,
          city: 'Champaign',
          url: url || `${BASE_URL}/events/calendar-of-events`,
          imageUrl: absoluteImageUrl,
          source: 'experiencecu',
          sourceEventId,
          categorySlug: 'community',
        })
      })

      if (events.length === 0) {
        console.warn('[experiencecu] Loaded HTML but could not find any event containers. DOM structure may have changed.')
      }

    } catch (err) {
      console.error('[experiencecu html] error:', err)
    }

    return events
  },
}
