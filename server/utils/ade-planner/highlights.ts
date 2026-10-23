// "What's left": the parties of one remaining ADE day you can still get into, most wanted
// first. Wanted = starred, ticket clicks and opens in the planner, plus how often planner
// users' playlists turned up the lineup (artist hits). Plain counts, no AI.
import type { AdeData, AdeEvent, MatchedEvent } from '../../types/ade-planner'
import { isFreeEntry, priceBand, withinBudget } from './price'
import { planningDate, withLineupNames } from './seo'

export type LeftBudget = '' | '50' | '25' | 'free'
export const LEFT_BUDGETS: LeftBudget[] = ['', '50', '25', 'free']

/** Still something to buy or claim: on sale, or free. Sold out and "unknown" are left out. */
export const hasTickets = (event: AdeEvent): boolean =>
  !event.soldOut && (event.ticketStatus === 'available' || isFreeEntry(event))

type Counted = AdeEvent & { opens?: number, ticketClicks?: number }

export function popularity(event: Counted, artistHits: Map<string, number>): number {
  const lineupHits = (event.lineup ?? []).reduce((sum, id) => sum + (artistHits.get(id) ?? 0), 0)
  return (event.favorites ?? 0) * 4 + (event.ticketClicks ?? 0) * 3 + (event.opens ?? 0)
    + Math.min(lineupHits, 60) + Math.min(event.lineup?.length ?? 0, 12) * 0.25
}

export interface LeftResult {
  day: string
  total: number
  counts: Record<string, number>
  events: (MatchedEvent & { score: number })[]
}

/** One day's parties with tickets left, within a budget, most popular first (at most `limit`). */
export function whatsLeft(data: AdeData, day: string, budget: LeftBudget, now: Date = new Date(), limit = 40): LeftResult {
  const artistHits = new Map(data.artists.map(artist => [artist.id, (artist as { hits?: number }).hits ?? 0]))
  const open = data.events.filter((event) => {
    if (event.isParty === false || event.format === 'tba' || planningDate(event) !== day) return false
    const end = event.endsAt ? Date.parse(event.endsAt) : Date.parse(event.startsAt) + 4 * 3_600_000
    return end > now.getTime() && hasTickets(event)
  })
  const counts = Object.fromEntries(LEFT_BUDGETS.map(key => [key || 'any', open.filter(event => withinBudget(event, key)).length]))
  const ranked = open.filter(event => withinBudget(event, budget))
    .map(event => ({ event, score: popularity(event, artistHits) }))
    .sort((a, b) => b.score - a.score || a.event.startsAt.localeCompare(b.event.startsAt))
  const kept = ranked.slice(0, limit)
  const scores = new Map(kept.map(({ event, score }) => [event.id, score]))
  return {
    day,
    total: ranked.length,
    counts,
    // withLineupNames sorts by start time; put the most wanted back on top.
    events: withLineupNames(data, kept.map(({ event }) => event))
      .map(event => ({ ...event, score: scores.get(event.id) ?? 0 }))
      .sort((a, b) => b.score - a.score || a.startsAt.localeCompare(b.startsAt)),
  }
}

/** "From €18" / "Free" for the note under a highlight. */
export const priceNote = (event: AdeEvent): string => {
  const band = priceBand(event)
  return band === 'free' ? 'Free' : band === 'free-ticket' ? 'Free, get a ticket' : band === 'paid' ? `From €${Math.round(event.priceFrom as number)}` : 'Tickets on sale'
}
