import { sql } from 'drizzle-orm'
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const businesses = sqliteTable('businesses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  website: text('website'),
  phone: text('phone'),
  description: text('description'),
  logoUrl: text('logo_url'),
  isVerified: integer('is_verified').default(0),
  role: text('role').default('business'), // 'business' | 'admin'
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  color: text('color').notNull().default('#6366f1'),
  iconName: text('icon_name').default('calendar'),
})

export const events = sqliteTable(
  'events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
    startDatetime: text('start_datetime').notNull(),
    endDatetime: text('end_datetime'),
    allDay: integer('all_day').default(0),
    locationName: text('location_name'),
    address: text('address'),
    city: text('city').default('Champaign'),
    latitude: real('latitude'),
    longitude: real('longitude'),
    url: text('url'),
    imageUrl: text('image_url'),
    ticketUrl: text('ticket_url'),
    price: text('price'),
    categoryId: integer('category_id').references(() => categories.id),
    businessId: integer('business_id').references(() => businesses.id),
    source: text('source').notNull().default('business'),
    sourceEventId: text('source_event_id'),
    isApproved: integer('is_approved').default(1),
    isFeatured: integer('is_featured').default(0),
    featuredUntil: text('featured_until'),
    viewCount: integer('view_count').default(0),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex('events_source_sourceEventId_idx').on(
      table.source,
      table.sourceEventId
    ),
  ]
)

export const sponsoredListings = sqliteTable('sponsored_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  stripeSessionId: text('stripe_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  amount: integer('amount'), // cents
  durationDays: integer('duration_days'),
  status: text('status').default('pending'), // 'pending' | 'active' | 'expired' | 'cancelled'
  startsAt: text('starts_at'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const scraperRuns = sqliteTable('scraper_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scraperName: text('scraper_name').notNull(),
  startedAt: text('started_at').notNull(),
  finishedAt: text('finished_at'),
  status: text('status').default('running'), // 'running' | 'success' | 'error'
  eventsFound: integer('events_found').default(0),
  eventsInserted: integer('events_inserted').default(0),
  eventsUpdated: integer('events_updated').default(0),
  errorMessage: text('error_message'),
})

export type Business = typeof businesses.$inferSelect
export type NewBusiness = typeof businesses.$inferInsert
export type Category = typeof categories.$inferSelect
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type SponsoredListing = typeof sponsoredListings.$inferSelect
export type ScraperRun = typeof scraperRuns.$inferSelect
