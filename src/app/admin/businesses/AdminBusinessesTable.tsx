'use client'

import { useState } from 'react'

interface BusinessRow {
  id: number
  name: string
  email: string
  website: string | null
  phone: string | null
  isVerified: number | null
  createdAt: string
  eventCount: number
}

export default function AdminBusinessesTable({
  businesses: initialBusinesses,
}: {
  businesses: BusinessRow[]
}) {
  const [businessesData, setBusinessesData] = useState(initialBusinesses)

  async function toggleVerified(id: number, current: number | null) {
    const newVal = current ? 0 : 1
    const res = await fetch(`/api/businesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: newVal }),
    })
    if (res.ok) {
      setBusinessesData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isVerified: newVal } : b))
      )
    }
  }

  async function deleteBusiness(id: number, name: string) {
    if (!confirm(`Delete business "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/businesses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBusinessesData((prev) => prev.filter((b) => b.id !== id))
    }
  }

  const verifiedCount = businessesData.filter((b) => b.isVerified).length

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {verifiedCount} of {businessesData.length} verified
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Events</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Verified</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {businessesData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No businesses registered
                  </td>
                </tr>
              ) : (
                businessesData.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{business.name}</p>
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate block max-w-xs"
                          >
                            {business.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{business.email}</p>
                      {business.phone && (
                        <p className="text-xs text-gray-400">{business.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{business.eventCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleVerified(business.id, business.isVerified)}
                        className={`w-8 h-5 rounded-full transition-colors ${
                          business.isVerified ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full shadow mx-auto transition-transform ${
                            business.isVerified ? 'translate-x-1.5' : '-translate-x-1.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteBusiness(business.id, business.name)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
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
