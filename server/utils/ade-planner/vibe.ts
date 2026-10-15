// How wild a party is and how big the room, classified per event in VAMS on every
// sync (AdeEventClassifier: vibe, size). The app imports this file too.

export const VIBES = Object.freeze([
  { value: 'club', label: 'Club nights', short: 'Club night' },
  { value: 'laid-back', label: 'Laid-back', short: 'Laid-back' },
])

export const SIZES = Object.freeze([
  { value: 'intimate', label: 'Intimate', short: 'Intimate venue' },
  { value: 'mid-size', label: 'Mid-size', short: 'Mid-size venue' },
  { value: 'large', label: 'Large', short: 'Large venue' },
])

const short = (list: readonly { value: string, short: string }[], value?: string | null): string =>
  list.find(item => item.value === value)?.short ?? ''

/** "Laid-back · Intimate venue" for a party, '' otherwise. */
export function vibeLabel(event: { isParty?: boolean, vibe?: string | null, size?: string | null }): string {
  if (event.isParty === false) return ''
  return [event.vibe === 'laid-back' ? short(VIBES, event.vibe) : '', short(SIZES, event.size)].filter(Boolean).join(' · ')
}
