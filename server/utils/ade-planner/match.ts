import type { AdeArtist, AdeData, AdeEvent, ArtistMatch, MatchedEvent, MatchResult, MatchType } from '../../types/ade-planner'
import { compactArtistName, normalizeArtistName, splitCompositeAct } from './normalize'

export interface IndexEntry {
  artist: AdeArtist
  matchType: MatchType
}

export interface AdeIndex {
  byName: Map<string, IndexEntry[]>
  /** event title -> its only lineup artist, for when ADE misnames the artist */
  bySoloEventTitle: Map<string, AdeArtist>
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
    // Spaces and dashes are how people differ most ("HiLo" vs "HI-LO"); keep a spaceless key too.
    addToIndex(byName, `~${compactArtistName(artist.name)}`, { artist, matchType: 'exact' })
    for (const part of splitCompositeAct(artist.name)) {
      addToIndex(byName, normalizeArtistName(part), { artist, matchType: 'part-of-act' })
    }
  }

  // ADE sometimes names an artist oddly ("Nimino Banner") while the show is titled after
  // them ("Nimino"). A one-artist event's title is then the better name.
  const artistsById = new Map(data.artists.map(artist => [artist.id, artist]))
  const bySoloEventTitle = new Map<string, AdeArtist>()
  for (const event of data.events) {
    const lineup = [...new Set(event.lineup ?? [])]
    const artist = lineup.length === 1 ? artistsById.get(lineup[0]!) : undefined
    const key = normalizeArtistName(event.title)
    if (artist && key && !bySoloEventTitle.has(key)) bySoloEventTitle.set(key, artist)
  }

  const index = {
    byName,
    bySoloEventTitle,
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
      lineupNames: [...new Set((event.lineup ?? [])
        .map(id => index.artistNamesById.get(id))
        .filter((name): name is string => Boolean(name)))]
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
  // ADE lists some artists twice ("Ado" and "Ado"); show them as one match with all events.
  const matchByName = new Map<string, ArtistMatch>()

  for (const { name, weight } of queries) {
    const soloEventArtist = index.bySoloEventTitle.get(normalizeArtistName(name))
    const hits = index.byName.get(normalizeArtistName(name))
      ?? index.byName.get(`~${compactArtistName(name)}`)
      ?? (soloEventArtist ? [{ artist: soloEventArtist, matchType: 'exact' as const }] : [])
    const exact = hits.filter(hit => hit.matchType === 'exact')
    const chosen = exact.length > 0 ? exact : hits

    if (chosen.length === 0) {
      unmatched.push(name)
      continue
    }

    for (const { artist, matchType } of chosen) {
      if (seenArtistIds.has(artist.id)) continue
      seenArtistIds.add(artist.id)
      const events = eventsFor(artist, index)
      const twin = matchByName.get(normalizeArtistName(artist.name))
      if (twin) {
        const known = new Set(twin.events.map(event => event.id))
        twin.events = [...twin.events, ...events.filter(event => !known.has(event.id))]
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        continue
      }
      const match = { query: name, weight, matchType, artist, events }
      matchByName.set(normalizeArtistName(artist.name), match)
      matches.push(match)
    }
  }

  matches.sort((a, b) => b.weight - a.weight || a.artist.name.localeCompare(b.artist.name))
  return { matches, unmatched }
}
