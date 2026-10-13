import { loadAdeData } from '../../utils/ade-planner/data'
import { buildIndex } from '../../utils/ade-planner/match'
import { isFreeEntry } from '../../utils/ade-planner/price'

/** Every free party and concert (free entry, or a free ticket to claim), by start time. */
export default defineEventHandler(async () => {
  const data = await loadAdeData()
  const index = buildIndex(data)
  return data.events
    .filter(event => event.isParty !== false && isFreeEntry(event))
    .map(event => ({
      ...event,
      lineupNames: [...new Set((event.lineup ?? []).map(id => index.artistNamesById.get(id)).filter(name => name !== undefined))]
        .sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})
