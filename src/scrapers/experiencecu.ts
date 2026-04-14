import type { Scraper, ScrapedEvent } from './base'
import { fetchCached, stripHtml, truncateText } from './fetch-utils'

const BASE_URL = 'https://experiencecu.org'
const API_URL = `${BASE_URL}/wp-json/tribe/events/v1/events`

export const experienceCuScraper: Scraper = {
  name: 'experiencecu',

  async run(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []
    
    try {
      // Fetching from the WordPress REST API for The Events Calendar
      const res = await fetchCached(`${API_URL}?per_page=50&start_date=${new Date().toISOString().split('T')[0]}`, {
        Accept: 'application/json',
      })
      
      if (!res?.ok) {
        console.error(`[experiencecu api] Failed to fetch. Status: ${res.status}`)
        return events
      }

      const data = await res.json()
      
      if (!data.events || !Array.isArray(data.events)) {
        console.log('[experiencecu api] No events array found in response')
        return events
      }

      data.events.forEach((event: any) => {
        // Skip events without a valid title or start date
        if (!event.title || !event.start_date) return

        // Clean up the description
        const rawDesc = event.description || ''
        const description = rawDesc ? truncateText(stripHtml(rawDesc)) : undefined

        // Extract Venue details if available
        let locationName = undefined
        let address = undefined
        let city = 'Champaign' // Default fallback
        
        if (event.venue) {
          locationName = event.venue.venue
          address = event.venue.address
          if (event.venue.city) {
              city = event.venue.city
          }
        }

        // Calculate a safe fallback URL
        const url = event.url || `${BASE_URL}/events/`
        
        // Grab image URL if attached
        const imageUrl = event.image?.url || undefined

        events.push({
          title: stripHtml(event.title).trim(), // sometimes title contains HTML entities
          description,
          startDatetime: event.start_date, // Usually 'YYYY-MM-DD HH:MM:SS'
          endDatetime: event.end_date, 
          locationName,
          address,
          city,
          url,
          imageUrl,
          // Extract price if available from cost field
          price: event.cost !== '' ? event.cost : undefined,
          source: 'experiencecu',
          sourceEventId: event.id.toString(), // Reliable unique ID from WP
          categorySlug: 'community',
        })
      })

    } catch (err) {
      console.error('[experiencecu api] error:', err)
    }

    return events
  },
}
