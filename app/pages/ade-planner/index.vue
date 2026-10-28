<template>
  <section class="w-full">
    <div class="container mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
      <header class="space-y-3">
        <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE 2026 · 21–25 Oct · recap</p>
        <AtomsHeading text="ADE 2026 in numbers" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
        <p class="max-w-2xl text-content-muted">
          For three weeks the ADE Planner matched people's playlists against the Amsterdam Dance Event program.
          This is what {{ fmt(recap.searches) }} searches showed: who people came for, who they wished was playing, and what they did next.
          Counts only: never who searched.
        </p>
      </header>

      <!-- Headline numbers -->
      <div class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-3 lg:grid-cols-6">
        <div v-for="kpi in KPIS" :key="kpi.label" class="bg-surface p-4">
          <p class="font-mono text-2xl font-bold sm:text-3xl" :class="kpi.hot ? 'text-accent' : 'text-content'">{{ fmt(kpi.value) }}</p>
          <p class="text-xs text-content-muted">{{ kpi.label }}</p>
        </div>
      </div>

      <MoleculesCard :blur="false">
        <div class="space-y-4">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <AtomsHeading text="Day by day" :level="2" size="lg" class="uppercase tracking-wide" />
              <p class="text-sm text-content-muted">{{ dayCaption }}</p>
            </div>
            <MoleculesChipGroup :model-value="metric" label="Show" :options="METRICS" @update:model-value="pickMetric" />
          </div>
          <AdeRecapColumns :items="dayItems" :label="`${metricLabel} per day`" :ticks="dayTicks" :highlight="peakIndex" />
        </div>
      </MoleculesCard>

      <div class="grid gap-6 lg:grid-cols-2">
        <MoleculesCard :blur="false">
          <div class="space-y-3">
            <AtomsHeading text="When people plan" :level="2" size="lg" class="uppercase tracking-wide" />
            <AdeRecapColumns :items="hourItems" label="Searches by hour of day" :ticks="['00:00', '06:00', '12:00', '18:00', '23:00']" caption="Searches by hour (Amsterdam time): lunch and the evening, peaking at 18:00." />
          </div>
        </MoleculesCard>
        <MoleculesCard :blur="false">
          <div class="space-y-3">
            <AtomsHeading text="How people searched" :level="2" size="lg" class="uppercase tracking-wide" />
            <ul class="space-y-3">
              <li v-for="row in howRows" :key="row.label" class="space-y-1">
                <div class="flex justify-between text-sm"><span>{{ row.label }}</span><span class="font-mono text-content-muted">{{ row.value }} · {{ pct(row.value, howTotal) }}</span></div>
                <div class="h-2 overflow-hidden rounded-full bg-elevated"><div class="h-full rounded-full bg-accent/80" :style="{ width: pct(row.value, howTotal) }" /></div>
              </li>
            </ul>
            <p class="text-xs text-content-muted">Playlists: Spotify {{ recap.sources.spotify }}, Apple Music {{ recap.sources['apple-music'] }}, YouTube Music {{ recap.sources['youtube-music'] }}, Tidal {{ recap.sources.tidal }}, Deezer {{ recap.sources.deezer }}.</p>
          </div>
        </MoleculesCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <MoleculesCard :blur="false">
          <div class="space-y-3">
            <AtomsHeading text="Who people came for" :level="2" size="lg" class="uppercase tracking-wide" />
            <p class="text-sm text-content-muted">Artists on the lineup, by how many searches found them (a playlist searched twice counts once).</p>
            <AdeRecapBars :items="topArtists" />
          </div>
        </MoleculesCard>
        <MoleculesCard :blur="false">
          <div class="space-y-4">
            <AtomsHeading text="Was my artist searched?" :level="2" size="lg" class="uppercase tracking-wide" />
            <MoleculesFormField v-model="lookup" label="Artist name" placeholder="e.g. Amelie Lens" autocomplete="off" />
            <div v-if="lookupResult" class="rounded-lg border border-border-subtle bg-elevated p-4 text-sm" aria-live="polite">
              <p v-if="lookupResult.found">
                <strong class="text-accent">{{ lookupResult.name }}</strong> turned up in <strong>{{ lookupResult.found }}</strong>
                {{ lookupResult.found === 1 ? 'search' : 'searches' }}: #{{ lookupResult.rank }} of {{ fmt(recap.artistsFound) }} artists.
              </p>
              <p v-else-if="lookupResult.wanted">
                <strong class="text-accent">{{ lookupResult.name }}</strong> wasn't on the lineup, but {{ lookupResult.wanted }} searches wanted them.
              </p>
              <p v-else class="text-content-muted">No search found "{{ lookup.trim() }}". Either not on the ADE 2026 lineup, or nobody looked.</p>
            </div>
            <div class="space-y-2">
              <p class="text-xs font-bold uppercase tracking-wide text-content-muted">Typed by name most</p>
              <AdeRecapBars :items="topTyped" />
            </div>
          </div>
        </MoleculesCard>
      </div>

      <MoleculesCard :blur="false">
        <div class="space-y-3">
          <AtomsHeading text="Wanted, but not at ADE" :level="2" size="lg" class="uppercase tracking-wide" />
          <p class="text-sm text-content-muted">Acts in people's playlists and searches who weren't on the 2026 lineup, by how many searches had them. A wish list for 2027.</p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="[name, count] in recap.wanted.slice(0, 30)" :key="name" class="rounded-full border border-border-default px-3 py-1 text-sm">
              {{ name }} <span class="font-mono text-xs text-accent">{{ count }}</span>
            </li>
          </ul>
        </div>
      </MoleculesCard>

      <div class="grid gap-6 lg:grid-cols-2">
        <MoleculesCard :blur="false">
          <div class="space-y-3">
            <AtomsHeading text="Where searches led" :level="2" size="lg" class="uppercase tracking-wide" />
            <p class="text-sm text-content-muted">Events shown by the most separate searches.</p>
            <ol class="space-y-2 text-sm">
              <li v-for="(event, i) in recap.topEvents.slice(0, 10)" :key="event.title" class="flex gap-3 border-b border-dashed border-border-subtle pb-2">
                <span class="w-5 shrink-0 text-right font-mono text-xs text-content-muted">{{ i + 1 }}</span>
                <span class="min-w-0 flex-1"><span class="block truncate font-bold">{{ event.title }}</span><span class="block truncate text-xs text-content-muted">{{ when(event.startsAt) }} · {{ event.venue }}</span></span>
                <span class="font-mono text-xs text-accent">{{ event.reach }}</span>
              </li>
            </ol>
          </div>
        </MoleculesCard>
        <MoleculesCard :blur="false">
          <div class="space-y-3">
            <AtomsHeading text="Sound of the searches" :level="2" size="lg" class="uppercase tracking-wide" />
            <p class="text-sm text-content-muted">Genres of the events people's searches found, weighted by how often.</p>
            <AdeRecapBars :items="genres" />
          </div>
        </MoleculesCard>
      </div>

      <MoleculesCard :blur="false">
        <div class="space-y-3">
          <AtomsHeading text="What people used" :level="2" size="lg" class="uppercase tracking-wide" />
          <p class="text-sm text-content-muted">Per day from Tue 13 Oct (when feature counting started). Brighter is busier, per column.</p>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr class="text-left text-xs uppercase tracking-wide text-content-muted">
                  <th class="sticky left-0 bg-surface py-2 pr-3 font-normal">Day</th>
                  <th v-for="[key, label] in recap.usageGroups" :key="key" class="px-1 py-2 text-right font-normal">{{ label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in recap.usage" :key="row.day" class="border-t border-border-subtle">
                  <th class="sticky left-0 whitespace-nowrap bg-surface py-1.5 pr-3 text-left font-normal">{{ shortDay(row.day) }}</th>
                  <td v-for="[key] in recap.usageGroups" :key="key" class="px-1 py-1 text-right font-mono text-xs">
                    <span class="inline-block min-w-[2.25rem] rounded-sm px-1.5 py-0.5" :style="cellStyle(key, row[key])">{{ row[key] || '·' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </MoleculesCard>

      <MoleculesCard :blur="false">
        <div class="space-y-4">
          <AtomsHeading text="What the planner learned" :level="2" size="lg" class="uppercase tracking-wide" />
          <ul class="grid gap-4 sm:grid-cols-2">
            <li v-for="item in LEARNINGS" :key="item.title" class="space-y-1">
              <p class="font-bold">{{ item.title }}</p>
              <p class="text-sm text-content-muted">{{ item.text }}</p>
            </li>
          </ul>
        </div>
      </MoleculesCard>

      <div class="space-y-2 rounded-xl border border-accent-muted p-5">
        <AtomsHeading text="Next: any city, any weekend" :level="2" size="lg" class="uppercase tracking-wide" />
        <p class="max-w-2xl text-sm text-content-muted">
          The planner is becoming a general event planner: pick a city, see what's on, paste a playlist to find your artists.
          Want it for your city, festival or venue?
          <AtomsButton variant="link" to="/contact" text="Get in touch" data-umami-event="ade-recap-contact" />.
        </p>
        <p class="text-xs text-content-muted">Data: ADE Planner search log and counters, {{ shortDay(recap.first) }} to {{ shortDay(recap.last) }} 2026. Based on ADE's public program. Not affiliated with Amsterdam Dance Event.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
// ADE is over: /ade-planner shows what the planner saw (app/data/ade-2026-recap.json,
// made by scripts/ade-report/recap.py). Counts only, never who searched.
import recap from '~/data/ade-2026-recap.json'
import { track } from '~/utils/track'

const fmt = n => Number(n).toLocaleString('en-GB')
const pct = (value, total) => `${Math.round((100 * value) / Math.max(1, total))}%`
const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const shortDay = day => dayFmt.format(new Date(`${day}T12:00:00Z`))
const whenFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })
const when = iso => whenFmt.format(new Date(iso))

const KPIS = [
  { label: 'searches', value: recap.searches, hot: true },
  { label: 'playlists read', value: recap.playlists },
  { label: 'tracks scanned', value: recap.tracks },
  { label: 'event details opened', value: recap.totals.opens },
  { label: 'ticket clicks', value: recap.totals.tickets },
  { label: 'events saved to a plan', value: recap.totals.stars },
]

// Day by day: searches from the log (all days), the rest from the counters (from 13 Oct).
const METRICS = [
  { value: 'searches', label: 'Searches' },
  { value: 'opened', label: 'Events opened' },
  { value: 'tickets', label: 'Ticket clicks' },
]
const metric = ref('searches')
const metricLabel = computed(() => METRICS.find(option => option.value === metric.value)?.label ?? '')
function pickMetric(value) {
  metric.value = value || metric.value
  track('ade-recap-metric', { result: metric.value })
}
const dayItems = computed(() => (metric.value === 'searches'
  ? recap.perDay.map(([day, value]) => ({ key: day, label: shortDay(day), value }))
  : recap.usage.map(row => ({ key: row.day, label: shortDay(row.day), value: row[metric.value] ?? 0 }))))
const dayTicks = computed(() => {
  const days = dayItems.value
  return days.length ? [days[0].label, days[Math.floor(days.length / 2)].label, days.at(-1).label] : []
})
const peakIndex = computed(() => dayItems.value.reduce((best, item, i, all) => (item.value > all[best].value ? i : best), 0))
const dayCaption = computed(() => {
  const peak = dayItems.value[peakIndex.value]
  return peak ? `Busiest: ${peak.label} (${fmt(peak.value)} ${metricLabel.value.toLowerCase()}). The Reddit launch on 1 Oct, then the run-up to ADE.` : ''
})
const hourItems = recap.perHour.map((value, hour) => ({ key: hour, label: `${String(hour).padStart(2, '0')}:00`, value }))

const howRows = [
  { label: 'Pasted a playlist', value: recap.kinds.playlist },
  { label: 'Typed artist names', value: recap.kinds.names },
  { label: 'Asked in words (from 22 Oct)', value: recap.kinds.ask },
  { label: 'Daytime search', value: recap.kinds.daytime },
]
const howTotal = howRows.reduce((sum, row) => sum + row.value, 0)

const topArtists = recap.topArtists.slice(0, 15).map(([label, value]) => ({ label, value }))
const topTyped = recap.topTyped.slice(0, 8).map(([label, value]) => ({ label, value }))
const genres = recap.genres.slice(0, 10).map(([label, value]) => ({ label, value }))

// "Was my artist searched?": exact name first, then a forgiving match.
const lookup = ref('')
const norm = text => text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '')
// Rank = 1 + how many artists turned up more often (object key order isn't reliable:
// number-like names such as "999999999" come first).
const lookupCounts = Object.values(recap.artistLookup)
const lookupIndex = Object.entries(recap.artistLookup)
  .map(([name, found]) => ({ name, found, rank: 1 + lookupCounts.filter(count => count > found).length, key: norm(name) }))
  .sort((a, b) => a.rank - b.rank)
const wantedIndex = recap.wanted.map(([name, count]) => ({ name, count, key: norm(name) }))
let tracked = ''
const lookupResult = computed(() => {
  const key = norm(lookup.value)
  if (key.length < 2) return null
  const hit = lookupIndex.find(item => item.key === key) ?? (key.length >= 4 ? lookupIndex.find(item => item.key.startsWith(key)) : null)
  const wish = !hit && (wantedIndex.find(item => item.key === key) ?? null)
  if (key.length >= 4 && tracked !== key) {
    tracked = key
    track('ade-recap-lookup', { result: hit ? 'found' : wish ? 'wanted' : 'none' })
  }
  return hit ? { name: hit.name, found: hit.found, rank: hit.rank } : wish ? { name: wish.name, wanted: wish.count } : {}
})

// Feature table: one hue, brighter = busier within that column.
const columnMax = Object.fromEntries(recap.usageGroups.map(([key]) => [key, Math.max(1, ...recap.usage.map(row => row[key] ?? 0))]))
const cellStyle = (key, value) => (value ? { background: `rgb(255 255 7 / ${(0.08 + 0.55 * (value / columnMax[key])).toFixed(2)})`, color: value / columnMax[key] > 0.6 ? '#0d0d0d' : undefined } : {})

const LEARNINGS = [
  { title: 'Big playlists stopped at 100 tracks', text: 'Spotify only served the first 100 tracks of a playlist, so artists deep in long playlists were missed. The planner switched to reading up to 1,000 tracks.' },
  { title: 'Typos lose people', text: '"enrico sanguiliano" found nothing. "Did you mean Enrico Sangiuliano?" fixed that, for typed names and daytime searches.' },
  { title: 'Daytime never took off', text: 'The daytime tab was opened often, but only 2% of searches were daytime, with 4 event opens against 301 for parties. Curiosity is not use: watch actions before building.' },
  { title: 'Tickets are expensive', text: 'ADE publishes no prices. Free parties and Under €25 / €50 filters (prices read from ticket shops) were used every day of the festival.' },
  { title: 'Cold starts cost searches', text: 'On ADE day 1, searches that first loaded the whole program timed out. Reading a bundled copy first fixed it the same morning.' },
  { title: 'Count what people do', text: 'Per-day counters for every feature (map, budget, Ask, QR stickers) made every decision a number, not a guess.' },
]

useSeoMeta({
  title: `ADE 2026 in numbers: what ${fmt(recap.searches)} planner searches showed`,
  ogTitle: `ADE 2026 in numbers: what ${fmt(recap.searches)} planner searches showed`,
  description: `Who people came to Amsterdam Dance Event 2026 for, who they wished was playing (${recap.wanted[0]?.[0]}, ${recap.wanted[1]?.[0]}, ${recap.wanted[2]?.[0]}), and what they did next. From the ADE Planner.`,
  ogDescription: 'The most searched artists, the most wanted acts not at ADE, and what planners did next.',
  ogImage: 'https://hiren.ninja/og/og-ade.png',
  twitterCard: 'summary_large_image'
})

onMounted(() => track('ade-recap-open', { result: 'page' }))
</script>
