'use client'

import { useItinerary, ItineraryEvent } from '@/lib/itinerary-context'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'

function groupByDate(items: ItineraryEvent[]): Record<string, ItineraryEvent[]> {
  const groups: Record<string, ItineraryEvent[]> = {}
  for (const item of items) {
    const date = item.startDatetime.slice(0, 10)
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
  }
  // Sort events within each day by start time
  for (const date of Object.keys(groups)) {
    groups[date].sort((a, b) => a.startDatetime.localeCompare(b.startDatetime))
  }
  return groups
}

function formatDuration(start: string, end?: string | null): string {
  if (!end) return ''
  const startMs = new Date(start.replace(' ', 'T')).getTime()
  const endMs = new Date(end.replace(' ', 'T')).getTime()
  const mins = Math.round((endMs - startMs) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function TimelineEvent({ event, onRemove }: { event: ItineraryEvent; onRemove: () => void }) {
  const duration = formatDuration(event.startDatetime, event.endDatetime)

  return (
    <div className="flex gap-4 group">
      {/* Time column */}
      <div className="w-16 flex-shrink-0 text-right pt-0.5">
        <p className="text-sm font-semibold text-gray-700">{formatTime(event.startDatetime)}</p>
        {event.endDatetime && (
          <p className="text-xs text-gray-400">{formatTime(event.endDatetime)}</p>
        )}
      </div>

      {/* Line + dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1 flex-shrink-0 ring-2 ring-white" />
        <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
      </div>

      {/* Event card */}
      <div className="flex-1 pb-6">
        <div
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          style={event.categoryColor ? { borderLeftColor: event.categoryColor, borderLeftWidth: 3 } : {}}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/events/${event.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                {event.title}
              </Link>
              {event.locationName && (
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{event.locationName}</span>
                </p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                {duration && <span>{duration}</span>}
                {event.price && <span>{event.price}</span>}
                {event.categoryName && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: event.categoryColor || '#6366f1' }}
                  >
                    {event.categoryName}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onRemove}
              title="Remove from itinerary"
              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  const { items, removeEvent, clearAll, count } = useItinerary()

  const grouped = groupByDate(items)
  const dates = Object.keys(grouped).sort()

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🗓️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Itinerary is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Browse events and click the <strong>+</strong> button on any event card to add it to your day plan. Your itinerary is saved in your browser.
        </p>
        <Link
          href="/events"
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-block"
        >
          Browse Events
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Itinerary</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count} event{count !== 1 ? 's' : ''} planned</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="text-sm text-orange-600 hover:underline font-medium"
          >
            + Add more events
          </Link>
          <button
            onClick={clearAll}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Timeline by date */}
      <div className="space-y-8">
        {dates.map((date) => {
          const dayEvents = grouped[date]
          const dateObj = new Date(date + 'T00:00:00')
          const dayLabel = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })

          return (
            <section key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-600 text-white rounded-lg px-3 py-1 text-sm font-semibold">
                  {dayLabel}
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div>
                {dayEvents.map((event) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    onRemove={() => removeEvent(event.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Share / Print */}
      <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print itinerary
        </button>
      </div>
    </div>
  )
}
