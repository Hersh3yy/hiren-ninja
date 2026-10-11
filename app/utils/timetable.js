// Timetable maths for ADE Planner: which day an event belongs to, where it sits on
// that day's clock, which "room" (lane) it gets when sessions overlap, and clashes.

const TIME_ZONE = 'Europe/Amsterdam'
const NIGHT_ENDS_AT = 6

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const clockFormat = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

function amsterdamMinutes(date) {
  const [hours, minutes] = clockFormat.format(date).split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * The day an event is planned under: a party starting before 06:00 belongs to the
 * night before (Friday 00:30 is "Thursday night"), daytime events to their own day.
 */
export function planningDay(event) {
  const start = new Date(event.startsAt)
  const shift = event.isParty !== false && amsterdamMinutes(start) < NIGHT_ENDS_AT * 60 ? NIGHT_ENDS_AT * 3600_000 : 0
  return dayKeyFormat.format(new Date(start.getTime() - shift))
}

/**
 * Start and end in minutes from midnight of the planning day, so a party from 23:00
 * to 07:00 is 1380-1860 and sorts after the evening. A missing or broken end gets
 * `fallbackMinutes`.
 */
export function minutesOnDay(event, fallbackMinutes = 60) {
  const start = new Date(event.startsAt)
  const dayStart = new Date(`${planningDay(event)}T00:00:00`)
  // Minutes between the planning day's local midnight and the start, in Amsterdam time.
  const startDayKey = dayKeyFormat.format(start)
  const daysAfter = Math.round((new Date(`${startDayKey}T00:00:00`) - dayStart) / 86_400_000)
  const from = daysAfter * 1440 + amsterdamMinutes(start)
  const duration = event.endsAt ? (new Date(event.endsAt) - start) / 60_000 : 0
  const to = from + (duration > 0 ? duration : fallbackMinutes)
  return { from, to }
}

/**
 * Give overlapping items their own lane, like rooms in a school timetable:
 * items sorted by start, each placed in the first lane that is free by then.
 * Returns items with `lane` plus the number of lanes used.
 */
export function layoutLanes(items) {
  const laneEnds = []
  const placed = [...items]
    .sort((a, b) => a.from - b.from || b.to - a.to)
    .map((item) => {
      let lane = laneEnds.findIndex(end => end <= item.from)
      if (lane === -1) {
        lane = laneEnds.length
        laneEnds.push(item.to)
      } else {
        laneEnds[lane] = item.to
      }
      return { ...item, lane }
    })
  return { items: placed, lanes: Math.max(1, laneEnds.length) }
}

/** Pairs of items on the same day that overlap in time, for "you can't be in two places". */
export function findClashes(items) {
  const sorted = [...items].sort((a, b) => a.from - b.from)
  const clashes = []
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length && sorted[j].from < sorted[i].to; j++) {
      clashes.push([sorted[i], sorted[j]])
    }
  }
  return clashes
}

export function formatMinutes(minutes) {
  const value = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

const icsEscape = text => String(text ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
const icsDate = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** An iCalendar file with every saved event, for "Add to calendar". */
export function toIcs(events, now = new Date()) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//hiren.ninja//ADE Planner//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:My ADE 2026'
  ]
  for (const event of events) {
    const end = event.endsAt && new Date(event.endsAt) > new Date(event.startsAt)
      ? event.endsAt
      : new Date(new Date(event.startsAt).getTime() + 60 * 60_000).toISOString()
    const people = (event.lineupNames ?? event.artists ?? []).slice(0, 12).join(', ')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@ade-planner.hiren.ninja`,
      `DTSTAMP:${icsDate(now.toISOString())}`,
      `DTSTART:${icsDate(event.startsAt)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsEscape(event.title)}`,
      `LOCATION:${icsEscape([event.venue, event.address].filter(Boolean).join(', '))}`,
      `DESCRIPTION:${icsEscape([people && `With ${people}`, event.adeUrl].filter(Boolean).join('\n'))}`,
      event.adeUrl ? `URL:${event.adeUrl}` : '',
      'END:VEVENT'
    )
  }
  lines.push('END:VCALENDAR')
  // iCalendar wants CRLF line ends.
  return lines.filter(Boolean).join('\r\n') + '\r\n'
}

const TOPIC_GROUP = {
  business: 'business', 'labels-sync': 'business', 'marketing-fans': 'business', 'live-events': 'business', 'legal-rights': 'business',
  'artist-careers': 'artists', 'scenes-regions': 'artists', 'culture-history': 'artists', 'listening-showcases': 'artists',
  'tech-ai': 'tech', startups: 'tech', 'production-djing': 'tech',
  'sustainability-impact': 'impact', 'art-immersive': 'impact', 'wellbeing-movement': 'impact',
  networking: 'meet'
}

/** The colour group of an event in a timetable: its first topic, or "party". */
export function timetableTone(event) {
  if (event.isParty !== false) return 'party'
  return TOPIC_GROUP[event.topics?.[0]] ?? 'meet'
}

export const TONE_LABELS = {
  business: 'Business, labels, live, legal',
  artists: 'Artists, scenes, culture, showcases',
  tech: 'Tech, AI, startups, production',
  impact: 'Impact, art, wellbeing',
  meet: 'Networking',
  party: 'Parties & concerts'
}
