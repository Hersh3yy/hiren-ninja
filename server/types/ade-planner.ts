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
  /** ade-artist ids on this event */
  lineup: string[]
  ticketStatus?: TicketStatus
  ticketUrl?: string | null
  ticketLabel?: string | null
  genres?: string[]
  eventTypes?: string[]
  area?: string | null
  address?: string | null
}

export type TicketStatus = 'available' | 'sold out' | 'free' | 'unknown'

export interface MatchedEvent extends AdeEvent {
  lineupNames: string[]
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
  events: MatchedEvent[]
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

export interface SuggestionReason {
  kind: 'similar' | 'same-bill'
  /** the user's artist this suggestion comes from */
  via: string
}

export interface Suggestion {
  artist: AdeArtist
  events: MatchedEvent[]
  score: number
  reasons: SuggestionReason[]
}
