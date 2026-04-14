import fs from 'fs'
import path from 'path'

// CRITICAL FIX: This tells Node.js to ignore the "CERT_HAS_EXPIRED" error 
// from sites like visitchampaigncounty that have misconfigured SSL.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/** Strip HTML tags and collapse whitespace. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Truncate a string to at most maxLen characters, breaking at a word boundary.
 */
export function truncateText(text: string, maxLen = 500): string {
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > maxLen - 60 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/** Parse an arbitrary date/time string to 'YYYY-MM-DD HH:MM:SS'. */
export function parseDate(text: string | undefined | null): string | null {
  if (!text?.trim()) return null
  
  let cleanText = text.trim().replace(/\s+/g, ' ');
  
  let d = new Date(cleanText);
  if (!isNaN(d.getTime())) return formatDbDate(d);

  cleanText = cleanText.replace(/(\d+)(st|nd|rd|th)/g, '$1');
  d = new Date(cleanText);
  if (!isNaN(d.getTime())) return formatDbDate(d);

  const parts = cleanText.split(/[-–—]| to /i);
  if (parts.length > 1) {
    d = new Date(parts[0].trim());
    if (!isNaN(d.getTime())) return formatDbDate(d);
  }

  console.warn(`[parseDate] Could not parse date format: "${text}"`);
  return null;
}

function formatDbDate(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/** Fetch a URL with advanced browser spoofing. */
export async function fetchCached(
  url: string,
  extraHeaders: Record<string, string> = {}
): Promise<Response | null> {
  // Advanced headers to bypass 403 Cloudflare/WAF blocks on city-champaign & smilepolitely
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'no-cache',
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
