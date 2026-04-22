import { db } from '@/lib/db'
import { businesses, events } from '../../../../drizzle/schema'
import { eq, count, desc } from 'drizzle-orm'
import AdminBusinessesTable from './AdminBusinessesTable'

export default async function AdminBusinessesPage() {
  const rows = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      email: businesses.email,
      website: businesses.website,
      phone: businesses.phone,
      isVerified: businesses.isVerified,
      createdAt: businesses.createdAt,
    })
    .from(businesses)
    .orderBy(desc(businesses.createdAt))

  const eventCounts = await db
    .select({ businessId: events.businessId, eventCount: count() })
    .from(events)
    .groupBy(events.businessId)

  const countMap = new Map(eventCounts.map((r) => [r.businessId, r.eventCount]))

  const businessesWithCounts = rows.map((b) => ({
    ...b,
    eventCount: countMap.get(b.id) ?? 0,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Businesses</h1>
      <AdminBusinessesTable businesses={businessesWithCounts} />
    </div>
  )
}
