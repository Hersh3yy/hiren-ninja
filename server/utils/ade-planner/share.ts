import type { AdeData, MatchedEvent } from '../../types/ade-planner'
import { resolveEventId } from './duplicates'
import { buildIndex } from './match'

/** The shared events as the planner shows them; `missing` are ones ADE has since dropped. */
export function sharedPlanEvents(data: AdeData, ids: string[]): { events: MatchedEvent[], missing: number } {
  const index = buildIndex(data)
  const resolved = [...new Set(ids.map(id => resolveEventId(data, id)))]
  const events = resolved
    .map(id => index.eventsById.get(id))
    .filter(event => event !== undefined)
    .map(event => ({
      ...event,
      lineupNames: [...new Set((event.lineup ?? []).map(id => index.artistNamesById.get(id)).filter(name => name !== undefined))]
        .sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  return { events, missing: resolved.length - events.length }
}
