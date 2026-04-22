import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { categories, businesses } from './schema'
import bcrypt from 'bcryptjs'
import path from 'path'

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'cu-events.db')
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite, { schema: { categories, businesses } })

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

  console.log('Seeding admin account...')
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

  console.log('\nSeed complete!')
  console.log('\nAdmin login: admin@cu-events.com / admin123')
}

seed()
  .catch(console.error)
  .finally(() => sqlite.close())
