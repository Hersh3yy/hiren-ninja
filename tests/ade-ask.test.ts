import { describe, expect, it } from 'vitest'
import { applyFilters, heuristicSlots, matchingText, sanitizeSlots, selectEvents, startMinutes, understoodNothing, type Slot } from '../server/utils/ade-planner/shortlist'
import type { AdeEvent } from '../server/types/ade-planner'

const ADE_DAYS = ['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']
const TODAY = '2026-10-22'
const before = new Date('2026-10-22T08:00:00+02:00')

const event = (over: Partial<AdeEvent>): AdeEvent => ({
  id: 'x', title: 'T', subtitle: null, startsAt: '2026-10-22T20:00:00+02:00', endsAt: '2026-10-22T23:00:00+02:00',
  venue: 'V', categories: null, soldOut: false, adeUrl: 'https://ade/x', lineup: [], isParty: true, area: 'West', ...over,
})

const slot = (over: Partial<Slot>): Slot => ({ day: TODAY, what: [], areas: [], budget: '', taste: '', ...over })

describe('heuristicSlots', () => {
  it('reads day, time, area and kind', () => {
    const [s] = heuristicSlots('interviews and demos in West tomorrow from 3pm', TODAY, ADE_DAYS)
    expect(s.day).toBe('2026-10-23')
    expect(s.from).toBe(15 * 60)
    expect(s.areas).toEqual(['west'])
    expect(s.what).toEqual(['talks', 'demos'])
  })

  it('treats "around 8pm" as a window opening an hour earlier', () => {
    const [s] = heuristicSlots('techno night around 8pm tonight', TODAY, ADE_DAYS)
    expect(s.day).toBe(TODAY)
    expect(s.from).toBe(19 * 60)
    expect(s.what).toEqual(['parties'])
  })

  it('splits two requests on a new day word, sharing the place', () => {
    const slots = heuristicSlots('interviews and demos in West tomorrow afternoon, and a techno night around 8pm tonight', TODAY, ADE_DAYS, ['techno', 'house'])
    expect(slots).toHaveLength(2)
    expect(slots[0]).toMatchObject({ day: '2026-10-23', from: 9 * 60, to: 18 * 60, what: ['talks', 'demos'], areas: ['west'] })
    expect(slots[1]).toMatchObject({ day: TODAY, from: 19 * 60, what: ['parties'], areas: ['west'], taste: 'techno' })
  })

  it('keeps one request together when only one day is named', () => {
    expect(heuristicSlots('talks and demos in the centre from 3pm', TODAY, ADE_DAYS)).toHaveLength(1)
  })

  it('reads dates like "the 24th of October"', () => {
    expect(heuristicSlots('are there events throughout the day on the 24th of october', TODAY, ADE_DAYS)[0]).toMatchObject({ day: '2026-10-24', from: 9 * 60, to: 18 * 60 })
    expect(heuristicSlots('oct 23 lab', TODAY, ADE_DAYS)[0]).toMatchObject({ day: '2026-10-23', what: ['lab'] })
  })

  it('knows when it understood nothing', () => {
    expect(understoodNothing('Silva bumpa', heuristicSlots('Silva bumpa', TODAY, ADE_DAYS), TODAY)).toBe(true)
    expect(understoodNothing('techno tonight', heuristicSlots('techno tonight', TODAY, ADE_DAYS), TODAY)).toBe(false)
    expect(understoodNothing('the 24th of october', heuristicSlots('the 24th of october', TODAY, ADE_DAYS), TODAY)).toBe(false)
  })

  it('maps free and cheap, and a named ADE day', () => {
    expect(heuristicSlots('free stuff on saturday', TODAY, ADE_DAYS)[0]).toMatchObject({ budget: 'free', day: '2026-10-24' })
    expect(heuristicSlots('something cheap', TODAY, ADE_DAYS)[0].budget).toBe('25')
    expect(heuristicSlots('under 40 euro', TODAY, ADE_DAYS)[0].budget).toBe('50')
  })
})

describe('sanitizeSlots', () => {
  it('keeps only known values and caps the count', () => {
    const slots = sanitizeSlots([
      { day: '2026-10-23', from: '15:00', what: ['talks', 'rm -rf'], areas: ['west', 'mars'], budget: 'free' },
      { day: 'nonsense', from: '25:99' },
      null,
      {}, {},
    ], TODAY)
    expect(slots).toHaveLength(3)
    expect(slots[0]).toMatchObject({ day: '2026-10-23', from: 15 * 60, what: ['talks'], areas: ['west'], budget: 'free' })
    expect(slots[1].day).toBe(TODAY)
  })

  it('treats an after-midnight start as part of the night', () => {
    expect(sanitizeSlots([{ from: '01:00' }], TODAY)[0].from).toBe(25 * 60)
  })

  it('returns nothing for junk', () => {
    expect(sanitizeSlots('x', TODAY)).toEqual([])
    expect(sanitizeSlots(undefined, TODAY)).toEqual([])
  })
})

describe('applyFilters', () => {
  it('fills the gaps a typed request left, without overriding it', () => {
    const [s] = applyFilters([slot({ areas: ['centre'] })], { areas: ['west'], what: ['talks'], period: 'evening' }, TODAY)
    expect(s.areas).toEqual(['centre'])
    expect(s.what).toEqual(['talks'])
    expect(s.from).toBe(18 * 60)
  })

  it('makes a slot from filters alone', () => {
    const [s] = applyFilters([], { day: '2026-10-24', period: 'daytime', areas: ['west'] }, TODAY)
    expect(s).toMatchObject({ day: '2026-10-24', from: 9 * 60, to: 18 * 60, areas: ['west'] })
  })
})

describe('selectEvents', () => {
  const events = [
    event({ id: 'party', title: 'Party', startsAt: '2026-10-22T22:00:00+02:00', endsAt: '2026-10-23T05:00:00+02:00' }),
    event({ id: 'after-midnight', title: 'Late', startsAt: '2026-10-23T01:00:00+02:00', endsAt: '2026-10-23T05:00:00+02:00' }),
    event({ id: 'talk', title: 'Talk', isParty: false, kinds: ['interviews'], startsAt: '2026-10-22T16:00:00+02:00', endsAt: '2026-10-22T17:00:00+02:00' }),
    event({ id: 'centre', title: 'Centre talk', area: 'Centre', isParty: false, kinds: ['talks'], startsAt: '2026-10-22T16:00:00+02:00', endsAt: '2026-10-22T17:00:00+02:00' }),
    event({ id: 'sold', title: 'Sold', soldOut: true }),
    event({ id: 'allday', title: 'Installation', isParty: false, durationMinutes: 1020, startsAt: '2026-10-22T10:00:00+02:00', endsAt: '2026-10-22T23:00:00+02:00' }),
    event({ id: 'tomorrow', title: 'Tomorrow', startsAt: '2026-10-23T20:00:00+02:00', endsAt: '2026-10-23T23:00:00+02:00' }),
  ]
  const ids = (s: Slot) => selectEvents(events, s, before).map(e => e.id)

  it('puts a 01:00 party on the night before', () => {
    expect(startMinutes(events[1])).toBe(25 * 60)
    expect(ids(slot({ from: 20 * 60 }))).toEqual(expect.arrayContaining(['party', 'after-midnight']))
    expect(ids(slot({ from: 20 * 60 }))).not.toContain('tomorrow')
  })

  it('filters by kind and area, and drops sold-out and all-day events', () => {
    expect(ids(slot({ what: ['talks'], areas: ['west'] }))).toEqual(['talk'])
    expect(ids(slot({ what: ['talks'], areas: ['centre'] }))).toEqual(['centre'])
    expect(ids(slot({}))).not.toContain('sold')
    expect(ids(slot({}))).not.toContain('allday')
  })

  it('applies the start window', () => {
    expect(ids(slot({ from: 9 * 60, to: 18 * 60 }))).toEqual(expect.arrayContaining(['talk', 'centre']))
    expect(ids(slot({ from: 9 * 60, to: 18 * 60 }))).not.toContain('party')
  })

  it('keeps only taste matches when there are any', () => {
    const list = [
      event({ id: 'disco', title: 'Disco night', genres: ['Disco'] }),
      event({ id: 'techno', title: 'Warehouse', genres: ['Techno'] }),
    ]
    expect(selectEvents(list, slot({ taste: 'techno' }), before).map(e => e.id)).toEqual(['techno'])
    expect(selectEvents(list, slot({ taste: 'footwork' }), before)).toHaveLength(2)
  })

  it('finds ADE Lab events', () => {
    const list = [
      event({ id: 'lab', title: 'Gear Test Lab', isParty: false, tags: ['ADE Lab'], startsAt: '2026-10-22T12:00:00+02:00', endsAt: '2026-10-22T13:00:00+02:00' }),
      event({ id: 'party', title: 'Party' }),
    ]
    expect(selectEvents(list, slot({ what: ['lab'] }), before).map(e => e.id)).toEqual(['lab'])
  })

  it('leaves out events that are over', () => {
    const late = new Date('2026-10-22T17:30:00+02:00')
    expect(selectEvents(events, slot({ what: ['talks'] }), late)).toEqual([])
  })
})

describe('areaFromAddress', () => {
  it('places Westergas venues whose geocoding failed', async () => {
    const { areaFromAddress } = await import('../server/utils/ade-planner/venues')
    expect(areaFromAddress('WestWeelde - Lab Village Klönneplein 4-6, Amsterdam')).toBe('West')
    expect(areaFromAddress('Gashouder Klönneplein 1, Amsterdam')).toBe('West')
    expect(areaFromAddress('Somewhere 1, Amsterdam')).toBeNull()
  })
})

describe('name search', () => {
  const list = [
    event({ id: 'a', title: 'Mentor Lab', venue: 'Het Ketelhuis', lineup: ['1'] }),
    event({ id: 'b', title: 'Warehouse', venue: 'NDSM', lineup: ['2'], startsAt: '2026-10-24T22:00:00+02:00', endsAt: '2026-10-25T05:00:00+02:00' }),
  ]
  const names = (id: string) => ({ 1: 'Djrum', 2: 'Adam Beyer' } as Record<string, string>)[id]

  it('matches title, venue and lineup names, accents and case ignored', () => {
    expect(matchingText(list, 'ketelhuis', names).map(e => e.id)).toEqual(['a'])
    expect(matchingText(list, 'adam beyer', names).map(e => e.id)).toEqual(['b'])
    expect(matchingText(list, '', names)).toHaveLength(2)
  })

  it('searches every day when the day is empty', () => {
    expect(selectEvents(list, slot({ day: '' }), before).map(e => e.id).sort()).toEqual(['a', 'b'])
    expect(applyFilters([], { day: '' }, TODAY)[0].day).toBe('')
  })
})
