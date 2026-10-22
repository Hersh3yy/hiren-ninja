// "Find events": from a typed request and/or picked filters to a short list. The rules
// here are plain code (the planner keeps working when Gemini is slow or down); Gemini
// only turns free text into slots (parseSlots) and ranks what the rules found.
import type { AdeEvent } from '../../types/ade-planner'
import { planningDate } from './seo'
import { withinBudget } from './price'

export const AREAS = Object.freeze({
  west: ['West', 'Nieuw-West'],
  harbour: ['Westpoort'],
  centre: ['Centre'],
  north: ['North'],
  east: ['East'],
  south: ['South'],
  'south-east': ['Zuidoost'],
} as const)

export type AreaKey = keyof typeof AREAS
export type WhatKey = 'parties' | 'talks' | 'demos' | 'listening' | 'networking'
export type Budget = '' | 'free' | '25' | '50'

const WHAT_KINDS: Record<Exclude<WhatKey, 'parties'>, string[]> = {
  talks: ['talks', 'interviews', 'masterclasses', 'meet-the'],
  demos: ['gear', 'instore'],
  listening: ['listening'],
  networking: ['networking'],
}

/** One thing to look for: a day, a window of start times, and what / where / how much. */
export interface Slot {
  /** YYYY-MM-DD, the planning day (a 01:00 party belongs to the night before) */
  day: string
  /** minutes into the planning day; 1440+ is after midnight. A start time must fall in [from, to). */
  from?: number
  to?: number
  what: WhatKey[]
  areas: AreaKey[]
  budget: Budget
  /** anything in the request that is taste rather than a filter, e.g. "techno" */
  taste: string
}

export interface AskFilters {
  day?: string
  period?: 'daytime' | 'evening' | 'late'
  what?: WhatKey[]
  areas?: AreaKey[]
  budget?: Budget
}

export const PERIODS = Object.freeze({
  daytime: { from: 9 * 60, to: 18 * 60 },
  evening: { from: 18 * 60, to: undefined },
  late: { from: 22 * 60, to: undefined },
} as const)

const TIME_ZONE = 'Europe/Amsterdam'
const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const clock = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, weekday: 'long' })
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const MAX_EVENT_MINUTES = 600 // all-day installations are noise in a shortlist

export const todayInAmsterdam = (now: Date = new Date()): string => ymd.format(now)

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Minutes into the planning day an event starts: a party at 01:00 is 25:00 of the night before. */
export function startMinutes(event: Pick<AdeEvent, 'startsAt' | 'isParty'>): number {
  const [hours, minutes] = clock.format(new Date(event.startsAt)).split(':').map(Number)
  return (event.isParty !== false && hours < 6 ? hours + 24 : hours) * 60 + minutes
}

export const formatMinutes = (minutes: number): string =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const isWhat = (value: unknown): value is WhatKey => typeof value === 'string' && (value === 'parties' || value in WHAT_KINDS)
const isArea = (value: unknown): value is AreaKey => typeof value === 'string' && value in AREAS
const isBudget = (value: unknown): value is Budget => value === '' || value === 'free' || value === '25' || value === '50'

function toMinutes(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.min(value, 30 * 60))
  const match = typeof value === 'string' ? value.match(/^(\d{1,2}):(\d{2})$/) : null
  if (!match) return undefined
  const hours = Number(match[1])
  // "01:00" as a start time means after midnight, i.e. still tonight's planning day.
  return (hours < 6 ? hours + 24 : hours) * 60 + Number(match[2])
}

/** Whatever Gemini (or a client) sent, reduced to slots the rules can run. Never throws. */
export function sanitizeSlots(raw: unknown, today: string): Slot[] {
  const list = Array.isArray(raw) ? raw : []
  return list.filter(item => item && typeof item === 'object').slice(0, 3).flatMap((item): Slot[] => {
    if (!item || typeof item !== 'object') return []
    const slot = item as Record<string, unknown>
    const day = typeof slot.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(slot.day) ? slot.day : today
    const from = toMinutes(slot.from)
    const to = toMinutes(slot.to)
    return [{
      day,
      from,
      to: to !== undefined && from !== undefined && to <= from ? undefined : to,
      what: (Array.isArray(slot.what) ? slot.what : []).filter(isWhat).slice(0, 5),
      areas: (Array.isArray(slot.areas) ? slot.areas : []).filter(isArea).slice(0, 7),
      budget: isBudget(slot.budget) ? slot.budget : '',
      taste: typeof slot.taste === 'string' ? slot.taste.trim().slice(0, 120) : '',
    }]
  })
}

/** The picked filters fill in what the typed request left open; they never override it. */
export function applyFilters(slots: Slot[], filters: AskFilters, today: string): Slot[] {
  const period = filters.period ? PERIODS[filters.period] : undefined
  const base: Slot[] = slots.length ? slots : [{ day: filters.day ?? today, what: [], areas: [], budget: '', taste: '' }]
  return base.map(slot => ({
    ...slot,
    day: slots.length ? slot.day : filters.day ?? slot.day,
    from: slot.from ?? period?.from,
    to: slot.to ?? (slot.from === undefined ? period?.to : undefined),
    what: slot.what.length ? slot.what : filters.what ?? [],
    areas: slot.areas.length ? slot.areas : filters.areas ?? [],
    budget: slot.budget || filters.budget || '',
  }))
}

const AREA_WORDS: [AreaKey, RegExp][] = [
  ['west', /\b(?:nieuw[- ]?west|west|westerpark|westergas|sloterdijk)\b/],
  ['harbour', /\b(?:westpoort|harbou?r|haven)\b/],
  ['centre', /\b(?:centre|center|central|centrum|city centre)\b/],
  ['north', /\b(?:north|noord)\b/],
  ['east', /\b(?:east|oost)\b/],
  ['south', /\b(?:south|zuid)\b/],
  ['south-east', /\b(?:zuidoost|south[- ]?east|bijlmer)\b/],
]
const WHAT_WORDS: [WhatKey, RegExp][] = [
  ['talks', /\b(?:interviews?|talks?|panels?|conversations?|speakers?|masterclass(?:es)?|keynotes?)\b/],
  ['demos', /\b(?:demos?|gear|workshops?|try[- ]?outs?|brand)\b/],
  ['listening', /\blistening\b/],
  ['networking', /\bnetwork(?:ing)?\b/],
  ['parties', /\b(?:part(?:y|ies)|clubs?|raves?|djs?|night ?life|techno|house)\b/],
]

const DAY_WORD = new RegExp(`\\b(?:tonight|tonite|today|tomorrow|${DAY_NAMES.join('|')})\\b`)

/**
 * The request read from keywords: the fallback when Gemini can't parse it. "Talks in West
 * tomorrow, and a techno night tonight" becomes two slots: a new day word starts a new one.
 * A place or price named once counts for every slot. `genres` are the taste words to look for.
 */
export function heuristicSlots(prompt: string, today: string, adeDays: readonly string[], genres: readonly string[] = []): Slot[] {
  const parts: string[] = []
  for (const clause of prompt.toLowerCase().split(/\s*(?:[,;]|\band\b|\bthen\b|\bplus\b)\s*/).filter(Boolean)) {
    const last = parts.length - 1
    if (last >= 0 && !(DAY_WORD.test(parts[last]) && DAY_WORD.test(clause))) parts[last] += ` ${clause}`
    else parts.push(clause)
  }
  const slots = (parts.length ? parts : ['']).slice(0, 3).map(part => readClause(part, today, adeDays, genres))
  const areas = slots.find(slot => slot.areas.length)?.areas ?? []
  const budget = slots.find(slot => slot.budget)?.budget ?? ''
  return slots.map(slot => ({ ...slot, areas: slot.areas.length ? slot.areas : areas, budget: slot.budget || budget }))
}

function readClause(text: string, today: string, adeDays: readonly string[], genres: readonly string[]): Slot {
  let day = today
  if (/\btomorrow\b/.test(text)) day = addDays(today, 1)
  else if (!/\b(?:tonight|today|tonite)\b/.test(text)) {
    const named = DAY_NAMES.findIndex(name => new RegExp(`\\b${name}\\b`).test(text))
    const match = named >= 0 ? adeDays.find(date => DAY_NAMES[new Date(`${date}T12:00:00Z`).getUTCDay()] === DAY_NAMES[named]) : undefined
    if (match) day = match
  }

  let from: number | undefined
  let to: number | undefined
  const clockTime = text.match(/\b(?:(around|about|from|after|at|before|until)\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/)
    ?? text.match(/\b(around|about|from|after|at|before|until)\s+(\d{1,2})(?::(\d{2}))?\b(?!\s*(?:am|pm|€|euro))/)
  if (clockTime) {
    let hours = Number(clockTime[2]) % 12 + (clockTime[4] === 'pm' || (!clockTime[4] && Number(clockTime[2]) < 12 && /night|evening|tonight/.test(text)) ? 12 : 0)
    if (!clockTime[4] && Number(clockTime[2]) >= 12) hours = Number(clockTime[2])
    const minutes = hours * 60 + Number(clockTime[3] ?? 0)
    const word = clockTime[1]
    if (word === 'before' || word === 'until') to = minutes
    else from = word === 'around' || word === 'about' ? minutes - 60 : minutes
  } else if (/\b(?:day ?time|during the day|afternoon|morning|lunch)\b/.test(text)) {
    ({ from, to } = PERIODS.daytime)
  } else if (/\b(?:late|after ?hours|all night)\b/.test(text)) {
    from = PERIODS.late.from
  } else if (/\b(?:tonight|evening|night)\b/.test(text)) {
    from = PERIODS.evening.from
  }

  const budgetMatch = text.match(/\bunder\s*(?:€|eur(?:o)?s?\s*)?(\d{1,3})\b/)
  const budget: Budget = /\bfree\b/.test(text) ? 'free'
    : budgetMatch ? (Number(budgetMatch[1]) <= 25 ? '25' : '50')
      : /\b(?:cheap|budget|affordable)\b/.test(text) ? '25' : ''

  return {
    day,
    from,
    to,
    what: WHAT_WORDS.filter(([, pattern]) => pattern.test(text)).map(([key]) => key),
    areas: AREA_WORDS.filter(([, pattern]) => pattern.test(text)).map(([key]) => key),
    budget,
    taste: genres.filter(genre => new RegExp(`\\b${genre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)).join(', '),
  }
}

/** How many of the slot's taste words an event mentions (genres, title, description). */
export function tasteScore(event: AdeEvent, taste: string): number {
  const terms = taste.toLowerCase().split(/[,\s]+/).filter(term => term.length > 2)
  if (!terms.length) return 0
  const haystack = [...(event.genres ?? []), event.title, event.subtitle ?? ''].join(' ').toLowerCase()
  return terms.filter(term => haystack.includes(term)).length
}

function matchesWhat(event: AdeEvent, what: WhatKey[]): boolean {
  if (!what.length) return true
  return what.some(key => key === 'parties'
    ? event.isParty !== false
    : (event.kinds ?? []).some(kind => WHAT_KINDS[key].includes(kind)))
}

/** The events a slot asks for: not over, not sold out, one per show; best taste match, then most starred, first. */
export function selectEvents(events: AdeEvent[], slot: Slot, now: Date = new Date()): AdeEvent[] {
  const areas = new Set<string>(slot.areas.flatMap(key => [...AREAS[key]]))
  const seen = new Set<string>()
  return events
    .filter((event) => {
      if (event.soldOut || event.format === 'tba') return false
      if (planningDate(event) !== slot.day) return false
      const end = new Date(event.endsAt ?? new Date(event.startsAt).getTime() + 2 * 3_600_000)
      if (end <= now) return false
      if (event.durationMinutes && event.durationMinutes >= MAX_EVENT_MINUTES) return false
      const start = startMinutes(event)
      if (slot.from !== undefined && start < slot.from) return false
      if (slot.to !== undefined && start >= slot.to) return false
      if (areas.size && !areas.has(event.area ?? '')) return false
      if (slot.budget && !withinBudget(event, slot.budget)) return false
      return matchesWhat(event, slot.what)
    })
    .filter((event) => {
      const key = `${event.title}|${event.venue}|${event.startsAt}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(event => ({ event, score: tasteScore(event, slot.taste) }))
    .sort((a, b) => b.score - a.score || (b.event.favorites ?? 0) - (a.event.favorites ?? 0) || a.event.startsAt.localeCompare(b.event.startsAt))
    .map(({ event }) => event)
}

const dayLabel = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' })
const AREA_LABELS: Record<AreaKey, string> = { west: 'West', harbour: 'Harbour', centre: 'Centre', north: 'North', east: 'East', south: 'South', 'south-east': 'Zuidoost' }
const WHAT_LABELS: Record<WhatKey, string> = { parties: 'parties', talks: 'talks and interviews', demos: 'demos and gear', listening: 'listening sessions', networking: 'networking' }

/** "Tonight, from 18:00, West: talks and interviews" for the heading above a slot's results. */
export function describeSlot(slot: Slot, today: string): { label: string, summary: string } {
  const when = slot.day === today ? 'Today' : slot.day === addDays(today, 1) ? 'Tomorrow' : weekday.format(new Date(`${slot.day}T12:00:00Z`))
  const time = slot.from !== undefined && slot.to !== undefined ? `${formatMinutes(slot.from)}-${formatMinutes(slot.to)}`
    : slot.from !== undefined ? `from ${formatMinutes(slot.from)}`
      : slot.to !== undefined ? `before ${formatMinutes(slot.to)}` : ''
  const budget = slot.budget === 'free' ? 'free' : slot.budget ? `under €${slot.budget}` : ''
  const parts = [
    when,
    time,
    slot.areas.map(key => AREA_LABELS[key]).join(', '),
    [...slot.what.map(key => WHAT_LABELS[key]), budget].filter(Boolean).join(', '),
    slot.taste,
  ].filter(Boolean)
  return {
    label: `${when}${time ? `, ${time}` : ''}`,
    summary: `${dayLabel.format(new Date(`${slot.day}T12:00:00Z`))} · ${parts.slice(1).join(' · ') || 'everything'}`,
  }
}
