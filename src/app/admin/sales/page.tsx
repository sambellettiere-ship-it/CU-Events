import { db } from '@/lib/db'
import { sales } from '../../../../drizzle/schema'
import { desc } from 'drizzle-orm'
import AdminSalesTable from './AdminSalesTable'

export default async function AdminSalesPage() {
  const allSales = await db
    .select({
      id: sales.id,
      title: sales.title,
      type: sales.type,
      address: sales.address,
      city: sales.city,
      startDatetime: sales.startDatetime,
      endDatetime: sales.endDatetime,
      contactName: sales.contactName,
      contactEmail: sales.contactEmail,
      contactPhone: sales.contactPhone,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .orderBy(desc(sales.createdAt))
    .limit(200)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales Listings</h1>
      <AdminSalesTable sales={allSales} />
    </div>
  )
}
