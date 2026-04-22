'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SaleFormData {
  title: string
  type: string
  description: string
  address: string
  city: string
  startDatetime: string
  endDatetime: string
  contactName: string
  contactPhone: string
  contactEmail: string
  imageUrl: string
}

export default function SubmitSalePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number } | null | undefined>(undefined)
  const [form, setForm] = useState<SaleFormData>({
    title: '',
    type: 'garage',
    description: '',
    address: '',
    city: 'Champaign',
    startDatetime: '',
    endDatetime: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    imageUrl: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
  }, [])

  function setField(field: keyof SaleFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        endDatetime: form.endDatetime || undefined,
        contactEmail: form.contactEmail || undefined,
        imageUrl: form.imageUrl || undefined,
        contactName: form.contactName || undefined,
        contactPhone: form.contactPhone || undefined,
        description: form.description || undefined,
      }
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to post sale')
        return
      }
      router.push(`/sales/${data.sale.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (user === undefined) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3 animate-pulse">⏳</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🏷️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Post a Sale</h1>
        <p className="text-gray-500 mb-8">
          You need a free account to list garage and estate sales.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/login?from=/sales/submit"
            className="bg-kf-orange hover:bg-kf-rust text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register/user?from=/sales/submit"
            className="border border-gray-200 hover:border-kf-aqua text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kf-teal'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link href="/sales" className="text-sm text-kf-teal hover:underline">
          ← Back to Sales
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a Sale</h1>
      <p className="text-gray-500 text-sm mb-8">
        List your garage, estate, or yard sale so locals in the CU area can find it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Sale Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Sale Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={inputClass}
              placeholder='e.g. "Moving Sale – Everything Must Go!"'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
              className={`${inputClass} bg-white`}
            >
              <option value="garage">Garage Sale</option>
              <option value="estate">Estate Sale</option>
              <option value="yard">Yard Sale</option>
              <option value="moving">Moving Sale</option>
              <option value="church">Church Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="What's for sale? Furniture, tools, clothes, antiques…"
            />
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
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                type="datetime-local"
                value={form.endDatetime}
                onChange={(e) => setField('endDatetime', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              className={inputClass}
              placeholder="123 Main St"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              className={`${inputClass} bg-white`}
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

        {/* Contact Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            Contact Info <span className="text-gray-400 font-normal text-sm">(optional)</span>
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => setField('contactName', e.target.value)}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setField('contactPhone', e.target.value)}
                className={inputClass}
                placeholder="(217) 555-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setField('contactEmail', e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setField('imageUrl', e.target.value)}
              className={inputClass}
              placeholder="https://yourimage.com/sale.jpg"
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-kf-orange hover:bg-kf-rust disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            {loading ? 'Posting…' : 'Post Sale'}
          </button>
          <Link href="/sales" className="text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
