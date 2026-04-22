'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface EventRow {
  id: number
  title: string
  startDatetime: string
  source: string
  isApproved: number | null
  isFeatured: number | null
  viewCount: number | null
  categoryName: string | null
  businessName: string | null
}

export default function AdminEventsTable({
  events: initialEvents,
  filter,
}: {
  events: EventRow[]
  filter?: string
}) {
  const [eventsData, setEventsData] = useState(initialEvents)
  const [activeFilter, setActiveFilter] = useState(filter || 'all')

  const displayed = eventsData.filter((e) => {
    if (activeFilter === 'pending') return !e.isApproved
    if (activeFilter === 'approved') return e.isApproved
    return true
  })

  async function toggleApproval(id: number, current: number | null) {
    const newVal = current ? 0 : 1
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: newVal }),
    })
    if (res.ok) {
      setEventsData((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isApproved: newVal } : e))
      )
    }
  }

  async function toggleFeatured(id: number, current: number | null) {
    const newVal = current ? 0 : 1
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: newVal }),
    })
    if (res.ok) {
      setEventsData((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isFeatured: newVal } : e))
      )
    }
  }

  async function deleteEvent(id: number) {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEventsData((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const pendingCount = eventsData.filter((e) => !e.isApproved).length

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f
                ? 'bg-orange-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-200'
            }`}
          >
            {f === 'all' ? `All (${eventsData.length})` : f === 'pending' ? `Pending (${pendingCount})` : `Approved (${eventsData.length - pendingCount})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Views</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Approved</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Featured</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No events to show
                  </td>
                </tr>
              ) : (
                displayed.map((event) => (
                  <tr
                    key={event.id}
                    className={`hover:bg-gray-50 transition-colors ${!event.isApproved ? 'bg-yellow-50/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">{event.title}</p>
                        <p className="text-xs text-gray-400">
                          {event.businessName || event.categoryName || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(event.startDatetime)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        event.source === 'business'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {event.source === 'business' ? 'Business' : 'Community'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{event.viewCount ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleApproval(event.id, event.isApproved)}
                        className={`w-8 h-5 rounded-full transition-colors ${
                          event.isApproved ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full shadow mx-auto transition-transform ${event.isApproved ? 'translate-x-1.5' : '-translate-x-1.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(event.id, event.isFeatured)}
                        className={`w-8 h-5 rounded-full transition-colors ${
                          event.isFeatured ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full shadow mx-auto transition-transform ${event.isFeatured ? 'translate-x-1.5' : '-translate-x-1.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/events/${event.id}`} className="text-xs text-gray-500 hover:text-gray-700">View</Link>
                        <button onClick={() => deleteEvent(event.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
