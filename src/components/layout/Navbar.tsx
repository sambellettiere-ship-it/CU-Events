'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useItinerary } from '@/lib/itinerary-context'

interface User {
  id: number
  name: string
  email: string
  role: string
  accountType?: string
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { count: itineraryCount } = useItinerary()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {})
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/events', label: 'Events' },
    { href: '/map', label: 'Map' },
    { href: '/sales', label: 'Sales' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/kingfishing.svg"
              alt="CU Events"
              width={28}
              height={36}
              className="object-contain"
            />
            <span className="font-bold text-lg text-kf-deep">CU Events</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith(link.href)
                    ? 'text-kf-teal'
                    : 'text-gray-600 hover:text-kf-deep'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              className={`text-sm font-medium transition-colors ${
                pathname === '/submit' ? 'text-kf-teal' : 'text-gray-600 hover:text-kf-deep'
              }`}
            >
              Submit Event
            </Link>
            <Link
              href="/itinerary"
              className={`relative text-sm font-medium transition-colors ${
                pathname === '/itinerary' ? 'text-kf-aqua' : 'text-gray-600 hover:text-kf-deep'
              }`}
            >
              My Itinerary
              {itineraryCount > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-kf-aqua text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itineraryCount > 9 ? '9+' : itineraryCount}
                </span>
              )}
            </Link>
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-kf-deep font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-kf-deep"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-kf-deep"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-kf-orange hover:bg-kf-rust text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/register/business"
                  className="border border-gray-200 hover:border-kf-sky text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  List Your Business
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Submit Event
            </Link>
            <Link
              href="/itinerary"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              My Itinerary {itineraryCount > 0 ? `(${itineraryCount})` : ''}
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                )}
                <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/register" className="block px-3 py-2 text-sm font-medium text-kf-orange hover:bg-kf-cream rounded-lg" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                <Link href="/auth/register/business" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Register Business</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
