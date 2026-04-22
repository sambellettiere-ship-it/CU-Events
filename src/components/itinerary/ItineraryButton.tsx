'use client'

import { useItinerary, ItineraryEvent } from '@/lib/itinerary-context'
import { useState } from 'react'

interface Props {
  event: ItineraryEvent
  variant?: 'icon' | 'full'
}

export default function ItineraryButton({ event, variant = 'icon' }: Props) {
  const { addEvent, removeEvent, hasEvent } = useItinerary()
  const [flash, setFlash] = useState(false)
  const inItinerary = hasEvent(event.id)

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (inItinerary) {
      removeEvent(event.id)
    } else {
      addEvent(event)
      setFlash(true)
      setTimeout(() => setFlash(false), 1200)
    }
  }

  if (variant === 'full') {
    return (
      <button
        onClick={toggle}
        className={`w-full flex items-center justify-center gap-2 border font-medium text-sm py-3 rounded-xl transition-colors ${
          inItinerary
            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100'
            : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
        }`}
      >
        <svg className="w-4 h-4" fill={inItinerary ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {inItinerary ? 'In Your Itinerary' : flash ? 'Added!' : 'Add to Itinerary'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      title={inItinerary ? 'Remove from itinerary' : 'Add to itinerary'}
      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-colors ${
        inItinerary
          ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
      }`}
    >
      {inItinerary ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  )
}
