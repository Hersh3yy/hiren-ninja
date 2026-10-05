import type { BrowseFilters } from '../../types/ade-planner'
import { browseDaytime } from '../../utils/ade-planner/browse'
import { loadAdeData } from '../../utils/ade-planner/data'
import { recordAdeStats } from '../../utils/ade-planner/stats'

const list = (value: unknown): string[] =>
  String(value ?? '').split(',').map(item => item.trim()).filter(Boolean).slice(0, 20)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const day = String(query.day ?? '')
  const filters = {
    q: String(query.q ?? '').slice(0, 200),
    day: /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '',
    topics: list(query.topics),
    kinds: list(query.kinds),
    times: list(query.times),
    access: list(query.access),
    areas: list(query.areas),
    genres: list(query.genres),
  } as BrowseFilters

  const data = await loadAdeData()
  const result = browseDaytime(data, filters)
  // log=1 only on a submitted search, not on every filter or day change.
  if (query.log === '1' && filters.q) {
    await recordAdeStats(data, { search: { kind: 'daytime', source: 'daytime', query: filters.q, resultCount: result.total } })
  }
  return result
})
