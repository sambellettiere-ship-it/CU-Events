import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { events } from '../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import EventForm from '@/components/events/EventForm'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const { id } = await params
  const eventId = parseInt(id)
  if (isNaN(eventId)) notFound()

  const [event] = await db.select().from(events).where(eq(events.id, eventId))
  if (!event) notFound()

  const isOwner = (session.accountType === 'business' && event.businessId === session.businessId)
    || (session.accountType === 'user' && event.submittedByUserId === session.id)
  if (!isOwner && session.role !== 'admin') {
    redirect('/dashboard')
  }

  // Format datetime-local values
  const formatForInput = (dt: string | null) => {
    if (!dt) return ''
    return dt.replace(' ', 'T').slice(0, 16)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">{event.title}</p>
      </div>
      <EventForm
        mode="edit"
        eventId={eventId}
        initialData={{
          title: event.title,
          description: event.description || '',
          startDatetime: formatForInput(event.startDatetime),
          endDatetime: formatForInput(event.endDatetime || null),
          locationName: event.locationName || '',
          address: event.address || '',
          city: event.city || 'Champaign',
          price: event.price || '',
          imageUrl: event.imageUrl || '',
          ticketUrl: event.ticketUrl || '',
          url: event.url || '',
          categoryId: event.categoryId || '',
        }}
      />
    </div>
  )
}
