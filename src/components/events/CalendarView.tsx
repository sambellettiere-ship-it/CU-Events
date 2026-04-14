'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'

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

export default function CalendarView({ events }: Props) {
  const router = useRouter()

  const calEvents = events.map((e) => ({
    id: e.id.toString(),
    title: e.title,
    start: e.startDatetime,
    end: e.endDatetime || undefined,
    allDay: e.allDay === 1,
    backgroundColor: e.categoryColor || '#e84a00',
    borderColor: e.categoryColor || '#e84a00',
    textColor: '#ffffff',
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <style>{`
        .fc .fc-toolbar-title { font-size: 1.1rem; font-weight: 700; }
        .fc .fc-button { background: #e84a00; border-color: #e84a00; font-size: 0.8rem; padding: 4px 10px; }
        .fc .fc-button:hover { background: #c93d00; border-color: #c93d00; }
        .fc .fc-button-primary:not(:disabled).fc-button-active { background: #c93d00; border-color: #c93d00; }
        .fc .fc-daygrid-event { cursor: pointer; border-radius: 4px; }
        .fc .fc-list-event { cursor: pointer; }
        .fc .fc-today-button { background: #13294b; border-color: #13294b; }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        events={calEvents}
        eventClick={(info) => {
          router.push(`/events/${info.event.id}`)
        }}
        height="auto"
        eventDisplay="block"
        dayMaxEvents={3}
      />
    </div>
  )
}
