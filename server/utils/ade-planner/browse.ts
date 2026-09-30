import type { AdeData, AdeEvent, BrowseFilters, BrowseResult, Facet, MatchedEvent } from '../../types/ade-planner'
import { buildIndex } from './match'
import { compactArtistName, normalizeArtistName } from './normalize'

type FacetKey = keyof BrowseResult['facets']

const valuesOf: Record<FacetKey, (event: AdeEvent) => string[]> = {
  intents: event => (event.intent ? [event.intent] : []),
  kinds: event => event.kinds ?? [],
  times: event => (event.timeOfDay ? [event.timeOfDay] : []),
  access: event => (event.access ? [event.access] : []),
  areas: event => (event.area ? [event.area] : []),
  genres: event => event.genres ?? [],
}

const dayOf = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' })
const eventDay = (event: AdeEvent): string => dayOf.format(new Date(event.startsAt))

function passes(event: AdeEvent, filters: BrowseFilters, skip?: FacetKey): boolean {
  return (Object.keys(valuesOf) as FacetKey[]).every((key) => {
    if (key === skip) return true
    const wanted = filters[key] as string[]
    return wanted.length === 0 || valuesOf[key](event).some(value => wanted.includes(value))
  })
}

/**
 * "labels, marketing" = either term. A term matches as a phrase at a word start
 * ("hi lo" won't match "Hiren ... Lounge"), or with spaces and dashes ignored
 * ("hilo" finds "HI-LO").
 */
function matchesQuery(haystack: string, compactHaystack: string, terms: string[]): boolean {
  return terms.some(term => haystack.includes(` ${term}`) || (term.length >= 4 && compactHaystack.includes(term.replace(/ /g, ''))))
}

function count(values: string[][]): Facet[] {
  const counts = new Map<string, number>()
  for (const list of values) for (const value of new Set(list)) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts].map(([value, n]) => ({ value, count: n })).sort((a, b) => b.count - a.count)
}

/**
 * The daytime tab for one day: fixed-time sessions, drop-ins (long, all day or running
 * several days) and ADE Pro sessions without a time yet. Facets count the whole
 * search, each ignoring its own filter so its other options stay visible.
 */
export function browseDaytime(data: AdeData, filters: BrowseFilters): BrowseResult {
  const index = buildIndex(data)
  const subtitles = new Map(data.artists.filter(artist => artist.subtitle).map(artist => [artist.id, artist.subtitle!]))
  const terms = filters.q.split(',').map(term => normalizeArtistName(term)).filter(Boolean)

  const searched = data.events.filter((event) => {
    if (event.isParty !== false) return false
    if (!filters.hasProPass && event.access === 'pro') return false
    if (terms.length === 0) return true
    const lineup = (event.lineup ?? []).map(id => `${index.artistNamesById.get(id) ?? ''} ${subtitles.get(id) ?? ''}`).join(' ')
    const text = normalizeArtistName(`${event.title} ${event.subtitle ?? ''} ${event.venue ?? ''} ${lineup}`)
    return matchesQuery(` ${text} `, text.replace(/ /g, ''), terms)
  })

  const filtered = searched.filter(event => passes(event, filters))
  const onDay = filtered
    .filter(event => !filters.day || eventDay(event) === filters.day)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title))

  const withLineup = (event: AdeEvent): MatchedEvent => ({
    ...event,
    lineupNames: [...new Set((event.lineup ?? [])
      .map(id => index.artistNamesById.get(id))
      .filter((name): name is string => Boolean(name)))]
      .sort((a, b) => a.localeCompare(b)),
  })

  const facetOf = (key: FacetKey): Facet[] =>
    count(searched.filter(event => (!filters.day || eventDay(event) === filters.day) && passes(event, filters, key)).map(valuesOf[key]))

  // Someone typed an artist who only plays parties: say so instead of showing nothing.
  const partyArtists = terms.flatMap((term) => {
    const hits = index.byName.get(term) ?? index.byName.get(`~${compactArtistName(term)}`) ?? []
    return hits
      .filter(hit => hit.matchType === 'exact')
      .map(hit => ({ name: hit.artist.name, parties: hit.artist.eventIds.filter(id => index.eventsById.get(id)?.isParty).length }))
      .filter(artist => artist.parties > 0)
  })

  return {
    partyArtists,
    total: onDay.length,
    sessions: onDay.filter(event => event.format === 'session').map(withLineup),
    dropIns: onDay.filter(event => event.format === 'drop-in').map(withLineup),
    tba: onDay.filter(event => event.format === 'tba').map(withLineup),
    days: count(filtered.map(event => [eventDay(event)])).sort((a, b) => a.value.localeCompare(b.value)),
    facets: {
      intents: facetOf('intents'),
      kinds: facetOf('kinds'),
      times: facetOf('times'),
      access: facetOf('access'),
      areas: facetOf('areas'),
      genres: facetOf('genres'),
    },
  }
}
