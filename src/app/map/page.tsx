import Link from 'next/link'
import { db } from '@/lib/db'
import { events, categories } from '../../../drizzle/schema'
import { eq, and, gte, isNotNull, desc, asc } from 'drizzle-orm'
import EventMapClient from '@/components/map/EventMapClient'

async function getMapEvents() {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return db
    .select({
      id: events.id,
      title: events.title,
      startDatetime: events.startDatetime,
      locationName: events.locationName,
      city: events.city,
      latitude: events.latitude,
      longitude: events.longitude,
      price: events.price,
      isFeatured: events.isFeatured,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .where(
      and(
        eq(events.isApproved, 1),
        gte(events.startDatetime, now),
        isNotNull(events.latitude),
        isNotNull(events.longitude)
      )
    )
    .orderBy(desc(events.isFeatured), asc(events.startDatetime))
    .limit(200)
}

export default async function MapPage() {
  const mapEvents = await getMapEvents()
  // Filter out any with null lat/lng (TypeScript)
  const validEvents = mapEvents.filter(
    (e): e is typeof e & { latitude: number; longitude: number } =>
      e.latitude !== null && e.longitude !== null
  )

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-bold text-gray-900">Event Map</h1>
          <p className="text-xs text-gray-500">
            {validEvents.length} upcoming event{validEvents.length !== 1 ? 's' : ''} with locations
          </p>
        </div>
        <Link
          href="/events"
          className="text-sm text-orange-600 hover:underline font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          List View
        </Link>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {validEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">🗺️</p>
              <p>No events with map locations yet</p>
            </div>
          </div>
        ) : (
          <EventMapClient events={validEvents} />
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-xs z-[1000]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Regular event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600">Sponsored event</span>
          </div>
        </div>
      </div>
    </div>
  )
}
