import fs from 'fs'
import path from 'path'

interface CacheEntry {
  etag?: string
  lastModified?: string
}

const CACHE_FILE = path.join(process.cwd(), '.scraper-cache.json')
let _cache: Record<string, CacheEntry> | null = null

function loadCache(): Record<string, CacheEntry> {
  if (_cache) return _cache
  try {
    _cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
  } catch {
    _cache = {}
  }
  return _cache!
}

function saveCache(cache: Record<string, CacheEntry>) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  } catch {}
}

/**
 * Fetch a URL using HTTP conditional requests (ETag / If-Modified-Since).
 *
 * Returns null if the server responds 304 Not Modified – the content has not
 * changed since the last scrape, so parsing can be skipped entirely. ETags and
 * Last-Modified values are persisted to disk (.scraper-cache.json) so they
 * survive between scraper runs and save bandwidth.
 */
export async function fetchCached(
  url: string,
  extraHeaders: Record<string, string> = {}
): Promise<Response | null> {
  const cache = loadCache()
  const entry = cache[url] ?? {}

  const headers: Record<string, string> = {
    'User-Agent': 'CU-Events/1.0 (cu-events.com)',
    ...extraHeaders,
  }
  if (entry.etag) headers['If-None-Match'] = entry.etag
  if (entry.lastModified) headers['If-Modified-Since'] = entry.lastModified

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) })

  if (res.status === 304) {
    console.log(`[fetch-cache] ${url} → 304 Not Modified, skipping`)
    return null
  }

  // Persist any caching headers the server sent back
  const etag = res.headers.get('etag')
  const lastModified = res.headers.get('last-modified')
  if (etag || lastModified) {
    cache[url] = {
      ...(etag ? { etag } : {}),
      ...(lastModified ? { lastModified } : {}),
    }
    saveCache(cache)
  }

  return res
}

/** Strip HTML tags and collapse whitespace. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Truncate a string to at most maxLen characters, breaking at a word boundary.
 * Prevents large HTML descriptions from bloating the database.
 */
export function truncateText(text: string, maxLen = 500): string {
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > maxLen - 60 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/** Parse an arbitrary date/time string to 'YYYY-MM-DD HH:MM:SS'. Returns null if invalid. */
export function parseDate(text: string | undefined | null): string | null {
  if (!text?.trim()) return null
  try {
    const d = new Date(text.trim())
    if (isNaN(d.getTime())) return null
    return d.toISOString().replace('T', ' ').slice(0, 19)
  } catch {
    return null
  }
}
