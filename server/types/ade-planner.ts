export interface AdeArtist {
  id: string
  name: string
  role?: 'artist' | 'speaker' | 'artist and speaker'
  /** speakers: job and company */
  subtitle?: string | null
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
  program?: 'festival' | 'pro'
  ticketStatus?: TicketStatus
  ticketUrl?: string | null
  ticketLabel?: string | null
  genres?: string[]
  eventTypes?: string[]
  area?: string | null
  address?: string | null
  tags?: string[]
  /** derived by VAMS AdeEventClassifier on every sync */
  kinds?: EventKind[]
  intent?: Intent
  timeOfDay?: TimeOfDay
  isParty?: boolean
  access?: Access
  format?: 'session' | 'drop-in' | 'tba'
  durationMinutes?: number | null
  /** same event at the same venue on several days */
  series?: string | null
  seriesDates?: string[]
}

export type Intent = 'party' | 'learn' | 'meet' | 'listen' | 'recharge' | 'other'

export type TicketStatus = 'available' | 'sold out' | 'free' | 'pro pass' | 'unknown'

export type EventKind = 'talks' | 'masterclasses' | 'gear' | 'listening' | 'showcases' | 'instore'
  | 'networking' | 'art' | 'film' | 'wellbeing' | 'culture'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all-day' | 'tba'

export type Access = 'free' | 'ticket' | 'pro'

export interface BrowseFilters {
  q: string
  /** YYYY-MM-DD in Amsterdam; empty = every day */
  day: string
  hasProPass: boolean
  intents: Intent[]
  kinds: EventKind[]
  times: TimeOfDay[]
  access: Access[]
  areas: string[]
  genres: string[]
}

export interface Facet { value: string, count: number }

export interface BrowseResult {
  /** artists named in the search who play parties, which this tab leaves out */
  partyArtists: { name: string, parties: number }[]
  total: number
  sessions: MatchedEvent[]
  dropIns: MatchedEvent[]
  tba: MatchedEvent[]
  days: Facet[]
  facets: Record<'intents' | 'kinds' | 'times' | 'access' | 'areas' | 'genres', Facet[]>
}

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
  source: 'spotify' | 'apple-music' | 'youtube-music'
  title: string
  trackCount: number
  /** the service stopped us before the end of the playlist */
  partial?: boolean
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
