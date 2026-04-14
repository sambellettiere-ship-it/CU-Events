import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { categories, businesses, events } from './schema'
import bcrypt from 'bcryptjs'
import path from 'path'

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'cu-events.db')
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite, { schema: { categories, businesses, events } })

// Run migrations first
migrate(db as Parameters<typeof migrate>[0], { migrationsFolder: './drizzle/migrations' })

async function seed() {
  console.log('Seeding categories...')
  const cats = await db
    .insert(categories)
    .values([
      { name: 'Music', slug: 'music', color: '#ec4899', iconName: 'music' },
      { name: 'Arts & Culture', slug: 'arts-culture', color: '#8b5cf6', iconName: 'palette' },
      { name: 'Sports & Fitness', slug: 'sports-fitness', color: '#10b981', iconName: 'trophy' },
      { name: 'Food & Drink', slug: 'food-drink', color: '#f59e0b', iconName: 'utensils' },
      { name: 'Community', slug: 'community', color: '#3b82f6', iconName: 'users' },
      { name: 'Education', slug: 'education', color: '#6366f1', iconName: 'book' },
      { name: 'Outdoors', slug: 'outdoors', color: '#14b8a6', iconName: 'tree' },
      { name: 'Nightlife', slug: 'nightlife', color: '#f43f5e', iconName: 'moon' },
      { name: 'Family', slug: 'family', color: '#fb923c', iconName: 'heart' },
      { name: 'Tech', slug: 'tech', color: '#0ea5e9', iconName: 'cpu' },
    ])
    .onConflictDoNothing()
    .returning()
  console.log(`Inserted ${cats.length} categories`)

  console.log('Seeding admin user...')
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
  const [admin] = await db
    .insert(businesses)
    .values({
      name: 'CU Events Admin',
      email: process.env.ADMIN_EMAIL || 'admin@cu-events.com',
      passwordHash: adminPassword,
      role: 'admin',
      isVerified: 1,
    })
    .onConflictDoNothing()
    .returning()
  console.log('Admin:', admin?.email || 'already exists')

  console.log('Seeding demo business...')
  const demoPassword = await bcrypt.hash('demo123', 10)
  const [demoBusiness] = await db
    .insert(businesses)
    .values({
      name: 'Krannert Center for the Performing Arts',
      email: 'demo@krannert.illinois.edu',
      passwordHash: demoPassword,
      website: 'https://krannertcenter.com',
      phone: '(217) 333-6280',
      description: 'Premier performing arts center at the University of Illinois.',
      isVerified: 1,
    })
    .onConflictDoNothing()
    .returning()

  // Get category IDs
  const allCats = await db.select().from(categories)
  const getCatId = (slug: string) => allCats.find(c => c.slug === slug)?.id ?? 1

  console.log('Seeding sample events...')
  const now = new Date()
  const sampleEvents = [
    {
      title: 'Illini Jazz Festival',
      description: 'Annual jazz festival featuring UIUC jazz ensembles and special guest artists. A celebration of jazz tradition and innovation in the heart of campus.',
      shortDescription: 'Annual jazz festival featuring UIUC jazz ensembles and special guest artists.',
      startDatetime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      endDatetime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'Krannert Center for the Performing Arts',
      address: '500 S Goodwin Ave',
      city: 'Urbana',
      latitude: 40.1053,
      longitude: -88.2244,
      price: '$15 – $25',
      categoryId: getCatId('music'),
      businessId: demoBusiness?.id,
      source: 'business',
      sourceEventId: `business-jazz-${Date.now()}`,
      isFeatured: 1,
      featuredUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
    },
    {
      title: 'Champaign Farmers Market',
      description: "Shop local produce, baked goods, crafts, and more at Champaign's beloved weekly farmers market. Rain or shine!",
      shortDescription: 'Weekly farmers market with local produce, baked goods, and crafts.',
      startDatetime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      endDatetime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'Lincoln Square Mall',
      address: '201 N Neil St',
      city: 'Champaign',
      latitude: 40.1164,
      longitude: -88.2434,
      price: 'Free',
      categoryId: getCatId('food-drink'),
      source: 'city-champaign',
      sourceEventId: 'farmers-market-weekly',
    },
    {
      title: 'Boneyard Arts Festival',
      description: 'A weekend-long celebration of art, music, and community in downtown Champaign. Features visual art, live performances, and interactive installations.',
      shortDescription: 'Weekend-long celebration of art, music, and community in downtown Champaign.',
      startDatetime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      endDatetime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'Downtown Champaign',
      address: '44 E Main St',
      city: 'Champaign',
      latitude: 40.1164,
      longitude: -88.2434,
      price: 'Free',
      categoryId: getCatId('arts-culture'),
      source: 'visitchampaigncounty',
      sourceEventId: 'boneyard-arts-2026',
    },
    {
      title: 'Illinois Marathon',
      description: 'Join thousands of runners in the annual Illinois Marathon and Half Marathon. The course takes you through the beautiful University of Illinois campus.',
      shortDescription: 'Annual marathon and half marathon through the University of Illinois campus.',
      startDatetime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'Memorial Stadium',
      address: '1402 S First St',
      city: 'Champaign',
      latitude: 40.0978,
      longitude: -88.2357,
      price: '$60 – $100',
      categoryId: getCatId('sports-fitness'),
      source: 'illini-union',
      sourceEventId: 'illinois-marathon-2026',
    },
    {
      title: 'Tech Talk: AI in Healthcare',
      description: 'UIUC CS department hosts a panel discussion on the applications of artificial intelligence in modern healthcare. Open to all.',
      shortDescription: 'Panel discussion on AI applications in modern healthcare.',
      startDatetime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      endDatetime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'Siebel Center for Computer Science',
      address: '201 N Goodwin Ave',
      city: 'Urbana',
      latitude: 40.1138,
      longitude: -88.2249,
      price: 'Free',
      categoryId: getCatId('tech'),
      source: 'university-of-illinois',
      sourceEventId: 'ai-healthcare-panel-2026',
    },
    {
      title: 'Taste of Champaign-Urbana',
      description: 'Annual food festival showcasing the best local restaurants, food trucks, and artisan food producers in the CU area.',
      shortDescription: 'Annual food festival showcasing the best local restaurants and food trucks.',
      startDatetime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      endDatetime: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'West Side Park',
      address: 'W University Ave & N Randolph St',
      city: 'Champaign',
      latitude: 40.1172,
      longitude: -88.2527,
      price: 'Free admission',
      categoryId: getCatId('food-drink'),
      source: 'visitchampaigncounty',
      sourceEventId: 'taste-cu-2026',
    },
    {
      title: 'Illini vs. Michigan Basketball',
      description: "Don't miss this Big Ten matchup as the Illinois Fighting Illini take on the Michigan Wolverines at State Farm Center.",
      shortDescription: 'Big Ten basketball: Illinois Fighting Illini vs. Michigan Wolverines.',
      startDatetime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'State Farm Center',
      address: '1800 S First St',
      city: 'Champaign',
      latitude: 40.0957,
      longitude: -88.2343,
      price: '$25 – $75',
      categoryId: getCatId('sports-fitness'),
      source: 'illini-union',
      sourceEventId: 'illini-basketball-michigan-2026',
    },
    {
      title: 'Outdoor Movie Night: Classics Under the Stars',
      description: 'Bring a blanket and enjoy a classic film screened outdoors at West Side Park. Free popcorn while supplies last!',
      shortDescription: 'Free outdoor movie screening at West Side Park with popcorn.',
      startDatetime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'West Side Park',
      address: 'W University Ave & N Randolph St',
      city: 'Champaign',
      latitude: 40.1172,
      longitude: -88.2527,
      price: 'Free',
      categoryId: getCatId('community'),
      source: 'city-champaign',
      sourceEventId: 'outdoor-movie-summer-2026',
    },
    {
      title: 'Allerton Park Garden Tour',
      description: 'Guided tours through the spectacular formal gardens at Allerton Park, featuring Chinese maze garden, sculptures, and seasonal blooms.',
      shortDescription: 'Guided tours through Allerton Park\'s spectacular formal gardens and sculptures.',
      startDatetime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      endDatetime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'Allerton Park & Retreat Center',
      address: '515 Old Timber Rd',
      city: 'Monticello',
      latitude: 39.9833,
      longitude: -88.5556,
      price: '$8',
      categoryId: getCatId('outdoors'),
      source: 'visitchampaigncounty',
      sourceEventId: 'allerton-garden-tour-2026',
    },
    {
      title: 'Craft Beer Festival',
      description: 'Sample craft beers from over 30 regional and local breweries at this popular annual festival in downtown Champaign.',
      shortDescription: 'Sample craft beers from 30+ regional breweries in downtown Champaign.',
      startDatetime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      endDatetime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      locationName: 'Downtown Champaign',
      address: '44 E Main St',
      city: 'Champaign',
      latitude: 40.1164,
      longitude: -88.2434,
      price: '$35',
      categoryId: getCatId('nightlife'),
      source: 'visitchampaigncounty',
      sourceEventId: 'craft-beer-festival-2026',
    },
  ]

  let inserted = 0
  for (const event of sampleEvents) {
    try {
      await db.insert(events).values(event).onConflictDoNothing()
      inserted++
    } catch (e) {
      console.error('Failed to insert event:', event.title, e)
    }
  }
  console.log(`Inserted ${inserted} sample events`)
  console.log('\nSeed complete!')
  console.log('\nLogin credentials:')
  console.log('  Admin: admin@cu-events.com / admin123')
  console.log('  Demo business: demo@krannert.illinois.edu / demo123')
}

seed()
  .catch(console.error)
  .finally(() => sqlite.close())
