'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface ItineraryEvent {
  id: number
  title: string
  startDatetime: string
  endDatetime?: string | null
  locationName?: string | null
  address?: string | null
  city?: string | null
  price?: string | null
  categoryName?: string | null
  categoryColor?: string | null
}

interface ItineraryContextValue {
  items: ItineraryEvent[]
  addEvent: (event: ItineraryEvent) => void
  removeEvent: (id: number) => void
  hasEvent: (id: number) => boolean
  clearAll: () => void
  count: number
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null)

const STORAGE_KEY = 'cu-events-itinerary'

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItineraryEvent[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addEvent = useCallback((event: ItineraryEvent) => {
    setItems((prev) => {
      if (prev.some((e) => e.id === event.id)) return prev
      return [...prev, event]
    })
  }, [])

  const removeEvent = useCallback((id: number) => {
    setItems((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const hasEvent = useCallback(
    (id: number) => items.some((e) => e.id === id),
    [items]
  )

  const clearAll = useCallback(() => setItems([]), [])

  return (
    <ItineraryContext.Provider
      value={{ items, addEvent, removeEvent, hasEvent, clearAll, count: items.length }}
    >
      {children}
    </ItineraryContext.Provider>
  )
}

export function useItinerary() {
  const ctx = useContext(ItineraryContext)
  if (!ctx) throw new Error('useItinerary must be used within ItineraryProvider')
  return ctx
}
