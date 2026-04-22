'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
  slug: string
}

interface EventFormData {
  title: string
  description: string
  startDatetime: string
  endDatetime: string
  locationName: string
  address: string
  city: string
  price: string
  imageUrl: string
  ticketUrl: string
  url: string
  categoryId: number | ''
}

interface Props {
  initialData?: Partial<EventFormData>
  eventId?: number
  mode: 'create' | 'edit'
  redirectTo?: string
}

export default function EventForm({ initialData, eventId, mode, redirectTo = '/dashboard' }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<EventFormData>({
    title: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    locationName: '',
    address: '',
    city: 'Champaign',
    price: '',
    imageUrl: '',
    ticketUrl: '',
    url: '',
    categoryId: '',
    ...initialData,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
  }, [])

  function setField(field: keyof EventFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function geocodeAddress() {
    if (!form.address) return
    setGeocoding(true)
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: `${form.address}, ${form.city || 'Champaign'}, IL` }),
      })
      if (res.ok) {
        // Geocode succeeded - coordinates are stored server-side on submit
      }
    } finally {
      setGeocoding(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        endDatetime: form.endDatetime || undefined,
        url: form.url || undefined,
        imageUrl: form.imageUrl || undefined,
        ticketUrl: form.ticketUrl || undefined,
      }

      const url = mode === 'edit' ? `/api/events/${eventId}` : '/api/events'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to save event')
        return
      }

      // Try to geocode in background after saving
      if (form.address) {
        fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: `${form.address}, ${form.city || 'Champaign'}, IL` }),
        })
          .then((r) => r.json())
          .then(async (geo) => {
            if (geo.lat && geo.lng) {
              const savedId = data.event?.id || eventId
              if (savedId) {
                await fetch(`/api/events/${savedId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ latitude: geo.lat, longitude: geo.lng }),
                })
              }
            }
          })
          .catch(() => {})
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Event Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Give your event a clear, descriptive title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Tell people what your event is about…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setField('categoryId', e.target.value ? Number(e.target.value) : '')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Date & Time */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Date & Time</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={form.startDatetime}
              onChange={(e) => setField('startDatetime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
            <input
              type="datetime-local"
              value={form.endDatetime}
              onChange={(e) => setField('endDatetime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Location</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
          <input
            type="text"
            value={form.locationName}
            onChange={(e) => setField('locationName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g. Krannert Center, Lincoln Square Mall"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            onBlur={geocodeAddress}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="123 Main St"
          />
          {geocoding && <p className="text-xs text-gray-400 mt-1">Looking up location…</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <select
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option>Champaign</option>
            <option>Urbana</option>
            <option>Savoy</option>
            <option>Rantoul</option>
            <option>Mahomet</option>
            <option>Monticello</option>
            <option>Other</option>
          </select>
        </div>
      </section>

      {/* Pricing & Links */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Pricing & Links</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="text"
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder='e.g. "Free", "$10", "$10–$25"'
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ticket URL</label>
          <input
            type="url"
            value={form.ticketUrl}
            onChange={(e) => setField('ticketUrl', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://tickets.example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Website</label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => setField('url', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://yourevent.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Image URL</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setField('imageUrl', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://yourimage.com/event.jpg"
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {loading ? 'Saving…' : mode === 'create' ? 'Create Event' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
