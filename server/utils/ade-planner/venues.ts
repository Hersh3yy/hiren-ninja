import type { AdeData } from '../../types/ade-planner'

const venueKey = (name: string): string => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// When geocoding failed (PDOK gave only the town for these), the street still says the district.
const AREA_BY_ADDRESS: [RegExp, string][] = [
  [/klonneplein|polonceaukade|westergas|westerpark|haarlemmerweg|jan pieter heijestraat/i, 'West'],
  [/ndsm|ijboulevard/i, 'North'],
  [/oude brugsteeg|nieuwezijds|damrak|warmoesstraat/i, 'Centre'],
  [/burgerweeshuispad|olympisch stadion/i, 'South'],
]

export function areaFromAddress(text: string): string | null {
  // "Klönneplein" comes in with a combining accent as often as without.
  const plain = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  return AREA_BY_ADDRESS.find(([pattern]) => pattern.test(plain))?.[1] ?? null
}

/**
 * Each event gets its venue's place (coordinates, neighbourhood, ferry) and, where ADE
 * gave no area (82% of events), the venue's district, so the area filter works.
 */
export function withVenues(data: AdeData): AdeData {
  const venues = new Map((data.venues ?? []).map(venue => [venueKey(venue.name), venue]))
  if (venues.size === 0) return data
  return {
    ...data,
    events: data.events.map((event) => {
      const venue = event.venue ? venues.get(venueKey(event.venue)) : undefined
      if (!venue) return event.area ? event : { ...event, area: areaFromAddress(`${event.venue ?? ''} ${event.address ?? ''}`) }
      const place = typeof venue.lat === 'number' && typeof venue.lng === 'number'
        ? { lat: venue.lat, lng: venue.lng, neighbourhood: venue.neighbourhood ?? null, acrossIj: Boolean(venue.acrossIj) }
        : null
      const area = event.area || venue.area || areaFromAddress(`${event.venue} ${venue.address ?? ''} ${event.address ?? ''}`)
      return { ...event, area: area || null, place }
    }),
  }
}
