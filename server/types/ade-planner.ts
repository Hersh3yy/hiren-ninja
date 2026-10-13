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
  /** where the venue is (VAMS ade-venue, geocoded): for maps and travel times */
  place?: VenuePlace | null
  address?: string | null
  tags?: string[]
  /** derived by VAMS AdeEventClassifier on every sync */
  kinds?: EventKind[]
  /** daytime topic slugs (shared/ade-topics.js), classified per event in VAMS */
  topics?: string[]
  /** lowest ticket on sale in euros, from Weeztix or Resident Advisor (VAMS ade:prices) */
  priceFrom?: number | null
  priceSource?: 'weeztix' | 'ra' | null
  /** people who starred it in ADE Planner (VAMS counter) */
  favorites?: number
  intent?: Intent
  timeOfDay?: TimeOfDay
  isParty?: boolean
  access?: Access
  format?: 'session' | 'drop-in' | 'tba'
  durationMinutes?: number | null
  /** same event at the same venue on several days */
  series?: string | null
  seriesDates?: string[]
  /** other ADE listings of this same show, folded into this one (duplicates.ts) */
  alsoListedAs?: { id: string, title: string, adeUrl: string, ticketUrl: string | null }[]
}

export type Intent = 'party' | 'learn' | 'meet' | 'listen' | 'recharge' | 'other'

export type TicketStatus = 'available' | 'sold out' | 'free' | 'pro pass' | 'unknown'

export type EventKind = 'talks' | 'interviews' | 'masterclasses' | 'gear' | 'listening' | 'showcases' | 'instore'
  | 'meet-the' | 'networking' | 'art' | 'film' | 'wellbeing' | 'performances' | 'culture'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all-day' | 'tba'

export type Access = 'free' | 'ticket' | 'pro'

export interface BrowseFilters {
  q: string
  /** YYYY-MM-DD in Amsterdam; empty = every day */
  day: string
  kinds: EventKind[]
  topics: string[]
  times: TimeOfDay[]
  access: Access[]
  areas: string[]
  genres: string[]
}

export interface Facet { value: string, count: number }

export interface BrowseResult {
  /** artists named in the search who play parties, which this tab leaves out */
  partyArtists: { name: string, parties: number }[]
  /** genres searched here that only parties have, e.g. hardstyle */
  partyGenres: { genre: string, parties: number }[]
  /** probable typos, corrected to a daytime speaker, artist or label */
  didYouMean: string[]
  total: number
  sessions: MatchedEvent[]
  dropIns: MatchedEvent[]
  tba: MatchedEvent[]
  days: Facet[]
  facets: Record<'topics' | 'kinds' | 'times' | 'access' | 'areas' | 'genres', Facet[]>
}

export interface MatchedEvent extends AdeEvent {
  lineupNames: string[]
}

export interface VenuePlace {
  lat: number
  lng: number
  neighbourhood?: string | null
  /** north of the IJ: the ferry from the centre */
  acrossIj?: boolean
}

export interface AdeVenue extends Partial<VenuePlace> {
  name: string
  address?: string | null
  /** Amsterdam district in English (Centre, North, ...) or the town */
  area?: string | null
}

export interface AdeData {
  source: 'vams' | 'snapshot'
  artists: AdeArtist[]
  events: AdeEvent[]
  venues?: AdeVenue[]
  /** dropped duplicate event id -> the id it was merged into */
  aliases?: Record<string, string>
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
  source: 'spotify' | 'apple-music' | 'youtube-music' | 'tidal' | 'deezer'
  title: string
  trackCount: number
  /** the service stopped us before the end of the playlist */
  partial?: boolean
  /** tracks in the playlist; more than trackCount when we stopped at our own cap */
  totalTracks?: number
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
