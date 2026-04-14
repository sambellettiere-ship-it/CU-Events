'use client'

import dynamic from 'next/dynamic'

const EventMap = dynamic(() => import('./EventMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
      <p className="text-gray-500 text-sm">Loading map…</p>
    </div>
  ),
})

interface MapEvent {
  id: number
  title: string
  startDatetime: string
  locationName?: string | null
  city?: string | null
  latitude: number
  longitude: number
  price?: string | null
  isFeatured?: number | null
  categoryName?: string | null
  categoryColor?: string | null
}

interface Props {
  events: MapEvent[]
  center?: [number, number]
  zoom?: number
}

export default function EventMapClient(props: Props) {
  return <EventMap {...props} />
}
