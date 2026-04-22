import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { events, categories } from '../../../drizzle/schema'
import { eq, gte, desc, or, and } from 'drizzle-orm'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sponsored?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const params = await searchParams
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const isBusiness = session.accountType === 'business'

  // Fetch events belonging to this user/business
  const myEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startDatetime: events.startDatetime,
      locationName: events.locationName,
      city: events.city,
      price: events.price,
      isFeatured: events.isFeatured,
      featuredUntil: events.featuredUntil,
      isApproved: events.isApproved,
      viewCount: events.viewCount,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .where(
      isBusiness
        ? eq(events.businessId, session.businessId!)
        : eq(events.submittedByUserId, session.id)
    )
    .orderBy(desc(events.startDatetime))

  const upcomingCount = myEvents.filter((e) => e.startDatetime >= now).length
  const pendingCount = myEvents.filter((e) => !e.isApproved).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {session.name}</p>
        </div>
        <Link
          href={isBusiness ? '/dashboard/events/new' : '/submit'}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + Submit Event
        </Link>
      </div>

      {params.sponsored === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
          <strong>Success!</strong> Your sponsored listing is now active.
        </div>
      )}

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
          <strong>{pendingCount} event{pendingCount !== 1 ? 's' : ''} pending review.</strong> Our team will approve your submission within 24 hours.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Submitted</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">{upcomingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Upcoming</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">
            {isBusiness ? myEvents.filter((e) => e.isFeatured).length : pendingCount}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{isBusiness ? 'Sponsored' : 'Pending'}</p>
        </div>
      </div>

      {/* Events table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Your Submissions</h2>
        </div>

        {myEvents.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium mb-1">No events yet</p>
            <p className="text-sm mb-4">Submit your first event to get started</p>
            <Link
              href={isBusiness ? '/dashboard/events/new' : '/submit'}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              Submit Event
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myEvents.map((event) => (
              <div key={event.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
                    {event.isFeatured ? (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Sponsored
                      </span>
                    ) : null}
                    {!event.isApproved ? (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Pending
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(event.startDatetime)} · {formatTime(event.startDatetime)}
                    {event.locationName ? ` · ${event.locationName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{event.viewCount} views</span>
                  {event.isApproved ? (
                    <Link
                      href={`/events/${event.id}`}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      View
                    </Link>
                  ) : null}
                  {isBusiness && (
                    <Link
                      href={`/dashboard/events/${event.id}/edit`}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
