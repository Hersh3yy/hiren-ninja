import { loadAdeData } from '../../utils/ade-planner/data'
import { matchArtists } from '../../utils/ade-planner/match'
import { parseSearchLog, recordAdeStats } from '../../utils/ade-planner/stats'

// A 1,000-track playlist can hold 600+ artists; matching is a map lookup, so check them all.
const MAX_ARTISTS = 1_500

export default defineEventHandler(async (event) => {
  const body = await readBody<{ artists?: { name: string, weight?: number }[], search?: unknown }>(event)
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
  const search = parseSearchLog(body?.search)
  // VAMS takes up to 500 ids per call.
  const found = [...new Set(result.matches.map(match => match.artist.id))].slice(0, 500)
  await recordAdeStats(data, {
    // "Try an example" isn't interest in those artists, so it adds no hits.
    hits: search?.example ? [] : found,
    search: search && {
      ...search,
      artistCount: queries.length,
      matchedArtists: found,
      unmatched: result.unmatched.slice(0, 200),
    },
  })
  return { source: data.source, ...result }
})
