import Link from 'next/link'
import { db } from '@/lib/db'
import { sales } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

const SALE_LABELS: Record<string, string> = {
  garage: 'Garage Sale',
  estate: 'Estate Sale',
  yard: 'Yard Sale',
  moving: 'Moving Sale',
  church: 'Church Sale',
}

const SALE_COLORS: Record<string, string> = {
  garage: '#f6861f',
  estate: '#045668',
  yard: '#10b981',
  moving: '#8b5cf6',
  church: '#ec4899',
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [sale] = await db.select().from(sales).where(eq(sales.id, parseInt(id)))
  if (!sale) notFound()

  const startDate = new Date(sale.startDatetime.replace(' ', 'T'))
  const endDate = sale.endDatetime ? new Date(sale.endDatetime.replace(' ', 'T')) : null

  const dateLabel = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeLabel = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  const endTimeLabel = endDate
    ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${sale.address}, ${sale.city}, IL`)}`

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <Link href="/sales" className="text-sm text-kf-teal hover:underline">
          ← Back to Sales
        </Link>
      </div>

      {sale.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-6 h-64">
          <img src={sale.imageUrl} alt={sale.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: SALE_COLORS[sale.type] || '#045668' }}
        >
          {SALE_LABELS[sale.type] || sale.type}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{sale.title}</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 mb-6">
        {/* Date & Time */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-kf-cream flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-kf-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{dateLabel}</p>
            <p className="text-sm text-gray-500">
              {timeLabel}{endTimeLabel ? ` – ${endTimeLabel}` : ''}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-kf-cream flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-kf-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{sale.address}</p>
            <p className="text-sm text-gray-500">{sale.city}, IL</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-kf-teal hover:underline mt-0.5 inline-block"
            >
              Get directions →
            </a>
          </div>
        </div>

        {/* Contact */}
        {(sale.contactName || sale.contactPhone || sale.contactEmail) && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-kf-cream flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-kf-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              {sale.contactName && <p className="font-semibold text-gray-900">{sale.contactName}</p>}
              {sale.contactPhone && (
                <a href={`tel:${sale.contactPhone}`} className="text-sm text-kf-teal hover:underline block">
                  {sale.contactPhone}
                </a>
              )}
              {sale.contactEmail && (
                <a href={`mailto:${sale.contactEmail}`} className="text-sm text-kf-teal hover:underline block">
                  {sale.contactEmail}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {sale.description && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">About This Sale</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{sale.description}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/sales"
          className="border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          ← All Sales
        </Link>
        <Link
          href="/sales/submit"
          className="bg-kf-orange hover:bg-kf-rust text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Post Your Sale
        </Link>
      </div>
    </div>
  )
}
