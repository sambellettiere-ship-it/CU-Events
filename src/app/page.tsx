import Link from 'next/link'
import { db } from '@/lib/db'
import { events, categories } from '../../drizzle/schema'
import { eq, and, gte, desc, asc } from 'drizzle-orm'
import EventCard from '@/components/events/EventCard'

async function getFeaturedEvents() {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return db
    .select({
      id: events.id,
      title: events.title,
      shortDescription: events.shortDescription,
      startDatetime: events.startDatetime,
      locationName: events.locationName,
      city: events.city,
      price: events.price,
      imageUrl: events.imageUrl,
      isFeatured: events.isFeatured,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .where(and(eq(events.isApproved, 1), eq(events.isFeatured, 1), gte(events.startDatetime, now)))
    .orderBy(asc(events.startDatetime))
    .limit(3)
}

async function getUpcomingEvents() {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  return db
    .select({
      id: events.id,
      title: events.title,
      shortDescription: events.shortDescription,
      startDatetime: events.startDatetime,
      locationName: events.locationName,
      city: events.city,
      price: events.price,
      imageUrl: events.imageUrl,
      isFeatured: events.isFeatured,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .where(and(eq(events.isApproved, 1), gte(events.startDatetime, now)))
    .orderBy(desc(events.isFeatured), asc(events.startDatetime))
    .limit(9)
}

async function getAllCategories() {
  return db.select().from(categories).orderBy(categories.name)
}

const CATEGORY_ICONS: Record<string, string> = {
  music: '🎵',
  'arts-culture': '🎨',
  'sports-fitness': '🏆',
  'food-drink': '🍕',
  community: '👥',
  education: '📚',
  outdoors: '🌳',
  nightlife: '🌙',
  family: '❤️',
  tech: '💻',
}

export default async function HomePage() {
  const [featured, upcoming, cats] = await Promise.all([
    getFeaturedEvents(),
    getUpcomingEvents(),
    getAllCategories(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-orange-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            What&apos;s Happening in<br />
            <span className="text-orange-300">Champaign-Urbana</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl mx-auto">
            Your master calendar for CU area events — concerts, festivals, sports, food, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/events"
              className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg"
            >
              Browse Events
            </Link>
            <Link
              href="/map"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl border border-white/30 transition-colors text-lg"
            >
              View Map
            </Link>
          </div>
        </div>
      </section>

      {/* Category quick-links */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <Link
              href="/events"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm font-medium text-gray-700 transition-colors"
            >
              All Events
            </Link>
            {cats.map((cat) => (
              <Link
                key={cat.id}
                href={`/events?category=${cat.slug}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm font-medium text-gray-700 transition-colors"
              >
                <span>{CATEGORY_ICONS[cat.slug] || '📅'}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured / Sponsored Events */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Featured Events</h2>
                <p className="text-sm text-gray-500">Promoted by local businesses</p>
              </div>
              <Link href="/events?featured=true" className="text-sm text-orange-600 hover:underline font-medium">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            <Link href="/events" className="text-sm text-orange-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📅</p>
              <p>No upcoming events yet.</p>
            </div>
          )}
        </section>

        {/* Business CTA */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Host events in Champaign-Urbana?</h2>
          <p className="text-blue-200 mb-6">
            Register your business to post events, reach thousands of locals, and boost visibility with sponsored listings.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/auth/register"
              className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Register Your Business
            </Link>
            <Link
              href="/dashboard/billing"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Learn About Sponsored Listings
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
