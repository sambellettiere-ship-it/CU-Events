import { NextRequest, NextResponse } from 'next/server'
import { stripe, SPONSORED_TIERS } from '@/lib/stripe'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { events } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  eventId: z.number(),
  durationDays: z.number().refine((d) => SPONSORED_TIERS.some((t) => t.days === d)),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const { eventId, durationDays } = parsed.data

  const [event] = await db.select().from(events).where(eq(events.id, eventId))
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  if (event.businessId !== session.businessId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const tier = SPONSORED_TIERS.find((t) => t.days === durationDays)!
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sponsored Listing: ${event.title}`,
            description: `${tier.label} featured placement on CU Events`,
          },
          unit_amount: tier.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/dashboard?sponsored=success`,
    cancel_url: `${baseUrl}/dashboard/billing?cancelled=true`,
    metadata: {
      eventId: eventId.toString(),
      businessId: session.businessId.toString(),
      durationDays: durationDays.toString(),
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
