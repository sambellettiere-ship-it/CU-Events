export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { sales } from '../../../drizzle/schema'
import { eq, gte, and } from 'drizzle-orm'

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

function formatSaleDate(start: string, end?: string | null) {
  const startDate = new Date(start.replace(' ', 'T'))
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
  const startStr = startDate.toLocaleDateString('en-US', opts)
  if (!end) return startStr
  const endDate = new Date(end.replace(' ', 'T'))
  const sameDay = startDate.toDateString() === endDate.toDateString()
  if (sameDay) {
    return `${startStr} – ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }
  return `${startStr} – ${endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
}

async function getSales() {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return db
    .select()
    .from(sales)
    .where(and(eq(sales.isApproved, 1), gte(sales.startDatetime, now)))
    .orderBy(sales.startDatetime)
    .limit(100)
}

export default async function SalesPage() {
  const allSales = await getSales()

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-kf-deep via-kf-teal to-kf-orange text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Garage &amp; Estate Sales
          </h1>
          <p className="text-kf-sky text-lg mb-6 max-w-xl">
            Find garage sales, estate sales, moving sales, and more happening around Champaign-Urbana.
          </p>
          <Link
            href="/sales/submit"
            className="inline-block bg-kf-orange hover:bg-kf-rust text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Post a Sale
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter pills */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
          {(['garage', 'estate', 'yard', 'moving', 'church'] as const).map((type) => (
            <span
              key={type}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: SALE_COLORS[type] }}
              />
              {SALE_LABELS[type]}
            </span>
          ))}
        </div>

        {allSales.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏷️</p>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No sales listed yet</h2>
            <p className="mb-6">Be the first to post a garage or estate sale in the CU area.</p>
            <Link
              href="/sales/submit"
              className="bg-kf-orange hover:bg-kf-rust text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-block"
            >
              Post a Sale
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allSales.map((sale) => (
              <Link key={sale.id} href={`/sales/${sale.id}`} className="group block">
                <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-kf-sky transition-all duration-200 overflow-hidden">
                  {sale.imageUrl && (
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <img
                        src={sale.imageUrl}
                        alt={sale.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: SALE_COLORS[sale.type] || '#045668' }}
                      >
                        {SALE_LABELS[sale.type] || sale.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-kf-teal transition-colors line-clamp-1 mb-1">
                      {sale.title}
                    </h3>
                    {sale.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{sale.description}</p>
                    )}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatSaleDate(sale.startDatetime, sale.endDatetime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{sale.address}, {sale.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
