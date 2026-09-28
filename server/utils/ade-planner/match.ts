import type { AdeArtist, AdeData, AdeEvent, ArtistMatch, MatchedEvent, MatchResult, MatchType } from '../../types/ade-planner'
import { normalizeArtistName, splitCompositeAct } from './normalize'

export interface IndexEntry {
  artist: AdeArtist
  matchType: MatchType
}

export interface AdeIndex {
  byName: Map<string, IndexEntry[]>
  eventsById: Map<string, AdeEvent>
  artistNamesById: Map<string, string>
}

const indexCache = new WeakMap<AdeData, AdeIndex>()

function addToIndex(byName: Map<string, IndexEntry[]>, key: string, entry: IndexEntry) {
  if (!key) return
  const list = byName.get(key) ?? []
  if (!list.some(existing => existing.artist.id === entry.artist.id)) list.push(entry)
  byName.set(key, list)
}

export function buildIndex(data: AdeData): AdeIndex {
  const cached = indexCache.get(data)
  if (cached) return cached

  const byName = new Map<string, IndexEntry[]>()
  for (const artist of data.artists) {
    addToIndex(byName, normalizeArtistName(artist.name), { artist, matchType: 'exact' })
    for (const part of splitCompositeAct(artist.name)) {
      addToIndex(byName, normalizeArtistName(part), { artist, matchType: 'part-of-act' })
    }
  }

  const index = {
    byName,
    eventsById: new Map(data.events.map(event => [event.id, event])),
    artistNamesById: new Map(data.artists.map(artist => [artist.id, artist.name])),
  }
  indexCache.set(data, index)
  return index
}

export function eventsFor(artist: AdeArtist, index: AdeIndex): MatchedEvent[] {
  return artist.eventIds
    .map(id => index.eventsById.get(id))
    .filter((event): event is AdeEvent => Boolean(event))
    .map(event => ({
      ...event,
      lineupNames: (event.lineup ?? [])
        .map(id => index.artistNamesById.get(id))
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export function getEventsForArtist(data: AdeData, name: string): ArtistMatch[] {
  return matchArtists(data, [{ name, weight: 1 }]).matches
}

/** Match names against the lineup. Exact names win; parts of a b2b or duo act come second. */
export function matchArtists(data: AdeData, queries: { name: string, weight: number }[]): MatchResult {
  const index = buildIndex(data)
  const matches: ArtistMatch[] = []
  const unmatched: string[] = []
  const seenArtistIds = new Set<string>()

  for (const { name, weight } of queries) {
    const hits = index.byName.get(normalizeArtistName(name)) ?? []
    const exact = hits.filter(hit => hit.matchType === 'exact')
    const chosen = exact.length > 0 ? exact : hits

    if (chosen.length === 0) {
      unmatched.push(name)
      continue
    }

    for (const { artist, matchType } of chosen) {
      if (seenArtistIds.has(artist.id)) continue
      seenArtistIds.add(artist.id)
      matches.push({ query: name, weight, matchType, artist, events: eventsFor(artist, index) })
    }
  }

  matches.sort((a, b) => b.weight - a.weight || a.artist.name.localeCompare(b.artist.name))
  return { matches, unmatched }
}
