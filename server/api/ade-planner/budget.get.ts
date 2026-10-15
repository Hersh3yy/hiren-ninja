import { loadAdeData } from '../../utils/ade-planner/data'
import { withinBudget } from '../../utils/ade-planner/price'
import { withLineupNames } from '../../utils/ade-planner/seo'

/** Parties and concerts for casual visitors: free, or a known ticket under €50. The panel narrows further. */
export default defineEventHandler(async () => {
  const data = await loadAdeData()
  return withLineupNames(data, data.events.filter(event => event.isParty !== false && withinBudget(event, '50')))
})
