'use client'

import dynamic from 'next/dynamic'

const CalendarView = dynamic(() => import('./CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
      <p>Loading calendar…</p>
    </div>
  ),
})

interface CalendarEvent {
  id: number
  title: string
  startDatetime: string
  endDatetime?: string | null
  allDay?: number | null
  categoryColor?: string | null
}

interface Props {
  events: CalendarEvent[]
}

export default function CalendarViewClient(props: Props) {
  return <CalendarView {...props} />
}
