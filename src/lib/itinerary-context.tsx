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
  isAuthenticated: boolean
  isLoading: boolean
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null)

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItineraryEvent[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user && data.user.accountType === 'user') {
          setIsAuthenticated(true)
          const itinRes = await fetch('/api/itinerary')
          if (itinRes.ok) {
            const itinData = await itinRes.json()
            setItems(itinData.items || [])
          }
        }
      } catch {}
      setIsLoading(false)
    }
    init()
  }, [])

  const addEvent = useCallback(
    (event: ItineraryEvent) => {
      if (!isAuthenticated) return
      if (items.some((e) => e.id === event.id)) return
      setItems((prev) => [...prev, event])
      fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      }).catch(() => {
        setItems((prev) => prev.filter((e) => e.id !== event.id))
      })
    },
    [isAuthenticated, items]
  )

  const removeEvent = useCallback(
    (id: number) => {
      if (!isAuthenticated) return
      setItems((prev) => prev.filter((e) => e.id !== id))
      fetch(`/api/itinerary/${id}`, { method: 'DELETE' }).catch(async () => {
        const res = await fetch('/api/itinerary')
        if (res.ok) setItems((await res.json()).items || [])
      })
    },
    [isAuthenticated]
  )

  const hasEvent = useCallback(
    (id: number) => items.some((e) => e.id === id),
    [items]
  )

  const clearAll = useCallback(() => {
    if (!isAuthenticated) return
    setItems([])
    fetch('/api/itinerary', { method: 'DELETE' }).catch(async () => {
      const res = await fetch('/api/itinerary')
      if (res.ok) setItems((await res.json()).items || [])
    })
  }, [isAuthenticated])

  return (
    <ItineraryContext.Provider
      value={{
        items,
        addEvent,
        removeEvent,
        hasEvent,
        clearAll,
        count: items.length,
        isAuthenticated,
        isLoading,
      }}
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
