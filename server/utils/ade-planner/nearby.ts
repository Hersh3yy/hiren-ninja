import type { AdeData, AdeEvent } from '../../types/ade-planner'
import { distanceKm, travel, type Trip } from './travel'

export interface NearbyEvent { event: AdeEvent, km: number, trip: Trip, startsInMinutes: number }

/**
 * Events starting soon near a spot: from 15 minutes ago (just started, still worth
 * going) to `withinMinutes` ahead, nearest first. Events without a place are left out.
 */
export function eventsNearby(data: AdeData, at: Date, here: { lat: number, lng: number }, withinMinutes = 120, limit = 12): NearbyEvent[] {
  const from = at.getTime() - 15 * 60_000
  const to = at.getTime() + withinMinutes * 60_000
  return data.events
    .filter(event => event.place && event.format !== 'tba')
    .filter((event) => {
      const start = new Date(event.startsAt).getTime()
      return start >= from && start <= to
    })
    .map(event => ({
      event,
      km: Math.round(distanceKm(here, event.place!) * 10) / 10,
      trip: travel(here, event.place!),
      startsInMinutes: Math.round((new Date(event.startsAt).getTime() - at.getTime()) / 60_000),
    }))
    .sort((a, b) => a.trip.minutes - b.trip.minutes || a.startsInMinutes - b.startsInMinutes)
    .slice(0, limit)
}
