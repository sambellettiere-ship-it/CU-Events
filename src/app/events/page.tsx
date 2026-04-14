import { Suspense } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { events, categories, businesses } from '../../../drizzle/schema'
import { eq, and, gte, lte, like, or, desc, asc, sql } from 'drizzle-orm'
import EventCard from '@/components/events/EventCard'
import EventFilters from '@/components/events/EventFilters'
import CalendarViewClient from '@/components/events/CalendarViewClient'

interface SearchParams {
  category?: string
  search?: string
  start?: string
  end?: string
  view?: string
  featured?: string
  page?: string
}

async function getEvents(params: SearchParams) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const conditions = [eq(events.isApproved, 1), gte(events.startDatetime, now)]

  if (params.start) conditions.push(gte(events.startDatetime, params.start))
  if (params.end) conditions.push(lte(events.startDatetime, params.end))
  if (params.featured === 'true') conditions.push(eq(events.isFeatured, 1))

  if (params.category) {
    const cats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, params.category))
    if (cats.length) conditions.push(eq(events.categoryId, cats[0].id))
  }

  if (params.search) {
    conditions.push(
      or(
        like(events.title, `%${params.search}%`),
        like(events.description, `%${params.search}%`),
        like(events.locationName, `%${params.search}%`)
      )!
    )
  }

  return db
    .select({
      id: events.id,
      title: events.title,
      shortDescription: events.shortDescription,
      description: events.description,
      startDatetime: events.startDatetime,
      endDatetime: events.endDatetime,
      allDay: events.allDay,
      locationName: events.locationName,
      city: events.city,
      latitude: events.latitude,
      longitude: events.longitude,
      price: events.price,
      imageUrl: events.imageUrl,
      isFeatured: events.isFeatured,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
      businessName: businesses.name,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .leftJoin(businesses, eq(events.businessId, businesses.id))
    .where(and(...conditions))
    .orderBy(desc(events.isFeatured), asc(events.startDatetime))
    .limit(100)
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const view = params.view || 'list'

  const [eventsData, allCategories] = await Promise.all([
    getEvents(params),
    db.select().from(categories).orderBy(categories.name),
  ])

  const activeCategory = allCategories.find((c) => c.slug === params.category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {activeCategory ? `${activeCategory.name} Events` : 'All Events'}
          {params.search ? ` matching "${params.search}"` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {eventsData.length} upcoming event{eventsData.length !== 1 ? 's' : ''} in Champaign-Urbana
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <Suspense>
            <EventFilters categories={allCategories} />
          </Suspense>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* View toggle */}
          <div className="flex items-center gap-2 mb-4">
            <Link
              href={`/events?${new URLSearchParams({ ...params, view: 'list' }).toString()}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </Link>
            <Link
              href={`/events?${new URLSearchParams({ ...params, view: 'calendar' }).toString()}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-orange-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </Link>
          </div>

          {/* Events content */}
          {eventsData.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">No events found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : view === 'calendar' ? (
            <CalendarViewClient events={eventsData} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {eventsData.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
