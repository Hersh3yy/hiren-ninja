import type { H3Event } from 'h3'
import type { AdeData } from '../../types/ade-planner'

export interface AdeSearchLog {
  kind: 'playlist' | 'names' | 'daytime'
  source?: string
  playlistUrl?: string
  playlistTitle?: string
  trackCount?: number
  partial?: boolean
  /** typed names (extra names under a playlist link) or the daytime query */
  query?: string
  artistCount?: number
  matchedArtists?: string[]
  /** searched but not playing ADE */
  unmatched?: string[]
  resultCount?: number
  example?: boolean
}

interface AdeStats {
  /** ade-artist entry ids a search found (playlist or typed) */
  hits?: string[]
  /** ade-artist entry ids someone typed by name: the stronger signal */
  searched?: string[]
  /** ade-event entry ids whose details were opened / whose ticket, resale or ADE link was clicked */
  opens?: string[]
  ticketClicks?: string[]
  /** ade-event entry ids starred (+1) or unstarred (-1) */
  favorites?: { id: string, delta: 1 | -1 }[]
  /** one search for the anonymous log (VAMS ade-search): what, never who */
  search?: AdeSearchLog
}

const SOURCES = ['spotify', 'apple-music', 'youtube-music', 'names', 'daytime']
const text = (value: unknown, max: number): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined

/** The client's description of its search, trimmed to what VAMS accepts; null if unusable. */
export function parseSearchLog(value: unknown): Omit<AdeSearchLog, 'artistCount' | 'matchedArtists' | 'unmatched' | 'resultCount'> | null {
  if (!value || typeof value !== 'object') return null
  const search = value as Record<string, unknown>
  if (search.kind !== 'playlist' && search.kind !== 'names') return null
  const playlistUrl = text(search.playlistUrl, 500)
  return {
    kind: search.kind,
    source: SOURCES.includes(String(search.source)) ? String(search.source) : undefined,
    playlistUrl: playlistUrl && /^https:\/\//.test(playlistUrl) ? playlistUrl : undefined,
    playlistTitle: text(search.playlistTitle, 250),
    trackCount: Number.isInteger(search.trackCount) ? Number(search.trackCount) : undefined,
    partial: search.partial === true || undefined,
    query: text(search.query, 5000),
    example: search.example === true || undefined,
  }
}

/**
 * Anonymous counters on the VAMS entries (ade-artist `hits`, ade-event `favorites`).
 * Counts only, never who. Awaited with a short timeout: Netlify may stop a function
 * once it has answered. A failure never breaks the planner.
 */
export async function recordAdeStats(_data: AdeData, stats: AdeStats): Promise<void> {
  // The bundled snapshot is exported from VAMS with the same entry ids, so counting
  // still works while the site runs on it (e.g. during a VAMS deploy).
  if (!isVamsConfigured()) return
  if (!stats.hits?.length && !stats.searched?.length && !stats.favorites?.length && !stats.opens?.length && !stats.ticketClicks?.length && !stats.search) return
  try {
    await postVams('/ade-planner/stats', { ...stats })
  } catch (error) {
    console.warn('[ade-planner] stats not recorded:', (error as Error).message)
  }
}

// Per instance: one visitor opening (or clicking through on) the same event again counts once.
const seenActions = new Set<string>()

export function firstEventAction(event: H3Event, eventId: string, action: 'open' | 'ticket'): boolean {
  const key = `${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}:${eventId}:${action}`
  if (seenActions.has(key)) return false
  if (seenActions.size > 20_000) seenActions.clear()
  seenActions.add(key)
  return true
}

// Per instance: the same browser starring the same event twice counts once.
const lastAction = new Map<string, 1 | -1>()

/** +1 or -1 for this visitor and event, or null when it repeats their last action. */
export function favoriteDelta(event: H3Event, eventId: string, action: 'add' | 'remove'): 1 | -1 | null {
  const key = `${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}:${eventId}`
  const delta = action === 'add' ? 1 : -1
  if (lastAction.get(key) === delta) return null
  // A first "remove" without an "add" on this instance: starred before, still count it.
  lastAction.set(key, delta)
  if (lastAction.size > 20_000) lastAction.clear()
  return delta
}
