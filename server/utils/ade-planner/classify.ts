import type { AdeEvent, EventKind, TimeOfDay } from '../../types/ade-planner'

const PARTY_TYPES = new Set(['Nighttime events', 'All night long', 'Club nights'])

interface KindRule {
  kind: EventKind
  labels: string[]
  title?: RegExp
}

// ADE's own types and tags first, then title keywords for events ADE tagged loosely.
const KIND_RULES: KindRule[] = [
  { kind: 'talks', labels: ['Keynotes, Talks & Panels', 'Indepth'], title: /\b(talks?|panel|keynote|in conversation|q&a|interview)\b/i },
  { kind: 'masterclasses', labels: ['Masterclasses', 'Get into session'], title: /master ?class|workshop/i },
  { kind: 'gear', labels: [], title: /\bgear\b|synth|\bdemos?\b|try.?out|hands.?on|modular/i },
  { kind: 'listening', labels: [], title: /listening|playback/i },
  { kind: 'showcases', labels: ['Showcases & Expo\'s'], title: /showcase|\bexpo\b|market|\bfair\b/i },
  { kind: 'instore', labels: ['Instore Session'], title: /record store|in-?store|signing|meet (&|and) greet/i },
  { kind: 'networking', labels: ['Networking events', 'Networking'], title: /network|meet.?up|mixer|brunch|breakfast|drinks/i },
  { kind: 'art', labels: ['Exhibitions', 'Audiovisual & Immersive Arts'], title: /exhibit|installation|gallery/i },
  { kind: 'film', labels: ['Film & Documentaries'], title: /\bfilms?\b|documentar|screening/i },
  { kind: 'wellbeing', labels: ['Wellbeing', 'Sports'], title: /yoga|breath|run club|meditat|sauna|sound bath/i },
  { kind: 'culture', labels: ['Music Culture', 'Lifestyle', 'Social impact', 'Dance & Theatre', 'Live Performances'] },
]

const hourIn = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

function clock(iso: string | null | undefined): [number, number] | null {
  if (!iso) return null
  const [h, m] = hourIn.format(new Date(iso)).split(':').map(Number)
  return [h!, m!]
}

export function timeOfDay(event: Pick<AdeEvent, 'startsAt' | 'endsAt'>): TimeOfDay {
  // ADE Pro lists unscheduled sessions with the same start and end time.
  if (event.endsAt && event.startsAt === event.endsAt) return 'tba'
  const start = clock(event.startsAt)
  const end = clock(event.endsAt)
  // Installations and hubs run 00:00-23:59: that's "all day", not a night event.
  if (start && start[0] === 0 && start[1] === 0 && (!end || (end[0] === 23 && end[1] === 59))) return 'all-day'
  const hour = start?.[0] ?? 12
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/**
 * Parties & concerts vs daytime & networking. Club-night types decide first. Otherwise
 * an event is daytime only when it has a clearly non-party kind (talk, workshop, showcase,
 * ...) or no music genre at all; a 16:00 rave or an evening concert is still a party.
 */
export function isPartyEvent(event: Pick<AdeEvent, 'program' | 'eventTypes' | 'tags' | 'title' | 'genres' | 'startsAt' | 'endsAt'>): boolean {
  if (event.program === 'pro') return false
  const types = event.eventTypes ?? []
  if (types.some(type => PARTY_TYPES.has(type))) return true
  if (eventKinds(event).some(kind => kind !== 'culture')) return false
  return (event.genres ?? []).length > 0 || timeOfDay(event) === 'night'
}

export function eventKinds(event: Pick<AdeEvent, 'eventTypes' | 'tags' | 'title'>): EventKind[] {
  const labels = new Set([...(event.eventTypes ?? []), ...(event.tags ?? [])])
  return KIND_RULES
    .filter(rule => rule.labels.some(label => labels.has(label)) || rule.title?.test(event.title))
    .map(rule => rule.kind)
}
