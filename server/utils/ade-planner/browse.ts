import type { AdeData, AdeEvent, BrowseFilters, BrowseResult, Facet } from '../../types/ade-planner'
import { buildIndex } from './match'
import { normalizeArtistName } from './normalize'

type FacetKey = keyof BrowseResult['facets']

const valuesOf: Record<FacetKey, (event: AdeEvent) => string[]> = {
  kinds: event => event.kinds ?? [],
  times: event => (event.timeOfDay ? [event.timeOfDay] : []),
  access: event => (event.access ? [event.access] : []),
  areas: event => (event.area ? [event.area] : []),
  genres: event => event.genres ?? [],
}

const filterOf: Record<FacetKey, keyof BrowseFilters> = {
  kinds: 'kinds', times: 'times', access: 'access', areas: 'areas', genres: 'genres',
}

function passes(event: AdeEvent, filters: BrowseFilters, skip?: FacetKey): boolean {
  return (Object.keys(valuesOf) as FacetKey[]).every((key) => {
    if (key === skip) return true
    const wanted = filters[filterOf[key]] as string[]
    return wanted.length === 0 || valuesOf[key](event).some(value => wanted.includes(value))
  })
}

/** "labels, marketing" = either term; within a term every word must start a word in the text. */
function matchesQuery(haystack: string, terms: string[][]): boolean {
  return terms.some(words => words.every(word => haystack.includes(` ${word}`)))
}

function facetCounts(events: AdeEvent[], filters: BrowseFilters, key: FacetKey): Facet[] {
  const counts = new Map<string, number>()
  // Count as if this facet's own filter were off, so its other options stay visible.
  for (const event of events) {
    if (!passes(event, filters, key)) continue
    for (const value of new Set(valuesOf[key](event))) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count)
}

/** Non-party events for the daytime tab, filtered, searched and paged. */
export function browseDaytime(data: AdeData, filters: BrowseFilters, offset: number, limit: number): BrowseResult {
  const index = buildIndex(data)
  // Speakers' job and company make "labels" or "Spotify" find the right panels.
  const subtitles = new Map(data.artists.filter(artist => artist.subtitle).map(artist => [artist.id, artist.subtitle!]))
  const terms = filters.q.split(',')
    .map(term => normalizeArtistName(term).split(' ').filter(Boolean))
    .filter(words => words.length > 0)

  const searched = data.events.filter((event) => {
    if (event.isParty) return false
    if (terms.length === 0) return true
    const lineup = (event.lineup ?? []).map(id => `${index.artistNamesById.get(id) ?? ''} ${subtitles.get(id) ?? ''}`).join(' ')
    const haystack = ` ${normalizeArtistName(`${event.title} ${event.subtitle ?? ''} ${event.venue ?? ''} ${lineup}`)} `
    return matchesQuery(haystack, terms)
  })

  const matching = searched
    .filter(event => passes(event, filters))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  return {
    total: matching.length,
    events: matching.slice(offset, offset + limit).map(event => ({
      ...event,
      lineupNames: (event.lineup ?? [])
        .map(id => index.artistNamesById.get(id))
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b)),
    })),
    facets: {
      kinds: facetCounts(searched, filters, 'kinds'),
      times: facetCounts(searched, filters, 'times'),
      access: facetCounts(searched, filters, 'access'),
      areas: facetCounts(searched, filters, 'areas'),
      genres: facetCounts(searched, filters, 'genres'),
    },
  }
}
