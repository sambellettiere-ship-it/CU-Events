import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-kf-deep text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/kingfishing.svg"
                alt="CU Events"
                width={24}
                height={30}
                className="object-contain brightness-200"
              />
              <span className="font-bold text-white">CU Events</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Your master calendar for Champaign-Urbana. Discover concerts, festivals, sports,
              community events, and more.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="hover:text-kf-sky transition-colors">All Events</Link></li>
              <li><Link href="/events?category=music" className="hover:text-kf-sky transition-colors">Music</Link></li>
              <li><Link href="/events?category=arts-culture" className="hover:text-kf-sky transition-colors">Arts & Culture</Link></li>
              <li><Link href="/events?category=food-drink" className="hover:text-kf-sky transition-colors">Food & Drink</Link></li>
              <li><Link href="/map" className="hover:text-kf-sky transition-colors">Event Map</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Businesses</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-kf-sky transition-colors">List Your Events</Link></li>
              <li><Link href="/auth/login" className="hover:text-kf-sky transition-colors">Business Login</Link></li>
              <li><Link href="/dashboard" className="hover:text-kf-sky transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/billing" className="hover:text-kf-sky transition-colors">Sponsored Listings</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-kf-teal/40 mt-10 pt-6 text-xs text-center">
          <p>© {new Date().getFullYear()} CU Events. Serving Champaign-Urbana, Illinois.</p>
        </div>
      </div>
    </footer>
  )
}
