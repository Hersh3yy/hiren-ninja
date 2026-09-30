import { loadAdeData } from '../../utils/ade-planner/data'
import { matchArtists } from '../../utils/ade-planner/match'
import { recordAdeStats } from '../../utils/ade-planner/stats'

const MAX_ARTISTS = 500

export default defineEventHandler(async (event) => {
  const body = await readBody<{ artists?: { name: string, weight?: number }[] }>(event)
  rateLimit(event, 'match', 60, 60)
  const queries = (Array.isArray(body?.artists) ? body.artists : [])
    .filter(item => typeof item?.name === 'string' && item.name.trim())
    .slice(0, MAX_ARTISTS)
    .map(item => ({ name: item.name.trim().slice(0, 200), weight: Number(item.weight) || 1 }))

  if (queries.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Send at least one artist name.' })
  }

  const data = await loadAdeData()
  const result = matchArtists(data, queries)
  await recordAdeStats(data, { hits: result.matches.map(match => match.artist.id) })
  return { source: data.source, ...result }
})
