import { describe, expect, it } from 'vitest'
import { closestName, editDistance, normalizeArtistName, splitCompositeAct } from '../server/utils/ade-planner/normalize'
import { matchArtists } from '../server/utils/ade-planner/match'
import { browseDaytime } from '../server/utils/ade-planner/browse'
import { spotifyGid } from '../server/utils/ade-planner/playlist'
import { genreProfile, groupByDay, groupEventsByDay, parseArtistList } from '../app/composables/useAdePlanner.js'
import { findClashes, layoutLanes, minutesOnDay, planningDay, toIcs } from '../app/utils/timetable.js'
import { priceLabel, withinBudget } from '../server/utils/ade-planner/price'
import { usageKey } from '../app/utils/track.js'
import { vibeLabel } from '../server/utils/ade-planner/vibe'
import { planningDate, slugify } from '../server/utils/ade-planner/seo'
import { whatsLeft } from '../server/utils/ade-planner/highlights'
import { describeTrip, travel } from '../server/utils/ade-planner/travel'
import { withVenues } from '../server/utils/ade-planner/venues'
import { eventsNearby } from '../server/utils/ade-planner/nearby'
import { mergeDuplicateEvents, resolveEventId } from '../server/utils/ade-planner/duplicates'
import { decodePlan, encodePlan } from '../server/utils/ade-planner/plan-link'
import { sharedPlanEvents } from '../server/utils/ade-planner/share'
import type { AdeData } from '../server/types/ade-planner'
import { parseYouTubeMusicPage, youTubeMusicContinuation, youTubeMusicListId, youTubeMusicTitle, youTubeMusicTracks } from '../server/utils/ade-planner/youtube-music'

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

  it('ignores case, spaces and dashes in names', () => {
    const withHiLo: AdeData = { ...data, artists: [...data.artists, { id: '9', name: 'HI-LO', country: 'nl', spotifyId: null, adeUrl: 'https://ade/9', eventIds: [] }] }
    for (const typed of ['Hi-LO', 'HI-LO', 'hi lo', 'HiLo', 'hilo']) {
      expect(matchArtists(withHiLo, [{ name: typed, weight: 1 }]).matches.map(m => m.artist.name)).toEqual(['HI-LO'])
    }
  })

  it('finds names that carry hidden characters in the ADE data', () => {
    expect(matchArtists(data, [{ name: 'Psylent Ninja', weight: 1 }]).matches).toHaveLength(1)
  })
})

describe('parseArtistList', () => {
  it('drops country codes and set tags from copied lineups, and separator lines', () => {
    expect(parseArtistList('Ely Oaks (AT)\n\n-\nBassjackers (NL)\nKerri Chandler (live)\nT78 [DJ set]\n[IVY]').map(a => a.name))
      .toEqual(['Ely Oaks', 'Bassjackers', 'Kerri Chandler', 'T78', '[IVY]'])
  })
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

describe('genreProfile', () => {
  it('counts genres across your events, most common first', () => {
    const items = [
      { event: { genres: ['Techno', 'House'] } },
      { event: { genres: ['Techno'] } },
      { event: {} },
    ]
    expect(genreProfile(items)).toEqual([{ genre: 'Techno', count: 2 }, { genre: 'House', count: 1 }])
  })
})

describe('YouTube Music', () => {
  const artist = (name: string) => ({ text: name, navigationEndpoint: { browseEndpoint: { browseEndpointContextSupportedConfigs: { browseEndpointContextMusicConfig: { pageType: 'MUSIC_PAGE_TYPE_ARTIST' } } } } })
  const row = (title: string, byline: object[]) => ({
    musicResponsiveListItemRenderer: {
      flexColumns: [
        { musicResponsiveListItemFlexColumnRenderer: { text: { runs: [{ text: title }] } } },
        { musicResponsiveListItemFlexColumnRenderer: { text: { runs: byline } } },
      ],
    },
  })
  const data = {
    header: { musicResponsiveHeaderRenderer: { title: { runs: [{ text: 'ADE warm-up' }] } } },
    contents: [
      row('BELLAKEO', [artist('Peso Pluma'), { text: ' & ' }, artist('Anitta')]),
      row('Home recording', [{ text: 'Some Uploader' }]),
    ],
    continuations: [{ nextContinuationData: { continuation: 'TOKEN123' } }],
  }
  // The page pushes its data as a \xNN-escaped JSON string.
  const escaped = JSON.stringify(data).replace(/[{}"[\]]/g, char => `\\x${char.charCodeAt(0).toString(16)}`)
  const html = `<script>"INNERTUBE_CLIENT_VERSION":"1.20260927"</script><script>initialData.push({path: '\\/guide', params: {}, data: '{}'});initialData.push({path: '\\/browse', params: {}, data: '${escaped}'});</script>`

  it('reads the playlist id from YouTube and YouTube Music links, not Liked music', () => {
    expect(youTubeMusicListId('https://music.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI&si=x')).toBe('PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')
    expect(youTubeMusicListId('https://www.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')).toBe('PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')
    expect(youTubeMusicListId('https://music.youtube.com/playlist?list=LM')).toBeNull()
    expect(youTubeMusicListId('https://evil.example.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')).toBeNull()
  })

  it('decodes the embedded page data into tracks, artists, title and next page', () => {
    const { data: parsed, clientVersion } = parseYouTubeMusicPage(html)
    expect(clientVersion).toBe('1.20260927')
    expect(youTubeMusicTracks(parsed)).toEqual([
      { title: 'BELLAKEO', artists: ['Peso Pluma', 'Anitta'] },
      { title: 'Home recording', artists: ['Some Uploader'] },
    ])
    expect(youTubeMusicTitle(parsed, html)).toBe('ADE warm-up')
    expect(youTubeMusicContinuation(parsed)).toBe('TOKEN123')
  })
})

describe('launch fixes', () => {
  it('puts a party starting after midnight under the night before', () => {
    const afterMidnight = { event: { id: 'n', startsAt: '2026-10-23T00:30:00+02:00', isParty: true } }
    const morningTalk = { event: { id: 't', startsAt: '2026-10-23T10:00:00+02:00', isParty: false } }
    expect(groupEventsByDay([afterMidnight, morningTalk]).map(day => [day.key, day.items.map(item => item.event.id)]))
      .toEqual([['2026-10-22', ['n']], ['2026-10-23', ['t']]])
  })

  it('merges artists ADE lists twice under the same name', () => {
    const twins: AdeData = {
      ...data,
      artists: [
        { id: 'a1', name: 'Ado', country: null, spotifyId: null, adeUrl: 'https://ade/a1', eventIds: ['e1'] },
        { id: 'a2', name: 'ADO', country: null, spotifyId: null, adeUrl: 'https://ade/a2', eventIds: ['e2'] },
      ],
    }
    const { matches } = matchArtists(twins, [{ name: 'Ado', weight: 1 }])
    expect(matches).toHaveLength(1)
    expect(matches[0]!.events.map(e => e.id)).toEqual(['e2', 'e1'])
  })
})

describe('browseDaytime', () => {
  const session = (id: string, title: string, kinds: string[], access: 'pro' | 'free') => ({
    id, title, subtitle: null, startsAt: '2026-10-21T13:00:00+02:00', endsAt: '2026-10-21T14:00:00+02:00', venue: 'Felix Meritis',
    categories: null, soldOut: false, adeUrl: `https://ade/${id}`, lineup: [], isParty: false, format: 'session' as const, access, kinds,
  })
  const daytime: AdeData = {
    ...data,
    events: [
      ...data.events,
      session('p1', 'Luciano In Conversation with Marcel Dettman', ['interviews'], 'pro'),
      session('p2', 'Meet The Agents', ['meet-the'], 'pro'),
      session('f1', 'Gear Test Lab', ['gear'], 'free'),
    ] as AdeData['events'],
  }
  const none = { q: '', day: '', topics: [], kinds: [], times: [], access: [], areas: [], genres: [] }

  it('always includes ADE Pro, and leaves parties out', () => {
    const result = browseDaytime(daytime, none)
    expect(result.sessions.map(event => event.id)).toEqual(['f1', 'p1', 'p2'])
    expect(result.facets.kinds.map(facet => facet.value).sort()).toEqual(['gear', 'interviews', 'meet-the'])
  })

  it('filters on kind, keeping the other kinds countable', () => {
    const result = browseDaytime(daytime, { ...none, kinds: ['interviews'] })
    expect(result.sessions.map(event => event.id)).toEqual(['p1'])
    expect(result.facets.kinds).toHaveLength(3)
  })
})

describe('spotifyGid', () => {
  it('turns a base62 track id into the 32-char hex id the metadata endpoint wants', () => {
    expect(spotifyGid('0mqBXBoD2Ph1liAfzetIZH')).toBe('0be2e821f45f4444a92e4ecce3a097f9')
    expect(spotifyGid('0000000000000000000001')).toBe('00000000000000000000000000000001')
  })
})

describe('matching on a one-artist event title', () => {
  it('finds an artist ADE misnamed, through the show named after them', () => {
    const misnamed: AdeData = {
      ...data,
      artists: [...data.artists, { id: '9', name: 'Nimino Banner', country: 'gb', spotifyId: null, adeUrl: 'https://ade/9', eventIds: ['e9'] }],
      events: [
        ...data.events,
        { id: 'e9', title: 'Nimino', subtitle: null, startsAt: '2026-10-22T19:30:00+02:00', endsAt: null, venue: 'Melkweg', categories: null, soldOut: false, adeUrl: 'https://ade/e9', lineup: ['9'] },
        { id: 'e10', title: 'MEDUZA', subtitle: null, startsAt: '2026-10-23T23:00:00+02:00', endsAt: null, venue: 'Club', categories: null, soldOut: false, adeUrl: 'https://ade/e10', lineup: ['1'] },
      ],
    }
    const { matches, unmatched } = matchArtists(misnamed, [{ name: 'nimino', weight: 1 }, { name: 'Drumcode', weight: 1 }, { name: 'Meduza', weight: 1 }])
    expect(matches.map(match => match.artist.name)).toEqual(['Nimino Banner'])
    // Drumcode has two artists; "MEDUZA" is a party with Adam Beyer on it, not the act.
    expect(unmatched).toEqual(['Drumcode', 'Meduza'])
  })
})

describe('did you mean', () => {
  it('finds the lineup name behind a typo, not behind a different artist', () => {
    const lineup = ['Enrico Sangiuliano', 'Dave Clarke', 'Amelie Lens', 'Adam Beyer', 'Fisher Price']
    expect(closestName('enrico sanguiliano', lineup)).toBe('Enrico Sangiuliano')
    expect(closestName('Dave Clark', lineup)).toBe('Dave Clarke')
    expect(closestName('Amelie Lense', lineup)).toBe('Amelie Lens')
    expect(closestName('Fisher', lineup)).toBeNull()
    expect(closestName('ABC', lineup)).toBeNull()
    expect(editDistance('sangiuliano', 'sanguiliano', 2)).toBe(1)
  })
})

describe('daytime search', () => {
  const session = (id: string, title: string, extra: Partial<AdeData['events'][number]>) => ({
    id, title, subtitle: null, startsAt: '2026-10-21T13:00:00+02:00', endsAt: '2026-10-21T14:00:00+02:00', venue: 'Felix Meritis',
    categories: null, soldOut: false, adeUrl: `https://ade/${id}`, lineup: [], isParty: false, format: 'session' as const, ...extra,
  })
  const daytime: AdeData = {
    ...data,
    events: [
      ...data.events.map(event => ({ ...event, genres: ['Hard Dance'] })),
      session('p1', 'Who Owns the Future?', { tags: ['Labels, Publishing & Sync'] }),
      session('p2', 'Deep House Listening', { genres: ['Deep House'] }),
    ] as AdeData['events'],
  }
  const none = { q: '', day: '', topics: [], kinds: [], times: [], access: [], areas: [], genres: [] }

  it('filters and counts by topic, and finds a topic by its label', () => {
    const withTopics: AdeData = { ...daytime, events: daytime.events.map(event => event.id === 'p1' ? { ...event, topics: ['labels-sync', 'legal-rights'] } : event) }
    const result = browseDaytime(withTopics, { ...none, topics: ['legal-rights'] })
    expect(result.sessions.map(event => event.id)).toEqual(['p1'])
    expect(result.facets.topics).toEqual([{ value: 'labels-sync', count: 1 }, { value: 'legal-rights', count: 1 }])
    expect(browseDaytime(withTopics, { ...none, q: 'legal' }).sessions.map(event => event.id)).toEqual(['p1'])
  })

  it('searches ADE tags and genres, not only titles', () => {
    expect(browseDaytime(daytime, { ...none, q: 'sync' }).sessions.map(event => event.id)).toEqual(['p1'])
    expect(browseDaytime(daytime, { ...none, q: 'deep house' }).sessions.map(event => event.id)).toEqual(['p2'])
  })

  it('points a party genre to the parties and suggests a fix for a typo', () => {
    expect(browseDaytime(daytime, { ...none, q: 'hard dance' }).partyGenres).toEqual([{ genre: 'Hard Dance', parties: 2 }])
    expect(browseDaytime(daytime, { ...none, q: 'publishng' }).didYouMean).toEqual(['Publishing'])
  })
})

describe('timetable', () => {
  it('puts an after-midnight party on the night before, past 24:00', () => {
    const party = { startsAt: '2026-10-24T01:00:00+02:00', endsAt: '2026-10-24T07:00:00+02:00', isParty: true }
    expect(planningDay(party)).toBe('2026-10-23')
    expect(minutesOnDay(party)).toEqual({ from: 1500, to: 1860 })
    const talk = { startsAt: '2026-10-22T11:15:00+02:00', endsAt: '2026-10-22T12:00:00+02:00', isParty: false }
    expect(planningDay(talk)).toBe('2026-10-22')
    expect(minutesOnDay(talk)).toEqual({ from: 675, to: 720 })
  })

  it('handles the switch to winter time on Sunday 25 October', () => {
    const late = { startsAt: '2026-10-25T01:00:00+02:00', endsAt: '2026-10-25T06:00:00+01:00', isParty: true }
    expect(planningDay(late)).toBe('2026-10-24')
    expect(minutesOnDay(late)).toEqual({ from: 1500, to: 1860 })
  })

  it('gives overlapping sessions their own room and finds clashes', () => {
    const items = [{ id: 'a', from: 600, to: 660 }, { id: 'b', from: 630, to: 690 }, { id: 'c', from: 660, to: 700 }]
    const { items: placed, lanes } = layoutLanes(items)
    expect(lanes).toBe(2)
    expect(placed.map(item => [item.id, item.lane])).toEqual([['a', 0], ['b', 1], ['c', 0]])
    expect(findClashes(items).map(([x, y]) => x.id + y.id)).toEqual(['ab', 'bc'])
  })

  it('writes a calendar file with escaped text and CRLF lines', () => {
    const ics = toIcs([{ id: 'e1', title: 'Drumcode, Awakenings', startsAt: '2026-10-22T23:00:00+02:00', endsAt: null, venue: 'Gashouder', address: 'Klönneplein 1, Amsterdam', adeUrl: 'https://ade/e1' }], new Date('2026-10-01T00:00:00Z'))
    expect(ics).toContain('SUMMARY:Drumcode\\, Awakenings\r\n')
    expect(ics).toContain('DTSTART:20261022T210000Z\r\nDTEND:20261022T220000Z')
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
  })
})

describe('venues and travel', () => {
  const felix = { lat: 52.36999, lng: 4.88428 }
  const nextDoor = { lat: 52.3672, lng: 4.8843 } // ~300 m down the Keizersgracht
  const ndsm = { lat: 52.39939, lng: 4.89482, acrossIj: true }

  it('walks short hops, bikes longer ones and adds the ferry across the IJ', () => {
    expect(travel(felix, nextDoor)).toMatchObject({ mode: 'walk', ferry: false })
    const north = travel(felix, ndsm)
    expect(north).toMatchObject({ mode: 'bike', ferry: true })
    expect(north.minutes).toBeGreaterThan(20)
    expect(describeTrip(north)).toMatch(/^~\d+ min by bike, incl\. the ferry$/)
  })

  it('gives events their venue place and fills a missing area from the venue', () => {
    const joined = withVenues({ ...data, venues: [{ name: 'Gashouder', lat: 52.385, lng: 4.873, area: 'West' }] })
    const drumcode = joined.events.find(event => event.id === 'e1')!
    expect(drumcode.area).toBe('West')
    expect(drumcode.place).toMatchObject({ lat: 52.385, lng: 4.873, acrossIj: false })
    expect(joined.events.find(event => event.id === 'e2')!.place).toBeUndefined()
  })
})

describe('nearby', () => {
  it('lists events starting in the next two hours, nearest first', () => {
    const at = new Date('2026-10-22T19:30:00+02:00')
    const place = (lat: number, lng: number) => ({ lat, lng })
    const nearbyData: AdeData = {
      ...data,
      events: [
        { ...data.events[1]!, id: 'soon-far', startsAt: '2026-10-22T20:00:00+02:00', place: place(52.39, 4.85) },
        { ...data.events[1]!, id: 'soon-close', startsAt: '2026-10-22T21:00:00+02:00', place: place(52.371, 4.885) },
        { ...data.events[1]!, id: 'later', startsAt: '2026-10-22T23:00:00+02:00', place: place(52.37, 4.884) },
        { ...data.events[1]!, id: 'no-place', startsAt: '2026-10-22T20:00:00+02:00' },
      ] as AdeData['events'],
    }
    const result = eventsNearby(nearbyData, at, { lat: 52.37, lng: 4.884 })
    expect(result.map(item => item.event.id)).toEqual(['soon-close', 'soon-far'])
    expect(result[0]!.startsInMinutes).toBe(90)
  })
})

describe('mergeDuplicateEvents', () => {
  const at = '2026-10-24T13:00:00+02:00'
  const base = { subtitle: null, endsAt: null, categories: null, soldOut: false, startsAt: at }
  const dupData: AdeData = {
    source: 'snapshot',
    artists: [{ id: 'a1', name: 'Act One', country: null, spotifyId: null, adeUrl: 'https://ade/a1', eventIds: ['mystic', 'dockyard'] }],
    events: [
      { ...base, id: 'mystic', title: 'Mystic Garden Festival ADE', venue: 'Havenpark', adeUrl: 'https://ade/mystic', ticketUrl: null, favorites: 2, lineup: ['a1', 'a2'] },
      { ...base, id: 'dockyard', title: 'Dockyard Festival ADE', venue: 'Havenpark', adeUrl: 'https://ade/dockyard', ticketUrl: 'https://shop', favorites: 1, lineup: ['a2', 'a1'] },
      // Parallel rooms: same venue and time, no lineup. Not the same show.
      { ...base, id: 'room-a', title: 'Meet the Makers | A', venue: 'Midi', adeUrl: 'https://ade/ra', lineup: [] },
      { ...base, id: 'room-b', title: 'Meet the Makers | B', venue: 'Midi', adeUrl: 'https://ade/rb', lineup: [] },
      // Same lineup and time somewhere else: two shows.
      { ...base, id: 'elsewhere', title: 'Other', venue: 'Paradiso', adeUrl: 'https://ade/o', lineup: ['a1', 'a2'] },
    ],
  }

  it('folds one show listed twice into the listing with tickets, keeping both names and stars', () => {
    const merged = mergeDuplicateEvents(dupData)
    expect(merged.events.map(e => e.id)).toEqual(['dockyard', 'room-a', 'room-b', 'elsewhere'])
    const show = merged.events[0]!
    expect(show.title).toBe('Dockyard Festival ADE / Mystic Garden Festival ADE')
    expect(show.favorites).toBe(3)
    expect(show.alsoListedAs).toEqual([{ id: 'mystic', title: 'Mystic Garden Festival ADE', adeUrl: 'https://ade/mystic', ticketUrl: null }])
    expect(merged.artists[0]!.eventIds).toEqual(['dockyard'])
    expect(resolveEventId(merged, 'mystic')).toBe('dockyard')
    expect(resolveEventId(merged, 'room-a')).toBe('room-a')
  })

  it('keeps one name when one title contains the other', () => {
    const merged = mergeDuplicateEvents({
      ...dupData,
      events: [
        { ...base, id: 'v1', title: 'Vault Sessions x SK_eleven | Blast Galaxy', venue: 'Blast Galaxy', adeUrl: 'https://ade/v1', ticketUrl: 'https://vault', lineup: ['a1', 'a2'] },
        { ...base, id: 'v2', title: 'Vault Sessions x SK_eleven', venue: 'Blast Galaxy', adeUrl: 'https://ade/v2', lineup: ['a1', 'a2'] },
      ],
    })
    expect(merged.events.map(e => [e.id, e.title])).toEqual([['v1', 'Vault Sessions x SK_eleven | Blast Galaxy']])
  })

  it('leaves the data alone when nothing is listed twice', () => {
    expect(mergeDuplicateEvents(data)).toBe(data)
  })
})

describe('shared plan links', () => {
  const ids = ['17dd0fd6-f257-4bad-ac53-5c4979a1717c', 'a1ca9b40-c664-4f45-8418-8f87a73691d5', '835fbc7f-b702-4f93-bc6f-12baa0ab1f12']

  it('packs each event id into 22 URL-safe characters and back', () => {
    const plan = encodePlan(ids)
    expect(plan).toHaveLength(66)
    expect(plan).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodePlan(plan)).toEqual(ids)
  })

  it('drops ids it cannot pack and links it cannot read', () => {
    expect(encodePlan(['e1', ids[0]!, ids[0]!])).toHaveLength(22)
    expect(decodePlan('not a plan!')).toEqual([])
    expect(decodePlan(`${encodePlan([ids[0]!])}abc`)).toEqual([ids[0]])
  })

  it('returns the events with their lineup, following merged duplicates', () => {
    const at = '2026-10-24T13:00:00+02:00'
    const base = { subtitle: null, endsAt: null, categories: null, soldOut: false, startsAt: at, venue: 'Havenpark' }
    const merged = mergeDuplicateEvents({
      source: 'snapshot',
      artists: [
        { id: 'a1', name: 'Dax J', country: null, spotifyId: null, adeUrl: 'https://ade/a1', eventIds: [ids[0]!, ids[1]!] },
        { id: 'a2', name: 'BLANKA', country: null, spotifyId: null, adeUrl: 'https://ade/a2', eventIds: [ids[0]!, ids[1]!] },
      ],
      events: [
        { ...base, id: ids[0]!, title: 'Dockyard Festival ADE', adeUrl: 'https://ade/d', ticketUrl: 'https://shop', lineup: ['a1', 'a2'] },
        { ...base, id: ids[1]!, title: 'Mystic Garden Festival ADE', adeUrl: 'https://ade/m', lineup: ['a1', 'a2'] },
      ],
    })
    // The Mystic Garden id was merged into Dockyard; the third id isn't on the program.
    const { events, missing } = sharedPlanEvents(merged, ids)
    expect(events.map(e => [e.id, e.lineupNames])).toEqual([[ids[0], ['BLANKA', 'Dax J']]])
    expect(missing).toBe(1)
  })
})

describe('ticket price bands', () => {
  const free = { ticketStatus: 'free' }
  const freeTicket = { ticketStatus: 'available', categories: 'Free Festival Events / Intimate venues' }
  const cheap = { ticketStatus: 'available', priceFrom: 12.5 }
  const pricey = { ticketStatus: 'available', priceFrom: 45 }
  const unknown = { ticketStatus: 'available' }
  const soldOut = { ticketStatus: 'sold out', priceFrom: 10 }

  it('labels what entry costs', () => {
    expect([free, freeTicket, cheap, unknown, soldOut].map(priceLabel)).toEqual(['Free', 'Free, get a ticket', 'From €12.50', '', ''])
    expect(priceLabel({ ticketStatus: 'available', priceFrom: 0 })).toBe('Free, get a ticket')
  })

  it('filters by budget: free always passes, unknown prices only without a budget', () => {
    const all = [free, freeTicket, cheap, pricey, unknown, soldOut]
    expect(all.filter(event => withinBudget(event, ''))).toHaveLength(6)
    expect(all.filter(event => withinBudget(event, 'free'))).toEqual([free, freeTicket])
    expect(all.filter(event => withinBudget(event, '25'))).toEqual([free, freeTicket, cheap])
    expect(all.filter(event => withinBudget(event, '50'))).toEqual([free, freeTicket, cheap, pricey])
    expect(withinBudget({ ticketStatus: 'available', priceFrom: 25 }, '25')).toBe(false)
  })
})

describe('usage keys for VAMS feature counts', () => {
  it('keeps the event name and one safe detail', () => {
    expect(usageKey('ade-budget', { budget: '25', results: 4 })).toBe('ade-budget:25')
    expect(usageKey('ade-tab', { tab: 'daytime' })).toBe('ade-tab:daytime')
    expect(usageKey('ade-free-open', { events: 67 })).toBe('ade-free-open')
    expect(usageKey('ade-story-image', { result: 'Downloaded!', saved: 3 })).toBe('ade-story-image:downloaded')
  })
})

describe('party vibe and size labels', () => {
  it('describes laid-back and sized parties, nothing for daytime', () => {
    expect(vibeLabel({ isParty: true, vibe: 'laid-back', size: 'intimate' })).toBe('Laid-back · Intimate venue')
    expect(vibeLabel({ isParty: true, vibe: 'club', size: 'large' })).toBe('Large venue')
    expect(vibeLabel({ isParty: false, vibe: null, size: 'mid-size' })).toBe('')
    expect(usageKey('ade-budget-filter', { group: 'vibe-laid-back' })).toBe('ade-budget-filter:vibe-laid-back')
  })
})

describe('ADE SEO pages', () => {
  it('slugs artist names for URLs', () => {
    expect(slugify('Âme & Dixon (live)')).toBe('ame-and-dixon-live')
    expect(slugify('[IVY]')).toBe('ivy')
  })
  it('puts after-midnight parties on the night before', () => {
    expect(planningDate({ startsAt: '2026-10-24T02:00:00+02:00', isParty: true })).toBe('2026-10-23')
    expect(planningDate({ startsAt: '2026-10-24T02:00:00+02:00', isParty: false })).toBe('2026-10-24')
  })
})

describe("What's left", () => {
  const base = { lineup: [], isParty: true, format: 'session', startsAt: '2026-10-24T23:00:00+02:00', endsAt: '2026-10-25T05:00:00+02:00' }
  const data = {
    source: 'snapshot',
    artists: [{ id: 'a1', name: 'A', eventIds: [], hits: 30 }],
    venues: [],
    events: [
      { ...base, id: 'sold', title: 'Sold', ticketStatus: 'sold out', soldOut: true },
      { ...base, id: 'cheap', title: 'Cheap', ticketStatus: 'available', priceFrom: 15, startsAt: '2026-10-24T20:00:00+02:00' },
      { ...base, id: 'hot', title: 'Hot', ticketStatus: 'available', priceFrom: 45, favorites: 5, lineup: ['a1'] },
      { ...base, id: 'free', title: 'Free', ticketStatus: 'free' },
      { ...base, id: 'talk', title: 'Talk', ticketStatus: 'free', isParty: false },
      { ...base, id: 'unknown', title: 'Door', ticketStatus: 'unknown' },
    ],
  }
  it('keeps parties with tickets left, most wanted first, and counts each price', () => {
    const left = whatsLeft(data, '2026-10-24', '', new Date('2026-10-24T12:00:00+02:00'))
    expect(left.events.map(event => event.id)).toEqual(['hot', 'cheap', 'free'])
    expect(left.counts).toEqual({ any: 3, 50: 3, 25: 2, free: 1 })
    expect(whatsLeft(data, '2026-10-24', '25', new Date('2026-10-24T12:00:00+02:00')).events.map(event => event.id)).toEqual(['cheap', 'free'])
  })
  it('drops parties that are already over', () => {
    expect(whatsLeft(data, '2026-10-24', '', new Date('2026-10-25T06:00:00+02:00')).total).toBe(0)
  })
})
