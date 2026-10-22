import { loadAdeData } from '../../utils/ade-planner/data'
import { askGemini } from '../../utils/ade-planner/gemini'
import { ADE_DAYS, withLineupNames } from '../../utils/ade-planner/seo'
import {
  applyFilters, describeSlot, heuristicSlots, PERIODS, sanitizeSlots, selectEvents, todayInAmsterdam,
  type AskFilters, type Slot,
} from '../../utils/ade-planner/shortlist'
import { recordAdeStats } from '../../utils/ade-planner/stats'

// Netlify stops a function after ~10 s. Gemini 3.8 Flash takes 2-10 s and is often busy,
// so it gets one call (reading the request) and everything after it is plain code.
const PARSE_MS = 6_000
const PROMPT_PICKS = 10 // per slot, when someone typed what they want
const FILTER_PICKS = 25 // per slot, filters only

const text = (value: unknown, max: number): string => (typeof value === 'string' ? value.trim().slice(0, max) : '')

function readFilters(value: unknown, today: string): AskFilters {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const [slot] = sanitizeSlots([{ day: raw.day, what: raw.what, areas: raw.areas, budget: raw.budget }], today)
  return {
    day: typeof raw.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.day) ? raw.day : undefined,
    period: typeof raw.period === 'string' && raw.period in PERIODS ? raw.period as AskFilters['period'] : undefined,
    what: slot?.what.length ? slot.what : undefined,
    areas: slot?.areas.length ? slot.areas : undefined,
    budget: slot?.budget || undefined,
  }
}

const hasFilters = (filters: AskFilters): boolean => Boolean(filters.day || filters.period || filters.what || filters.areas || filters.budget)

function parsePrompt(prompt: string, today: string): string {
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'long' }).format(now)
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
  return `You read a visitor's request for the Amsterdam Dance Event (ADE) programme and turn it into search slots.
Now: ${weekday} ${today}, ${clock} Amsterdam time. ADE days: ${ADE_DAYS.map(day => day.date).join(', ')}.

Return JSON {"slots":[...]} with 1 to 3 slots, one per separate thing asked for ("daytime tomorrow" and "a night out tonight" are two). Each slot:
{"day":"YYYY-MM-DD","from":"HH:MM"|null,"to":"HH:MM"|null,"what":[...],"areas":[...],"budget":""|"free"|"25"|"50","taste":"..."}
- "from"/"to" bound the START time. "around 8pm" -> from 19:00. Daytime or afternoon -> 09:00 to 18:00. "tonight"/"evening" -> from 18:00. null when no time is implied.
- "what" uses only: parties, talks (talks, interviews, panels), demos (gear and brand demos, workshops), listening, networking. Empty when open. A music night (techno, house) means parties.
- "areas" uses only: west (West and Nieuw-West), harbour (Westpoort), centre, north, east, south, south-east (Zuidoost). Empty when open. A place named once applies to every slot unless another is named.
- "budget": "free", "25" (cheap) or "50". Empty when no price is implied.
- "taste": genres, moods or names the visitor likes, comma-separated, max 6 words, else "".
"today"/"tonight" mean ${today}; "tomorrow" is the day after. Reply with the JSON only.

Request: ${JSON.stringify(prompt)}`
}

export default defineEventHandler(async (event) => {
  rateLimit(event, 'ask', 10, 60)
  const body = await readBody<{ prompt?: unknown, filters?: unknown }>(event)
  const started = Date.now()
  const today = todayInAmsterdam()
  const prompt = text(body?.prompt, 400)
  const filters = readFilters(body?.filters, today)

  if (!prompt && !hasFilters(filters)) {
    throw createError({ statusCode: 400, statusMessage: 'Type what you are after, or pick a day, place or kind of event.' })
  }

  const data = await loadAdeData()

  let slots: Slot[] = []
  let source: 'ai' | 'rules' = 'rules'
  if (prompt) {
    const parsed = await askGemini<{ slots?: unknown }>(parsePrompt(prompt, today), started + PARSE_MS)
    slots = sanitizeSlots(parsed?.slots, today)
    if (slots.length) source = 'ai'
    else {
      const genres = [...new Set(data.events.flatMap(item => item.genres ?? []).map(genre => genre.toLowerCase()))]
      slots = heuristicSlots(prompt, today, ADE_DAYS.map(day => day.date), genres)
    }
  }
  slots = applyFilters(slots, filters, today)

  const picks = prompt ? PROMPT_PICKS : FILTER_PICKS
  const groups = slots.map((slot, index) => {
    const all = selectEvents(data.events, slot)
    return {
      key: `slot-${index}`,
      ...describeSlot(slot, today),
      total: all.length,
      items: withLineupNames(data, all.slice(0, picks)).map(card => ({ event: card, why: '' })),
    }
  })

  const shown = groups.reduce((sum, group) => sum + group.items.length, 0)
  // What was asked, never who. Kind 'daytime' because VAMS' ade-search log has no kind for this yet.
  await Promise.race([
    recordAdeStats(data, { search: { kind: 'daytime', source: 'daytime', query: `ask (${source}): ${prompt || groups.map(group => group.summary).join(' | ')}`.slice(0, 600), resultCount: shown } }),
    new Promise(resolve => setTimeout(resolve, 1_200)),
  ])

  return { source, tookMs: Date.now() - started, groups }
})
