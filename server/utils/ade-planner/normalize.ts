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
