import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-03-25.dahlia',
})

export const SPONSORED_TIERS = [
  { days: 7, price: 900, label: '7 Days', description: 'Boost visibility for a week' },
  { days: 30, price: 2900, label: '30 Days', description: 'A full month of featured placement' },
  { days: 90, price: 7900, label: '90 Days', description: 'Quarterly top placement' },
] as const
