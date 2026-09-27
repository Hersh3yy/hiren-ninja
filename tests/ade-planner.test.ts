import { describe, expect, it } from 'vitest'
import { normalizeArtistName, splitCompositeAct } from '../server/utils/ade-planner/normalize'
import { matchArtists } from '../server/utils/ade-planner/match'
import { groupByDay, parseArtistList } from '../app/composables/useAdePlanner.js'
import type { AdeData } from '../server/types/ade-planner'

const data: AdeData = {
  source: 'snapshot',
  artists: [
    { id: '1', name: 'Adam Beyer', country: 'se', spotifyId: null, adeUrl: 'https://ade/1', eventIds: ['e2', 'e1'] },
    { id: '2', name: 'Mr. Belt & Wezol', country: 'nl', spotifyId: null, adeUrl: 'https://ade/2', eventIds: ['e1'] },
    { id: '3', name: '​Psylent Ninja', country: null, spotifyId: null, adeUrl: 'https://ade/3', eventIds: [] },
    { id: '4', name: 'Wezol', country: 'nl', spotifyId: null, adeUrl: 'https://ade/4', eventIds: ['e2'] },
  ],
  events: [
    { id: 'e1', title: 'Drumcode', subtitle: null, startsAt: '2026-10-24T23:00:00+02:00', endsAt: null, venue: 'Gashouder', categories: null, soldOut: true, adeUrl: 'https://ade/e1', lineup: ['1', '2'] },
    { id: 'e2', title: 'Early', subtitle: null, startsAt: '2026-10-22T20:00:00+02:00', endsAt: null, venue: 'Paradiso', categories: null, soldOut: false, adeUrl: 'https://ade/e2', lineup: ['1', '4'] },
  ],
}

describe('normalizeArtistName', () => {
  it('ignores case, accents, punctuation and zero-width characters', () => {
    expect(normalizeArtistName('Âme')).toBe(normalizeArtistName('ame'))
    expect(normalizeArtistName('​Psylent  Ninja!')).toBe('psylent ninja')
    expect(normalizeArtistName('Above & Beyond')).toBe('above and beyond')
  })
})

describe('splitCompositeAct', () => {
  it('splits duos and b2b sets, leaves single acts alone', () => {
    expect(splitCompositeAct('Mr. Belt & Wezol')).toEqual(['Mr. Belt', 'Wezol'])
    expect(splitCompositeAct('Kruelty B2B Vieze Asbak')).toEqual(['Kruelty', 'Vieze Asbak'])
    expect(splitCompositeAct('Adam Beyer')).toEqual([])
  })
})

describe('matchArtists', () => {
  it('matches exact names and returns events sorted by start', () => {
    const { matches, unmatched } = matchArtists(data, [{ name: 'adam beyer', weight: 1 }, { name: 'Nobody', weight: 1 }])
    expect(matches.map(m => m.artist.name)).toEqual(['Adam Beyer'])
    expect(matches[0]!.events.map(e => e.id)).toEqual(['e2', 'e1'])
    expect(matches[0]!.events[1]!.lineupNames).toEqual(['Adam Beyer', 'Mr. Belt & Wezol'])
    expect(unmatched).toEqual(['Nobody'])
  })

  it('prefers an exact act over being part of a duo', () => {
    const { matches } = matchArtists(data, [{ name: 'Wezol', weight: 1 }])
    expect(matches.map(m => [m.artist.name, m.matchType])).toEqual([['Wezol', 'exact']])
  })

  it('falls back to part of a duo when there is no solo act', () => {
    const { matches } = matchArtists(data, [{ name: 'Mr Belt', weight: 1 }])
    expect(matches.map(m => [m.artist.name, m.matchType])).toEqual([['Mr. Belt & Wezol', 'part-of-act']])
  })

  it('finds names that carry hidden characters in the ADE data', () => {
    expect(matchArtists(data, [{ name: 'Psylent Ninja', weight: 1 }]).matches).toHaveLength(1)
  })
})

describe('parseArtistList', () => {
  it('splits lines and commas, strips list markers but not names starting with digits', () => {
    expect(parseArtistList('22 Weeks\n1. Adam Beyer\n- amelie lens, Amelie Lens\n2) 2CENT').map(a => a.name))
      .toEqual(['22 Weeks', 'Adam Beyer', 'amelie lens', '2CENT'])
  })
})

describe('groupByDay', () => {
  it('groups by Amsterdam day and merges artists sharing an event', () => {
    const { matches } = matchArtists(data, [{ name: 'Adam Beyer', weight: 1 }, { name: 'Mr. Belt & Wezol', weight: 1 }])
    const days = groupByDay(matches)
    expect(days.map(d => d.key)).toEqual(['2026-10-22', '2026-10-24'])
    expect(days[1]!.items[0]!.artists.sort()).toEqual(['Adam Beyer', 'Mr. Belt & Wezol'])
  })
})
