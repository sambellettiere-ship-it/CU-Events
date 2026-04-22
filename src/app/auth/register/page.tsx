import Link from 'next/link'

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CU</span>
            </div>
            <span className="font-bold text-lg">CU Events</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Choose how you want to participate</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Community member */}
          <Link
            href="/auth/register/user"
            className="group bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md p-6 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">Community Member</h2>
            <p className="text-sm text-gray-500 mb-4">
              Submit events happening in CU, plan your day, and keep track of what you want to attend.
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ Submit events for free</li>
              <li>✓ Build day itineraries</li>
              <li>✓ No business required</li>
            </ul>
            <div className="mt-4 text-sm font-semibold text-orange-600 group-hover:text-orange-700">
              Sign up free →
            </div>
          </Link>

          {/* Business */}
          <Link
            href="/auth/register/business"
            className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md p-6 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">Business / Organization</h2>
            <p className="text-sm text-gray-500 mb-4">
              Regularly host events in the CU area and want to reach a wider local audience.
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ Manage multiple events</li>
              <li>✓ Sponsored listings available</li>
              <li>✓ Business dashboard</li>
            </ul>
            <div className="mt-4 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
              Register business →
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
