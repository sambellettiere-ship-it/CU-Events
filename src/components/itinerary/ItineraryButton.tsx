'use client'

import { useItinerary, ItineraryEvent } from '@/lib/itinerary-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  event: ItineraryEvent
  variant?: 'icon' | 'full'
}

export default function ItineraryButton({ event, variant = 'icon' }: Props) {
  const { addEvent, removeEvent, hasEvent, isAuthenticated, isLoading } = useItinerary()
  const router = useRouter()
  const [flash, setFlash] = useState(false)
  const inItinerary = hasEvent(event.id)

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      router.push('/auth/login?from=/itinerary')
      return
    }
    if (inItinerary) {
      removeEvent(event.id)
    } else {
      addEvent(event)
      setFlash(true)
      setTimeout(() => setFlash(false), 1200)
    }
  }

  if (variant === 'full') {
    if (!isAuthenticated && !isLoading) {
      return (
        <a
          href="/auth/login?from=/itinerary"
          onClick={(e) => e.stopPropagation()}
          className="w-full flex items-center justify-center gap-2 border font-medium text-sm py-3 rounded-xl transition-colors bg-white border-gray-200 text-gray-500 hover:border-kf-aqua hover:text-kf-teal"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Sign in to save to itinerary
        </a>
      )
    }

    return (
      <button
        onClick={toggle}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 border font-medium text-sm py-3 rounded-xl transition-colors ${
          inItinerary
            ? 'bg-kf-cream border-kf-aqua text-kf-teal hover:bg-kf-cream/80'
            : 'bg-white border-gray-200 text-gray-700 hover:border-kf-aqua hover:bg-kf-cream'
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
      disabled={isLoading}
      title={
        !isAuthenticated
          ? 'Sign in to save to itinerary'
          : inItinerary
          ? 'Remove from itinerary'
          : 'Add to itinerary'
      }
      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-colors ${
        inItinerary
          ? 'bg-kf-aqua border-kf-aqua text-white hover:bg-kf-teal'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-kf-cream hover:border-kf-aqua hover:text-kf-teal'
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
