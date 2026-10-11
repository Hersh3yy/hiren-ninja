// Rough travel times between ADE venues, from straight-line distance: good enough to
// say "12 min by bike" or "you won't make it", without a routing service. The app
// imports this file too (My plan).

export interface Place { lat: number, lng: number, acrossIj?: boolean }

const EARTH_KM = 6371
// Streets and canals make a real route about a third longer than a straight line.
const DETOUR = 1.35
const BIKE_KMH = 15
const WALK_KMH = 5
// Waiting for and crossing on the IJ ferry (Buiksloterweg / NDSM).
const FERRY_MINUTES = 12

export function distanceKm(a: Place, b: Place): number {
  const rad = (degrees: number) => degrees * Math.PI / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h))
}

export interface Trip { minutes: number, mode: 'walk' | 'bike', ferry: boolean, km: number }

/** Walk when it's under 1 km, otherwise bike; add the ferry when one side is north of the IJ. */
export function travel(from: Place, to: Place): Trip {
  const km = distanceKm(from, to) * DETOUR
  const ferry = Boolean(from.acrossIj) !== Boolean(to.acrossIj)
  const mode = km < 1 && !ferry ? 'walk' : 'bike'
  const moving = (km / (mode === 'walk' ? WALK_KMH : BIKE_KMH)) * 60
  return { minutes: Math.max(1, Math.round(moving + (ferry ? FERRY_MINUTES : 0))), mode, ferry, km: Math.round(km * 10) / 10 }
}

export function describeTrip(trip: Trip): string {
  if (trip.km < 0.15) return 'same place'
  const far = trip.km > 6 ? ' (far out: check public transport)' : ''
  return `~${trip.minutes} min ${trip.mode === 'walk' ? 'walk' : 'by bike'}${trip.ferry ? ', incl. the ferry' : ''}${far}`
}
