'use client'

import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'
import ItineraryButton from '@/components/itinerary/ItineraryButton'

interface EventCardProps {
  event: {
    id: number
    title: string
    shortDescription?: string | null
    description?: string | null
    startDatetime: string
    endDatetime?: string | null
    locationName?: string | null
    address?: string | null
    city?: string | null
    price?: string | null
    imageUrl?: string | null
    isFeatured?: number | null
    categoryName?: string | null
    categoryColor?: string | null
    businessName?: string | null
  }
  compact?: boolean
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const desc = event.shortDescription || event.description || ''
  const truncatedDesc = desc.length > 100 ? desc.slice(0, 100) + '…' : desc

  return (
    <div className="group relative">
      <Link href={`/events/${event.id}`} className="block">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-kf-sky transition-all duration-200">
          {/* Image */}
          {!compact && event.imageUrl && (
            <div className="relative h-44 overflow-hidden bg-gray-100">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {event.isFeatured ? (
                <div className="absolute top-2 left-2 bg-kf-orange text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Sponsored
                </div>
              ) : null}
            </div>
          )}

          <div className="p-4">
            {/* Category + featured badge (when no image) */}
            <div className="flex items-center gap-2 mb-2">
              {event.categoryName && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: event.categoryColor || '#0d8c94' }}
                >
                  {event.categoryName}
                </span>
              )}
              {event.isFeatured && !event.imageUrl && (
                <span className="text-xs font-semibold text-kf-orange bg-kf-cream px-2 py-0.5 rounded-full border border-kf-sand">
                  Sponsored
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 group-hover:text-kf-teal transition-colors line-clamp-2 leading-snug mb-1">
              {event.title}
            </h3>

            {/* Description */}
            {!compact && truncatedDesc && (
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{truncatedDesc}</p>
            )}

            {/* Meta */}
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.startDatetime)} · {formatTime(event.startDatetime)}</span>
              </div>
              {event.locationName && (
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{event.locationName}{event.city ? `, ${event.city}` : ''}</span>
                </div>
              )}
              {event.price && (
                <div className="flex items-center gap-1 font-medium text-gray-700">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{event.price}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Itinerary button overlaid on card corner */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          variant="icon"
        />
      </div>
    </div>
  )
}
