interface GeoResult {
  lat: number
  lng: number
}

export async function geocodeAddress(address: string): Promise<GeoResult | null> {
  const userAgent = process.env.NOMINATIM_USER_AGENT || 'cu-events/1.0'
  const query = encodeURIComponent(`${address}, Champaign, IL, USA`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
