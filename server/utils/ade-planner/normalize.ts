const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g
const COMBINING_MARKS = /[\u0300-\u036F]/g

/** Lowercase, accent-free, punctuation-free key for comparing artist names. */
export function normalizeArtistName(name: string): string {
  return name
    .replace(ZERO_WIDTH, '')
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/^the /, '')
}

/** "HI-LO", "Hi Lo" and "HiLo" all become "hilo". */
export function compactArtistName(name: string): string {
  return normalizeArtistName(name).replace(/ /g, '')
}

/** "Mr. Belt & Wezol" -> ["Mr. Belt", "Wezol"]. Returns [] for a single act. */
export function splitCompositeAct(name: string): string[] {
  const parts = name
    .split(/\s+(?:&|\+|b2b|x|vs\.?)\s+/i)
    .map(part => part.trim())
    .filter(Boolean)

  return parts.length > 1 ? parts : []
}

/** Edit distance (insert, delete, change, swap two neighbours), giving up past `max`. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prevPrev: number[] = []
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, prevPrev[j - 2]! + 1)
      row.push(value)
      best = Math.min(best, value)
    }
    if (best > max) return max + 1
    prevPrev = prev
    prev = row
  }
  return prev[b.length]!
}

/**
 * The closest name for a probable typo ("enrico sanguiliano" -> "Enrico Sangiuliano"),
 * or null. Short names need to be closer: one slip under 7 letters, two from 7 on.
 */
export function closestName(query: string, candidates: Iterable<string>): string | null {
  const key = normalizeArtistName(query)
  if (key.length < 4) return null
  const max = key.length < 7 ? 1 : 2
  let best: { name: string, distance: number } | null = null
  for (const name of candidates) {
    const distance = editDistance(key, normalizeArtistName(name), max)
    if (distance <= max && distance > 0 && (!best || distance < best.distance)) best = { name, distance }
  }
  return best?.name ?? null
}
