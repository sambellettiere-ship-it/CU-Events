import { db } from '@/lib/db'
import { events, categories, businesses } from '../../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'
import AdminEventsTable from './AdminEventsTable'

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams

  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startDatetime: events.startDatetime,
      source: events.source,
      isApproved: events.isApproved,
      isFeatured: events.isFeatured,
      viewCount: events.viewCount,
      categoryName: categories.name,
      businessName: businesses.name,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .leftJoin(businesses, eq(events.businessId, businesses.id))
    .orderBy(desc(events.isApproved), desc(events.createdAt))
    .limit(200)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Events</h1>
      <AdminEventsTable events={allEvents} filter={filter} />
    </div>
  )
}
