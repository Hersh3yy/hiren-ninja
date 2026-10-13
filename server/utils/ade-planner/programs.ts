// ADE's daytime programmes. ADE Pro (conference, mostly in the city centre: Felix
// Meritis, Andaz, Rosewood) and ADE Lab (demos, listening sessions and hubs around
// Westergas in Westerpark) both come in as program 'pro'; Lab carries ADE's
// "ADE Lab" category. The app imports this file too.

interface Programmed {
  program?: string
  tags?: string[]
  categories?: string | null
}

export const isAdeLab = (event: Programmed): boolean =>
  (event.tags ?? []).includes('ADE Lab') || /(^|\/)\s*ADE Lab\s*(\/|$)/.test(event.categories ?? '')

/** 'lab', 'pro' or 'festival' (other daytime events) */
export function daytimeProgram(event: Programmed): 'lab' | 'pro' | 'festival' {
  if (isAdeLab(event)) return 'lab'
  return event.program === 'pro' ? 'pro' : 'festival'
}

export const PROGRAM_LABELS = Object.freeze({ pro: 'ADE Pro', lab: 'ADE Lab', festival: '' })
