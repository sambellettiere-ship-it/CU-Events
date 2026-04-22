import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import EventForm from '@/components/events/EventForm'
import Link from 'next/link'

export default async function SubmitEventPage() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit an Event</h1>
        <p className="text-gray-500 mb-8">
          Sign in or create a free account to submit events happening in Champaign-Urbana.
          All submissions are reviewed by our team before being published.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/login?redirect=/submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register/user"
            className="bg-white border border-gray-200 hover:border-orange-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit an Event</h1>
        <p className="text-sm text-gray-500 mt-1">
          All submissions are reviewed by our team. You&apos;ll see your event listed once it&apos;s approved.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <strong>Submission Guidelines:</strong> Please only submit real events happening in or near Champaign-Urbana. Duplicate, spam, or irrelevant submissions will be rejected.
      </div>

      <EventForm mode="create" redirectTo="/dashboard" />
    </div>
  )
}
