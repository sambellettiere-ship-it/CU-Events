import { db } from '@/lib/db'
import { events, businesses, users, sales } from '../../../drizzle/schema'
import { eq, count } from 'drizzle-orm'
import Link from 'next/link'

export default async function AdminPage() {
  const [
    [{ totalEvents }],
    [{ totalBusinesses }],
    [{ totalUsers }],
    [{ pendingEvents }],
    [{ totalSales }],
  ] = await Promise.all([
    db.select({ totalEvents: count() }).from(events),
    db.select({ totalBusinesses: count() }).from(businesses),
    db.select({ totalUsers: count() }).from(users),
    db.select({ pendingEvents: count() }).from(events).where(eq(events.isApproved, 0)),
    db.select({ totalSales: count() }).from(sales),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Events</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalBusinesses}</p>
          <p className="text-xs text-gray-500 mt-0.5">Businesses</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          <p className="text-xs text-gray-500 mt-0.5">Community Users</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{pendingEvents}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Approval</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sales Listings</p>
        </div>
      </div>

      {/* Pending approval callout */}
      {pendingEvents > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-yellow-900">{pendingEvents} event{pendingEvents !== 1 ? 's' : ''} waiting for approval</p>
              <p className="text-sm text-yellow-700">Review and approve community submissions to publish them.</p>
            </div>
          </div>
          <Link href="/admin/events?filter=pending" className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0">
            Review Now
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/events" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200 transition-colors">
          <h2 className="font-semibold text-gray-900 mb-1">Manage Events</h2>
          <p className="text-sm text-gray-500">Approve, reject, or feature community and business events</p>
        </Link>
        <Link href="/admin/businesses" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-colors">
          <h2 className="font-semibold text-gray-900 mb-1">Businesses</h2>
          <p className="text-sm text-gray-500">View and manage registered business accounts and verification</p>
        </Link>
        <Link href="/admin/sales" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-200 transition-colors">
          <h2 className="font-semibold text-gray-900 mb-1">Sales Listings</h2>
          <p className="text-sm text-gray-500">Manage garage, estate, and yard sale submissions</p>
        </Link>
      </div>
    </div>
  )
}
