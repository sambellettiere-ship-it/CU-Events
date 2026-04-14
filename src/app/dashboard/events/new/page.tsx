import EventForm from '@/components/events/EventForm'

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details for your event</p>
      </div>
      <EventForm mode="create" />
    </div>
  )
}
