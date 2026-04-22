import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { events, categories, businesses } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { formatDateRange } from '@/lib/utils'
import MiniMapClient from '@/components/map/MiniMapClient'
import ItineraryButton from '@/components/itinerary/ItineraryButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [event] = await db
    .select({ title: events.title, shortDescription: events.shortDescription })
    .from(events)
    .where(eq(events.id, parseInt(id)))
  if (!event) return {}
  return {
    title: `${event.title} – CU Events`,
    description: event.shortDescription || undefined,
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const eventId = parseInt(id)
  if (isNaN(eventId)) notFound()

  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      shortDescription: events.shortDescription,
      startDatetime: events.startDatetime,
      endDatetime: events.endDatetime,
      allDay: events.allDay,
      locationName: events.locationName,
      address: events.address,
      city: events.city,
      latitude: events.latitude,
      longitude: events.longitude,
      url: events.url,
      imageUrl: events.imageUrl,
      ticketUrl: events.ticketUrl,
      price: events.price,
      isFeatured: events.isFeatured,
      source: events.source,
      viewCount: events.viewCount,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
      businessId: events.businessId,
      businessName: businesses.name,
      businessWebsite: businesses.website,
      businessPhone: businesses.phone,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .leftJoin(businesses, eq(events.businessId, businesses.id))
    .where(and(eq(events.id, eventId), eq(events.isApproved, 1)))

  if (!event) notFound()

  // Build Google Calendar add link
  const gcalStart = event.startDatetime.replace(/[-: ]/g, '').slice(0, 15) + 'Z'
  const gcalEnd = event.endDatetime
    ? event.endDatetime.replace(/[-: ]/g, '').slice(0, 15) + 'Z'
    : gcalStart
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${gcalStart}/${gcalEnd}&location=${encodeURIComponent(event.address || event.locationName || '')}&details=${encodeURIComponent(event.description || '')}`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link href="/events" className="hover:text-gray-700">Events</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            {event.isFeatured ? (
              <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                <span>★</span> Sponsored
              </div>
            ) : null}
            {event.categoryName && (
              <span
                className="inline-block text-xs font-medium text-white px-2.5 py-1 rounded-full mb-3"
                style={{ backgroundColor: event.categoryColor || '#6366f1' }}
              >
                {event.categoryName}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
          </div>

          {/* Hero image */}
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 sm:h-80 object-cover rounded-xl border border-gray-200"
            />
          )}

          {/* Description */}
          {event.description && (
            <div className="prose prose-gray max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About this event</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Map */}
          {event.latitude && event.longitude && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
              <MiniMapClient
                lat={event.latitude}
                lng={event.longitude}
                title={event.title}
                address={event.address || event.locationName || ''}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Event details card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date & Time</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {formatDateRange(event.startDatetime, event.endDatetime)}
                </p>
              </div>
            </div>

            {(event.locationName || event.address) && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
                  {event.locationName && <p className="text-sm font-medium text-gray-900 mt-0.5">{event.locationName}</p>}
                  {event.address && <p className="text-sm text-gray-500">{event.address}{event.city ? `, ${event.city}` : ''}</p>}
                </div>
              </div>
            )}

            {event.price && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.price}</p>
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm text-center py-3 rounded-xl transition-colors"
              >
                Get Tickets
              </a>
            )}
            <ItineraryButton
              event={{
                id: event.id,
                title: event.title,
                startDatetime: event.startDatetime,
                endDatetime: event.endDatetime,
                locationName: event.locationName,
                address: event.address,
                city: event.city,
                price: event.price,
                categoryName: event.categoryName,
                categoryColor: event.categoryColor,
              }}
              variant="full"
            />
            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm text-center py-3 rounded-xl transition-colors"
            >
              Add to Google Calendar
            </a>
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm text-center py-3 rounded-xl transition-colors"
              >
                More Info →
              </a>
            )}
          </div>

          {/* Organizer */}
          {event.businessName && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Organized by</p>
              <p className="font-semibold text-gray-900">{event.businessName}</p>
              {event.businessPhone && (
                <p className="text-sm text-gray-500 mt-1">{event.businessPhone}</p>
              )}
              {event.businessWebsite && (
                <a
                  href={event.businessWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 hover:underline mt-1 block"
                >
                  {event.businessWebsite.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
