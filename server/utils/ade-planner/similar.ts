import type { AdeData, Suggestion, SuggestionReason } from '../../types/ade-planner'
import { buildIndex, eventsFor } from './match'
import { normalizeArtistName } from './normalize'

// Deezer's public API needs no key; related artists come from its listening data.
const DEEZER = 'https://api.deezer.com'
const MAX_SEEDS = 12
const MAX_SUGGESTIONS = 24

interface DeezerArtist { id: number, name: string }

const relatedOnDeezer = defineCachedFunction(async (name: string): Promise<string[]> => {
  const search = await $fetch<{ data?: DeezerArtist[] }>(`${DEEZER}/search/artist`, { query: { q: name, limit: 1 }, timeout: 10_000 })
  const found = search.data?.[0]
  if (!found || normalizeArtistName(found.name) !== normalizeArtistName(name)) return []

  const related = await $fetch<{ data?: DeezerArtist[] }>(`${DEEZER}/artist/${found.id}/related`, { query: { limit: 30 }, timeout: 10_000 })
  return (related.data ?? []).map(artist => artist.name)
}, { name: 'ade-planner-deezer-related', maxAge: 60 * 60 * 24 * 7, getKey: (name: string) => normalizeArtistName(name) })

/**
 * Lineup artists you'd probably like: Deezer's related artists of your top artists,
 * plus artists who share a bill with your matches. Artists you already matched are left out.
 */
export async function suggestArtists(
  data: AdeData,
  seeds: { name: string, weight: number }[],
  matchedArtistIds: string[],
): Promise<Suggestion[]> {
  const index = buildIndex(data)
  const exclude = new Set(matchedArtistIds)
  const byId = new Map(data.artists.map(artist => [artist.id, artist]))
  const scores = new Map<string, { score: number, reasons: SuggestionReason[] }>()

  const add = (artistId: string, points: number, reason: SuggestionReason) => {
    if (exclude.has(artistId)) return
    const entry = scores.get(artistId) ?? { score: 0, reasons: [] }
    entry.score += points
    if (!entry.reasons.some(r => r.kind === reason.kind && r.via === reason.via)) entry.reasons.push(reason)
    scores.set(artistId, entry)
  }

  const topSeeds = [...seeds].sort((a, b) => b.weight - a.weight).slice(0, MAX_SEEDS)
  const relatedLists = await Promise.all(topSeeds.map(seed => relatedOnDeezer(seed.name).catch(() => [] as string[])))
  topSeeds.forEach((seed, i) => {
    relatedLists[i]!.forEach((name, rank) => {
      for (const hit of index.byName.get(normalizeArtistName(name)) ?? []) {
        if (hit.matchType === 'exact') add(hit.artist.id, 3 - rank / 15, { kind: 'similar', via: seed.name })
      }
    })
  })

  for (const artistId of exclude) {
    const mine = byId.get(artistId)
    if (!mine) continue
    for (const event of eventsFor(mine, index)) {
      for (const otherId of event.lineup ?? []) add(otherId, 1, { kind: 'same-bill', via: mine.name })
    }
  }

  return [...scores]
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .flatMap(([artistId, { score, reasons }]) => {
      const artist = byId.get(artistId)
      return artist ? [{ artist, events: eventsFor(artist, index), score: Math.round(score * 10) / 10, reasons }] : []
    })
    .filter(suggestion => suggestion.events.length > 0)
}
