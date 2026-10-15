import { loadAdeData } from '../../utils/ade-planner/data'
import { buildIndex } from '../../utils/ade-planner/match'
import { withinBudget } from '../../utils/ade-planner/price'

/** Parties and concerts for casual visitors: free, or a known ticket under €50. The panel narrows further. */
export default defineEventHandler(async () => {
  const data = await loadAdeData()
  const index = buildIndex(data)
  return data.events
    .filter(event => event.isParty !== false && withinBudget(event, '50'))
    .map(event => ({
      ...event,
      lineupNames: [...new Set((event.lineup ?? []).map(id => index.artistNamesById.get(id)).filter(name => name !== undefined))]
        .sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})
