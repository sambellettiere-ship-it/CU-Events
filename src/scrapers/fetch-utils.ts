import fs from 'fs'
import path from 'path'

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
  
  let cleanText = text.trim().replace(/\s+/g, ' ');
  
  // Try standard JS parsing first
  let d = new Date(cleanText);
  if (!isNaN(d.getTime())) return formatDbDate(d);

  // Remove ordinals like "th", "nd", "st", "rd" from days (e.g., May 12th -> May 12)
  cleanText = cleanText.replace(/(\d+)(st|nd|rd|th)/g, '$1');
  d = new Date(cleanText);
  if (!isNaN(d.getTime())) return formatDbDate(d);

  // Try splitting by hyphen or 'to' (e.g. "May 12 - May 14") and parse the first date
  const parts = cleanText.split(/[-–—]| to /i);
  if (parts.length > 1) {
    d = new Date(parts[0].trim());
    if (!isNaN(d.getTime())) return formatDbDate(d);
  }

  // Log exactly what string is failing so you can fix it later
  console.warn(`[parseDate] Could not parse date format: "${text}"`);
  return null;
}

function formatDbDate(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Fetch a URL. The 304 Not Modified file cache was removed because it was 
 * hiding events and preventing scraper code updates from running properly.
 */
export async function fetchCached(
  url: string,
  extraHeaders: Record<string, string> = {}
): Promise<Response | null> {
  const headers: Record<string, string> = {
    // Use a standard browser User-Agent so sites don't block the request
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    ...extraHeaders,
  }

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) })
    
    if (!res.ok) {
      console.warn(`[fetch] Failed to fetch ${url} - HTTP Status: ${res.status}`);
    }
    return res;
  } catch (err) {
    console.error(`[fetch] Network error fetching ${url}:`, err);
    return null;
  }
}
