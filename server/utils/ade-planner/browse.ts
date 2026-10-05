import type { AdeData, AdeEvent, BrowseFilters, BrowseResult, Facet, MatchedEvent } from '../../types/ade-planner'
import { buildIndex } from './match'
import { closestName, compactArtistName, normalizeArtistName } from './normalize'
import { TOPIC_LABELS } from './topics'

type FacetKey = keyof BrowseResult['facets']

const valuesOf: Record<FacetKey, (event: AdeEvent) => string[]> = {
  topics: event => event.topics ?? [],
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
 * several days) and sessions without a time yet. ADE Pro is always in: this tab is for
 * people with a pass. Facets count the whole
 * search, each ignoring its own filter so its other options stay visible.
 */
export function browseDaytime(data: AdeData, filters: BrowseFilters): BrowseResult {
  const index = buildIndex(data)
  const subtitles = new Map(data.artists.filter(artist => artist.subtitle).map(artist => [artist.id, artist.subtitle!]))
  const terms = filters.q.split(',').map(term => normalizeArtistName(term)).filter(Boolean)

  const searched = data.events.filter((event) => {
    if (event.isParty !== false) return false
    if (terms.length === 0) return true
    const lineup = (event.lineup ?? []).map(id => `${index.artistNamesById.get(id) ?? ''} ${subtitles.get(id) ?? ''}`).join(' ')
    // ADE's own labels too: "sync", "labels", "AI" and "house" are mostly tags and genres.
    const topics = (event.topics ?? []).map(topic => TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? '')
    const labels = [...(event.genres ?? []), ...(event.eventTypes ?? []), ...(event.tags ?? []), ...(event.kinds ?? []), ...topics].join(' ')
    const text = normalizeArtistName(`${event.title} ${event.subtitle ?? ''} ${event.venue ?? ''} ${lineup} ${labels}`)
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

  // A genre typed here that only lives at night ("hardstyle"): point to the parties.
  const partyGenres = searched.length > 0 ? [] : terms.flatMap((term) => {
    const parties = data.events.filter(event => event.isParty !== false && (event.genres ?? []).some(genre => normalizeArtistName(genre) === term))
    return parties.length ? [{ genre: parties[0]!.genres!.find(genre => normalizeArtistName(genre) === term)!, parties: parties.length }] : []
  })

  // Nothing at all: maybe a typo of a daytime speaker, artist or label.
  const daytimeWords = () => {
    const words = new Set<string>()
    for (const event of data.events) {
      if (event.isParty !== false) continue
      for (const id of event.lineup ?? []) words.add(index.artistNamesById.get(id) ?? '')
      // Labels word by word ("Labels, Publishing & Sync" -> "Publishing"), so a corrected
      // term can be searched on its own.
      for (const label of [...(event.genres ?? []), ...(event.tags ?? [])]) {
        words.add(label)
        for (const word of label.split(/[^\p{L}\p{N}]+/u)) if (word.length >= 4) words.add(word)
      }
    }
    words.delete('')
    return words
  }
  const didYouMean = searched.length === 0 && partyGenres.length === 0 && partyArtists.length === 0 && terms.length
    ? terms.map(term => closestName(term, daytimeWords())).filter((name): name is string => Boolean(name))
    : []

  return {
    partyArtists,
    partyGenres,
    didYouMean,
    total: onDay.length,
    sessions: onDay.filter(event => event.format === 'session').map(withLineup),
    dropIns: onDay.filter(event => event.format === 'drop-in').map(withLineup),
    tba: onDay.filter(event => event.format === 'tba').map(withLineup),
    days: count(filtered.map(event => [eventDay(event)])).sort((a, b) => a.value.localeCompare(b.value)),
    facets: {
      topics: facetOf('topics'),
      kinds: facetOf('kinds'),
      times: facetOf('times'),
      access: facetOf('access'),
      areas: facetOf('areas'),
      genres: facetOf('genres'),
    },
  }
}
