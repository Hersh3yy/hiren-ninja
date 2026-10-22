#!/usr/bin/env node
/* eslint-disable no-console -- a terminal tool */
// Short, opinionated ADE schedule for one part of town, picked by Gemini Flash.
//
//   GEMINI_API_KEY=... node scripts/ade-west.mjs "techno, free or cheap, nothing before 20:00"
//   node scripts/ade-west.mjs --no-ai                 # plain schedule, no key needed
//   node scripts/ade-west.mjs --areas=West,Nieuw-West,Westpoort --day=2026-10-23 --max=12 "taste here"
//
// Reads server/assets/ade-planner/snapshot.json (refresh it with `php artisan ade:sync` +
// `ade:export` in VAMS, see VAMS/PROJECT.md). The key comes from the environment or hiren-ninja/.env.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadDotenv() {
  const file = join(root, '.env')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadDotenv()

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}
const noAi = args.includes('--no-ai')
const taste = args.filter(a => !a.startsWith('--')).join(' ') || 'good music, a mix of club and laid-back'
const areas = flag('areas', 'West,Nieuw-West,Westpoort').split(',').map(s => s.trim())
const onlyDay = flag('day', '')
const max = Number(flag('max', '15'))
const from = flag('from', '') // start time of day, e.g. 15:00
const kinds = flag('kinds', '').split(',').filter(Boolean) // e.g. interviews,gear
const hhmm = iso => iso?.slice(11, 16) ?? '?'
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'

const snap = JSON.parse(readFileSync(join(root, 'server/assets/ade-planner/snapshot.json'), 'utf8'))
const venues = new Map(snap.venues.map(v => [v.name, v]))
const now = Date.now()

const candidates = snap.events
  .filter(e => areas.includes(venues.get(e.venue)?.area))
  .filter(e => !e.soldOut)
  .filter(e => new Date(e.endsAt || e.startsAt).getTime() > now)
  .filter(e => !onlyDay || e.startsAt.startsWith(onlyDay))
  .filter(e => !from || hhmm(e.startsAt) >= from)
  .filter(e => !kinds.length || (e.kinds || []).some(k => kinds.includes(k)))
  .filter(e => args.includes('--all') || (new Date(e.endsAt) - new Date(e.startsAt)) / 6e4 < 600) // all-day installations are noise
  .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  .filter((e, i, all) => all.findIndex(x => x.title === e.title && x.venue === e.venue && x.startsAt === e.startsAt) === i)

const row = e => ({
  id: e.id,
  title: e.title,
  day: e.startsAt.slice(0, 10),
  time: `${hhmm(e.startsAt)}-${hhmm(e.endsAt)}`,
  venue: e.venue,
  area: venues.get(e.venue)?.area,
  type: [...(e.eventTypes || []), ...(e.kinds || [])].join(', '),
  genres: (e.genres || []).join(', '),
  vibe: e.vibe,
  size: e.size,
  access: e.access,
  priceFrom: e.priceFrom ?? null,
  lineup: (e.lineup || []).slice(0, 6).map(l => l.name ?? l).join(', '),
  blurb: (e.subtitle || '').slice(0, 140),
})

function print(list, why = {}) {
  let day = ''
  for (const e of list) {
    const d = e.startsAt.slice(0, 10)
    if (d !== day) {
      day = d
      console.log(`\n## ${new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}`)
    }
    const price = e.priceFrom != null ? ` · from €${e.priceFrom}` : e.access === 'free' ? ' · free' : ''
    console.log(`- ${hhmm(e.startsAt)}-${hhmm(e.endsAt)} **${e.title}** @ ${e.venue}${price}`)
    if (why[e.id]) console.log(`  ${why[e.id]}`)
    console.log(`  ${e.adeUrl}`)
  }
}

console.log(`# ADE ${areas.join(' + ')}: ${candidates.length} open events from now (snapshot ${snap.exportedAt.slice(0, 10)})`)

if (noAi || !process.env.GEMINI_API_KEY) {
  if (!noAi) console.error('\n(no GEMINI_API_KEY set, showing the plain schedule)')
  print(candidates)
  process.exit(0)
}

const prompt = `You are filtering the Amsterdam Dance Event programme for one person.
Their taste: "${taste}".
Pick at most ${max} events from the list that fit best, favouring variety across days and times and avoiding near-duplicates (same series, same venue and time).
Return JSON: {"picks":[{"id":"<event id from the list>","why":"<max 12 words>"}]}. Only use ids from the list.

EVENTS:
${JSON.stringify(candidates.map(row))}`

const ask = () => fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  },
)
let res = await ask()
// Flash sheds load with 503/429 during busy hours; ride it out.
for (const wait of [3, 8, 20, 40]) {
  if (res.status !== 503 && res.status !== 429) break
  console.error(`Gemini ${res.status}, retrying in ${wait}s`)
  await new Promise(r => setTimeout(r, wait * 1000))
  res = await ask()
}
if (!res.ok) {
  console.error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  process.exit(1)
}
const body = await res.json()
const picks = JSON.parse(body.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"picks":[]}').picks ?? []
const byId = new Map(candidates.map(e => [e.id, e]))
const chosen = picks.filter(p => byId.has(p.id))
console.log(`Taste: ${taste}\n`)
print(chosen.map(p => byId.get(p.id)).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  Object.fromEntries(chosen.map(p => [p.id, p.why])))
