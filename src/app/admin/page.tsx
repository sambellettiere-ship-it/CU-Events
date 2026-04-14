import { db } from '@/lib/db'
import { events, businesses, scraperRuns } from '../../../drizzle/schema'
import { eq, count, desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function AdminPage() {
  const [
    [{ totalEvents }],
    [{ totalBusinesses }],
    [{ pendingEvents }],
    recentRuns,
  ] = await Promise.all([
    db.select({ totalEvents: count() }).from(events),
    db.select({ totalBusinesses: count() }).from(businesses),
    db.select({ pendingEvents: count() }).from(events).where(eq(events.isApproved, 0)),
    db.select().from(scraperRuns).orderBy(desc(scraperRuns.startedAt)).limit(5),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Events</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalBusinesses}</p>
          <p className="text-xs text-gray-500 mt-0.5">Businesses</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{pendingEvents}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Approval</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-purple-600">{recentRuns.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Recent Scraper Runs</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/events" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200 transition-colors">
          <h2 className="font-semibold text-gray-900 mb-1">Manage Events</h2>
          <p className="text-sm text-gray-500">Approve, reject, or feature events from businesses and scrapers</p>
        </Link>
        <Link href="/admin/scrapers" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-200 transition-colors">
          <h2 className="font-semibold text-gray-900 mb-1">Scrapers</h2>
          <p className="text-sm text-gray-500">View scraper history and trigger manual runs</p>
        </Link>
      </div>

      {/* Recent scraper runs */}
      {recentRuns.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Scraper Runs</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRuns.map((run) => (
              <div key={run.id} className="px-5 py-3 flex items-center gap-4">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    run.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : run.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {run.status}
                </span>
                <span className="text-sm font-medium text-gray-900">{run.scraperName}</span>
                <span className="text-xs text-gray-400 ml-auto">{run.startedAt}</span>
                <span className="text-xs text-gray-500">+{run.eventsInserted} new</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
