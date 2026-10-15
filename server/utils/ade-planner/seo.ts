// Crawlable ADE Planner pages for search engines: one per festival day, one per artist,
// and the free/cheap parties list. Plain data here; the pages render it with the
// planner's own components and add schema.org Event markup.
import type { AdeData, AdeEvent, MatchedEvent } from '../../types/ade-planner'
import { buildIndex } from './match'
import { priceBand } from './price'

export const ADE_DAYS = Object.freeze([
  { slug: 'wednesday', date: '2026-10-21', label: 'Wednesday 21 October' },
  { slug: 'thursday', date: '2026-10-22', label: 'Thursday 22 October' },
  { slug: 'friday', date: '2026-10-23', label: 'Friday 23 October' },
  { slug: 'saturday', date: '2026-10-24', label: 'Saturday 24 October' },
  { slug: 'sunday', date: '2026-10-25', label: 'Sunday 25 October' },
])

/** "Âme & Dixon (live)" -> "ame-dixon-live" */
export function slugify(name: string): string {
  return name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' })
const hour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' })

/** A party starting at 02:00 on Saturday belongs to Friday night. */
export function planningDate(event: Pick<AdeEvent, 'startsAt' | 'isParty'>): string {
  const start = new Date(event.startsAt)
  const shifted = event.isParty !== false && Number(hour.format(start)) < 6 ? new Date(start.getTime() - 6 * 3_600_000) : start
  return ymd.format(shifted)
}

// What an event card shows. Lineup ids, raw tags and the like stay on the server: a
// day page has ~280 events and its payload otherwise passes 350 KB.
const CARD_FIELDS = [
  'id', 'title', 'subtitle', 'startsAt', 'endsAt', 'venue', 'area', 'address', 'place', 'categories', 'adeUrl',
  'program', 'ticketStatus', 'ticketUrl', 'ticketLabel', 'genres', 'isParty', 'timeOfDay', 'format',
  'durationMinutes', 'series', 'seriesDates', 'priceFrom', 'priceSource', 'vibe', 'size', 'topics', 'alsoListedAs',
] as const

export function cardEvent<T extends AdeEvent>(event: T): AdeEvent {
  const card = Object.fromEntries(CARD_FIELDS.filter(key => event[key] !== undefined && event[key] !== null).map(key => [key, event[key]]))
  return { ...card, lineup: [] } as unknown as AdeEvent
}

export function withLineupNames(data: AdeData, events: AdeEvent[]): MatchedEvent[] {
  const index = buildIndex(data)
  return events.map(event => ({
    ...cardEvent(event),
    lineupNames: [...new Set((event.lineup ?? []).map(id => index.artistNamesById.get(id)).filter(name => name !== undefined))]
      .sort((a, b) => a.localeCompare(b)),
  })).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** Parties and concerts of one festival day (nights until 06:00 included), plus how much daytime there is. */
export function dayProgram(data: AdeData, date: string) {
  const onDay = data.events.filter(event => event.format !== 'tba' && planningDate(event) === date)
  const daytime = onDay.filter(event => event.isParty === false)
  return {
    parties: withLineupNames(data, onDay.filter(event => event.isParty !== false)),
    daytimeCount: daytime.length,
    proCount: daytime.filter(event => event.program === 'pro').length,
  }
}

/** Artists with at least one event, by slug (the busiest artist wins a shared slug). */
export function artistsBySlug(data: AdeData) {
  const bySlug = new Map<string, AdeData['artists'][number]>()
  for (const artist of [...data.artists].sort((a, b) => b.eventIds.length - a.eventIds.length)) {
    if (!artist.eventIds.length) continue
    const slug = slugify(artist.name)
    if (slug && !bySlug.has(slug)) bySlug.set(slug, artist)
  }
  return bySlug
}

export function artistPage(data: AdeData, slug: string) {
  const artist = artistsBySlug(data).get(slug)
  if (!artist) return null
  const index = buildIndex(data)
  const events = artist.eventIds.map(id => index.eventsById.get(id)).filter((event): event is AdeEvent => Boolean(event))
  return {
    artist: { name: artist.name, role: artist.role ?? 'artist', subtitle: artist.subtitle ?? null, adeUrl: artist.adeUrl },
    events: withLineupNames(data, events),
  }
}

/** schema.org Event for Google's event results: only what we know for sure. */
export function eventJsonLd(event: AdeEvent & { lineupNames?: string[] }, pageUrl: string) {
  const band = priceBand(event)
  const offer = band === 'free' || band === 'free-ticket'
    ? { '@type': 'Offer', price: 0, priceCurrency: 'EUR', url: event.ticketUrl || event.adeUrl, availability: 'https://schema.org/InStock' }
    : band === 'paid'
      ? { '@type': 'Offer', price: event.priceFrom, priceCurrency: 'EUR', url: event.ticketUrl || event.adeUrl, availability: 'https://schema.org/InStock' }
      : event.ticketStatus === 'sold out'
        ? { '@type': 'Offer', url: event.ticketUrl || event.adeUrl, availability: 'https://schema.org/SoldOut' }
        : undefined
  return {
    '@type': 'Event',
    name: event.title,
    startDate: event.startsAt,
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue || 'Amsterdam',
      address: { '@type': 'PostalAddress', streetAddress: event.address || undefined, addressLocality: 'Amsterdam', addressCountry: 'NL' },
    },
    ...(event.lineupNames?.length ? { performer: event.lineupNames.slice(0, 20).map(name => ({ '@type': 'PerformingGroup', name })) } : {}),
    ...(offer ? { offers: offer } : {}),
    superEvent: { '@type': 'Festival', name: 'Amsterdam Dance Event 2026', startDate: '2026-10-21', endDate: '2026-10-25' },
    url: event.adeUrl || pageUrl,
  }
}
