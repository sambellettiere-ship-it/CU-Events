'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'

// Fix default marker icon issue with Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const featuredIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

export default function EventMap({ events, center = [40.1106, -88.2073], zoom = 12 }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={event.isFeatured ? featuredIcon : defaultIcon}
        >
          <Popup>
            <div className="min-w-[200px]">
              {event.isFeatured ? (
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mb-1 inline-block">
                  ★ Sponsored
                </span>
              ) : null}
              {event.categoryName && (
                <span
                  className="text-xs font-medium text-white px-1.5 py-0.5 rounded ml-1 mb-1 inline-block"
                  style={{ backgroundColor: event.categoryColor || '#6366f1' }}
                >
                  {event.categoryName}
                </span>
              )}
              <h3 className="font-semibold text-sm text-gray-900 mb-1 mt-1">{event.title}</h3>
              <p className="text-xs text-gray-500 mb-0.5">
                {formatDate(event.startDatetime)} at {formatTime(event.startDatetime)}
              </p>
              {event.locationName && (
                <p className="text-xs text-gray-500 mb-1">
                  {event.locationName}
                  {event.city ? `, ${event.city}` : ''}
                </p>
              )}
              {event.price && (
                <p className="text-xs font-medium text-gray-700 mb-2">{event.price}</p>
              )}
              <Link
                href={`/events/${event.id}`}
                className="text-xs font-medium text-orange-600 hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
