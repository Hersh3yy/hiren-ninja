import { describe, expect, it } from 'vitest'
import { normalizeArtistName, splitCompositeAct } from '../server/utils/ade-planner/normalize'
import { matchArtists } from '../server/utils/ade-planner/match'
import { browseDaytime } from '../server/utils/ade-planner/browse'
import { spotifyGid } from '../server/utils/ade-planner/playlist'
import { genreProfile, groupByDay, groupEventsByDay, parseArtistList } from '../app/composables/useAdePlanner.js'
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
  const none = { q: '', day: '', kinds: [], times: [], access: [], areas: [], genres: [] }

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
