'use client'

import { useState, useEffect } from 'react'
import { SPONSORED_TIERS } from '@/lib/stripe'

interface MyEvent {
  id: number
  title: string
  startDatetime: string
  isFeatured: number | null
  featuredUntil: string | null
}

export default function BillingPage() {
  const [events, setEvents] = useState<MyEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [selectedDays, setSelectedDays] = useState<number>(30)
  const [loading, setLoading] = useState(false)
  const [fetchingEvents, setFetchingEvents] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.id) {
          return fetch(`/api/events?businessId=${d.user.id}&limit=100`)
            .then((r) => r.json())
            .then((data) => setEvents(data.events || []))
        }
      })
      .finally(() => setFetchingEvents(false))
  }, [])

  async function handlePurchase() {
    if (!selectedEventId) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId, durationDays: selectedDays }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create checkout session')
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedTier = SPONSORED_TIERS.find((t) => t.days === selectedDays)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sponsored Listings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Boost your event visibility with featured placement
        </p>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-blue-900 mb-2">How Sponsored Listings Work</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Your event appears at the top of all event lists</li>
          <li>✓ Highlighted with a &ldquo;Sponsored&rdquo; badge</li>
          <li>✓ Featured on the home page hero section</li>
          <li>✓ Orange map markers for higher visibility</li>
        </ul>
      </div>

      {/* Tier selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {SPONSORED_TIERS.map((tier) => (
            <button
              key={tier.days}
              onClick={() => setSelectedDays(tier.days)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                selectedDays === tier.days
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {tier.days === 30 && (
                <span className="absolute -top-2 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <p className="font-bold text-gray-900 text-lg">{tier.label}</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ${(tier.price / 100).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
            </button>
          ))}
        </div>

        {/* Event picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Event to Promote
          </label>
          {fetchingEvents ? (
            <p className="text-sm text-gray-400">Loading your events…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">
              No events found.{' '}
              <a href="/dashboard/events/new" className="text-orange-600 underline">
                Create one first.
              </a>
            </p>
          ) : (
            <select
              value={selectedEventId ?? ''}
              onChange={(e) => setSelectedEventId(Number(e.target.value) || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">Choose an event…</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                  {event.isFeatured ? ' (Already Sponsored)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handlePurchase}
          disabled={!selectedEventId || loading}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading
            ? 'Redirecting to payment…'
            : `Sponsor for ${selectedTier?.label} – $${((selectedTier?.price || 0) / 100).toFixed(0)}`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Secure payment via Stripe. Cancel anytime before the listing expires.
        </p>
      </div>
    </div>
  )
}
