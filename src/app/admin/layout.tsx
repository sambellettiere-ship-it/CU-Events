import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="sm:w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
            <div className="mb-3 pb-3 border-b border-gray-100">
              <p className="text-xs text-purple-700 font-bold uppercase tracking-wide">Admin Panel</p>
            </div>
            <nav className="space-y-1">
              <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/events" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 transition-colors">
                Manage Events
              </Link>
              <Link href="/admin/businesses" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 transition-colors">
                Businesses
              </Link>
              <Link href="/admin/sales" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 transition-colors">
                Sales
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors mt-4 border-t border-gray-100 pt-4">
                ← Back to Dashboard
              </Link>
            </nav>
          </div>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
