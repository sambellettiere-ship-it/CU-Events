export interface ScrapedEvent {
  title: string
  description?: string
  startDatetime: string // 'YYYY-MM-DD HH:MM:SS'
  endDatetime?: string
  locationName?: string
  address?: string
  city?: string
  url: string
  imageUrl?: string
  price?: string
  categorySlug?: string
  source: string
  sourceEventId: string
}

export interface Scraper {
  name: string
  run(): Promise<ScrapedEvent[]>
}
