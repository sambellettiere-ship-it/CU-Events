'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface Category {
  id: number
  name: string
  slug: string
  color: string
}

interface Props {
  categories: Category[]
}

type QuickRange = 'today' | 'tomorrow' | 'this-week' | 'this-weekend' | 'next-week'

function getQuickDateRange(type: QuickRange): { start: string; end: string } {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const fmtEnd = (d: Date) => fmt(d) + ' 23:59'

  const addDays = (d: Date, n: number) => {
    const r = new Date(d)
    r.setDate(r.getDate() + n)
    return r
  }

  switch (type) {
    case 'today':
      return { start: fmt(now), end: fmtEnd(now) }
    case 'tomorrow': {
      const t = addDays(now, 1)
      return { start: fmt(t), end: fmtEnd(t) }
    }
    case 'this-week': {
      // From today through end of this Sunday
      const endOfWeek = addDays(now, 6 - now.getDay())
      return { start: fmt(now), end: fmtEnd(endOfWeek) }
    }
    case 'this-weekend': {
      const day = now.getDay() // 0=Sun, 6=Sat
      const daysToSat = day === 6 ? 0 : day === 0 ? 6 : 6 - day
      const sat = addDays(now, daysToSat)
      const sun = addDays(sat, 1)
      return { start: fmt(sat), end: fmtEnd(sun) }
    }
    case 'next-week': {
      const daysToMon = now.getDay() === 0 ? 1 : 8 - now.getDay()
      const mon = addDays(now, daysToMon)
      const sun = addDays(mon, 6)
      return { start: fmt(mon), end: fmtEnd(sun) }
    }
  }
}

const QUICK_RANGES: { label: string; value: QuickRange }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Weekend', value: 'this-weekend' },
  { label: 'Next Week', value: 'next-week' },
]

export default function MapFilters({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const setParam = useCallback(
    (key: string, value: string) => setParams({ [key]: value }),
    [setParams]
  )

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const start = searchParams.get('start') || ''
  const end = searchParams.get('end') || ''

  const hasFilters = !!(category || search || start || end)

  // Determine which quick-range button (if any) is currently active
  const activeQuick =
    QUICK_RANGES.find((r) => {
      const range = getQuickDateRange(r.value)
      return range.start === start && range.end === end
    })?.value ?? null

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-2 flex-shrink-0">
      {/* Quick date buttons */}
      <div className="flex items-center gap-1 flex-wrap">
        {QUICK_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => {
              if (activeQuick === r.value) {
                setParams({ start: '', end: '' })
              } else {
                setParams(getQuickDateRange(r.value))
              }
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
              activeQuick === r.value
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 hidden sm:block" />

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => setParam('category', e.target.value)}
        className="py-1 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search…"
          defaultValue={search}
          onChange={(e) => setParam('search', e.target.value)}
          className="pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-36"
        />
      </div>

      {/* Custom date range */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <input
          type="date"
          value={start.slice(0, 10)}
          onChange={(e) => setParam('start', e.target.value)}
          className="py-1 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <span>–</span>
        <input
          type="date"
          value={end.slice(0, 10)}
          onChange={(e) =>
            setParam('end', e.target.value ? e.target.value + ' 23:59' : '')
          }
          className="py-1 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-orange-600 hover:text-orange-700 font-medium ml-auto"
        >
          Clear
        </button>
      )}
    </div>
  )
}
