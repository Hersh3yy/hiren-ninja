import type { AdeData } from '../../types/ade-planner'

const venueKey = (name: string): string => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

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
      if (!venue) return event
      const place = typeof venue.lat === 'number' && typeof venue.lng === 'number'
        ? { lat: venue.lat, lng: venue.lng, neighbourhood: venue.neighbourhood ?? null, acrossIj: Boolean(venue.acrossIj) }
        : null
      return { ...event, area: event.area || venue.area || null, place }
    }),
  }
}
