import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocode'
import { z } from 'zod'

const schema = z.object({ address: z.string().min(1) })

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const result = await geocodeAddress(parsed.data.address)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(result)
}
