'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SaleRow {
  id: number
  title: string
  type: string
  address: string
  city: string
  startDatetime: string
  endDatetime: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  garage: 'bg-orange-100 text-orange-700',
  estate: 'bg-purple-100 text-purple-700',
  yard: 'bg-green-100 text-green-700',
  moving: 'bg-blue-100 text-blue-700',
  church: 'bg-yellow-100 text-yellow-700',
}

export default function AdminSalesTable({ sales: initialSales }: { sales: SaleRow[] }) {
  const [salesData, setSalesData] = useState(initialSales)

  async function deleteSale(id: number, title: string) {
    if (!confirm(`Delete sale listing "${title}"?`)) return
    const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSalesData((prev) => prev.filter((s) => s.id !== id))
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{salesData.length} listing{salesData.length !== 1 ? 's' : ''}</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {salesData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No sale listings
                  </td>
                </tr>
              ) : (
                salesData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{sale.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${TYPE_COLORS[sale.type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {sale.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p className="truncate max-w-[160px]">{sale.address}</p>
                      <p className="text-xs text-gray-400">{sale.city}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                      {new Date(sale.startDatetime).toLocaleDateString()}
                      {sale.endDatetime && (
                        <span className="text-gray-400"> – {new Date(sale.endDatetime).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {sale.contactName && <p>{sale.contactName}</p>}
                      {sale.contactEmail && <p className="text-gray-400">{sale.contactEmail}</p>}
                      {sale.contactPhone && <p className="text-gray-400">{sale.contactPhone}</p>}
                      {!sale.contactName && !sale.contactEmail && !sale.contactPhone && (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/sales/${sale.id}`} className="text-xs text-gray-500 hover:text-gray-700">View</Link>
                        <button onClick={() => deleteSale(sale.id, sale.title)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
