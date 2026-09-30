import type { H3Event } from 'h3'
import type { AdeData } from '../../types/ade-planner'

interface AdeStats {
  /** ade-artist entry ids a search found */
  hits?: string[]
  /** ade-event entry ids starred (+1) or unstarred (-1) */
  favorites?: { id: string, delta: 1 | -1 }[]
}

/**
 * Anonymous counters on the VAMS entries (ade-artist `hits`, ade-event `favorites`).
 * Counts only, never who. Awaited with a short timeout: Netlify may stop a function
 * once it has answered. A failure never breaks the planner.
 */
export async function recordAdeStats(data: AdeData, stats: AdeStats): Promise<void> {
  if (data.source !== 'vams' || !isVamsConfigured()) return
  if (!stats.hits?.length && !stats.favorites?.length) return
  try {
    await postVams('/ade-planner/stats', { ...stats })
  } catch (error) {
    console.warn('[ade-planner] stats not recorded:', (error as Error).message)
  }
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
