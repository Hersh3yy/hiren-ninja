export interface AdeArtist {
  id: string
  name: string
  country: string | null
  spotifyId: string | null
  adeUrl: string
  eventIds: string[]
}

export interface AdeEvent {
  id: string
  title: string
  subtitle: string | null
  startsAt: string
  endsAt: string | null
  venue: string | null
  categories: string | null
  soldOut: boolean
  adeUrl: string
}

export interface AdeData {
  source: 'vams' | 'snapshot'
  artists: AdeArtist[]
  events: AdeEvent[]
}

export type MatchType = 'exact' | 'part-of-act'

export interface ArtistMatch {
  query: string
  weight: number
  matchType: MatchType
  artist: AdeArtist
  events: AdeEvent[]
}

export interface MatchResult {
  matches: ArtistMatch[]
  unmatched: string[]
}

export interface PlaylistArtists {
  source: 'spotify' | 'apple-music'
  title: string
  trackCount: number
  artists: { name: string, tracks: number }[]
}
