import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { events, sponsoredListings } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { eventId, businessId, durationDays } = session.metadata || {}

    if (!eventId || !businessId || !durationDays) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const eventIdNum = parseInt(eventId)
    const businessIdNum = parseInt(businessId)
    const days = parseInt(durationDays)

    const now = new Date()
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    await db.insert(sponsoredListings).values({
      eventId: eventIdNum,
      businessId: businessIdNum,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent?.toString(),
      amount: session.amount_total || 0,
      durationDays: days,
      status: 'active',
      startsAt: now.toISOString().replace('T', ' ').slice(0, 19),
      expiresAt: expiresAt.toISOString().replace('T', ' ').slice(0, 19),
    })

    await db
      .update(events)
      .set({
        isFeatured: 1,
        featuredUntil: expiresAt.toISOString().replace('T', ' ').slice(0, 19),
      })
      .where(eq(events.id, eventIdNum))
  }

  return NextResponse.json({ received: true })
}
