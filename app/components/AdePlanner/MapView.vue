<template>
  <section class="space-y-4 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-map-heading">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <AtomsHeading id="ade-map-heading" text="Map" :level="2" size="xl" class="uppercase tracking-wide" />
      <AtomsButton variant="ghost" size="sm" text="Close" @click="$emit('close')" />
    </div>

    <div class="space-y-3">
      <MoleculesChipGroup :model-value="when" label="When" :options="WINDOWS" @update:model-value="value => when = value || when" />
      <MoleculesChipGroup :model-value="String(radius)" label="Within" :options="RADII" @update:model-value="value => radius = Number(value || radius)" />
      <div class="flex flex-wrap items-center gap-2">
        <AtomsButton size="sm" variant="outline" :text="centreMode === 'you' ? 'Update my location' : 'Near me'" :loading="locating" @click="locate" />
        <span class="text-xs text-content-muted">{{ centreText }}</span>
      </div>
      <p v-if="!duringAde" class="text-xs text-content-muted">ADE runs 21–25 October; showing {{ previewLabel }}.</p>
      <MoleculesStatusAlert :message="error" type="error" />
    </div>

    <div class="relative">
      <div ref="mapEl" class="h-[380px] w-full overflow-hidden rounded-lg border border-border-subtle bg-ink sm:h-[460px]" role="region" aria-label="Map of ADE parties: tap a venue to see what's on there" />
      <!-- After you move the map: look around that spot instead (like a maps app). -->
      <AtomsButton
        v-if="moved"
        size="sm"
        text="Search this area"
        class="absolute left-1/2 top-3 z-[500] -translate-x-1/2 shadow-lg"
        @click="searchArea"
      />
    </div>
    <p class="text-xs text-content-muted">
      Tap a dot to see that venue's parties. The number is how many.
      {{ shown.length }} {{ shown.length === 1 ? 'party' : 'parties' }}{{ radius ? ` within ${radius} km` : '' }} {{ windowLabel.toLowerCase() }}.
    </p>

    <AtomsLoader v-if="loading" type="spinner" size="md" color="accent" text="Loading the map" />
    <template v-else>
      <div v-if="selected" ref="listTop" class="flex flex-wrap items-baseline justify-between gap-2 border-t border-border-subtle pt-3">
        <p class="text-sm"><span class="font-bold text-accent">{{ selected.venue }}</span> <span class="text-content-muted">· {{ selectedItems.length }} {{ selectedItems.length === 1 ? 'party' : 'parties' }} · {{ selected.trip }}</span></p>
        <AtomsButton variant="link" text="Show all nearby" @click="selectVenue(null)" />
      </div>
      <p v-if="!listItems.length" class="text-sm text-content-muted">Nothing on {{ radius ? `within ${radius} km` : '' }} {{ windowLabel.toLowerCase() }}. Try a bigger distance or another time.</p>
      <AdePlannerDayGroups v-else :days="listDays" :show-day-headings="false" />
    </template>
  </section>
</template>

<script setup>
// Every party on a map, filtered by time and distance (2 km by default) from Centraal,
// from you, or from wherever you moved the map. Tap a venue to list its parties.
// Leaflet loads only when the map opens. Distances are worked out here, in the browser:
// the location is never sent anywhere.
import { describeTrip, distanceKm, travel } from '../../../server/utils/ade-planner/travel'
import { track } from '~/utils/track'

defineEmits(['close'])

const CENTRAAL = { lat: 52.3791, lng: 4.9003 }
const ADE_START = new Date('2026-10-21T00:00:00+02:00')
const ADE_END = new Date('2026-10-26T08:00:00+01:00')
const HOUR = 3_600_000
const now = new Date()
const duringAde = now >= ADE_START && now < ADE_END
// Outside ADE week: show Friday night, so the map is never empty.
const base = duringAde ? now : new Date('2026-10-23T21:00:00+02:00')
const previewLabel = 'Friday 23 October from 21:00'

const WINDOWS = [
  { value: 'soon', label: 'On now & next 3h' },
  { value: 'tonight', label: 'Tonight' },
  { value: 'today', label: 'Today' },
]
const RADII = [
  { value: '1', label: '1 km' },
  { value: '2', label: '2 km' },
  { value: '5', label: '5 km' },
  { value: '0', label: 'Anywhere' },
]

const when = ref('soon')
const radius = ref(2)
// 'centraal' (default), 'you' (shared location) or 'area' (where you moved the map)
const centreMode = ref('centraal')
const centre = ref({ ...CENTRAAL })
const locating = ref(false)
const loading = ref(false)
const error = ref('')
const events = ref([])
const selectedKey = ref('')
const moved = ref(false)
const mapEl = ref(null)
const listTop = ref(null)

const centreText = computed(() => ({
  centraal: 'Distances from Centraal Station. Your location stays on your phone.',
  you: 'Around you.',
  area: 'Around the spot you picked on the map.',
}[centreMode.value]))

const amsterdamDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' })
const amsterdamHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' })

/** [from, to] for the chosen window, in Amsterdam time; nights run to 06:00. */
function windowFor(value) {
  // Before 06:00 it's still last night.
  const night = Number(amsterdamHour.format(base)) < 6 ? new Date(base.getTime() - 6 * HOUR) : base
  const day = amsterdamDay.format(night)
  const offset = new Date(`${day}T12:00:00Z`).toLocaleString('en-US', { timeZone: 'Europe/Amsterdam', timeZoneName: 'shortOffset' }).includes('GMT+1') ? '+01:00' : '+02:00'
  const at = hours => new Date(`${day}T00:00:00${offset}`).getTime() + hours * HOUR
  if (value === 'soon') return [base.getTime() - 15 * 60_000, base.getTime() + 3 * HOUR]
  if (value === 'tonight') return [Math.max(at(18), base.getTime() - 15 * 60_000), at(30)]
  return [Math.max(at(6), base.getTime() - 15 * 60_000), at(30)]
}
const windowLabel = computed(() => WINDOWS.find(option => option.value === when.value)?.label ?? '')

const venueKey = event => `${event.place.lat},${event.place.lng}`

const withDistance = computed(() => events.value
  .map(event => ({ event, km: distanceKm(centre.value, event.place), trip: travel(centre.value, event.place) }))
  .sort((a, b) => a.km - b.km || a.event.startsAt.localeCompare(b.event.startsAt)))
const shown = computed(() => withDistance.value.filter(item => !radius.value || item.km <= radius.value))

const venues = computed(() => {
  const byVenue = new Map()
  for (const item of shown.value) {
    const key = venueKey(item.event)
    const venue = byVenue.get(key) ?? { key, venue: item.event.venue || 'Venue', place: item.event.place, items: [], trip: describeTrip(item.trip) }
    venue.items.push(item)
    byVenue.set(key, venue)
  }
  return byVenue
})
const selected = computed(() => venues.value.get(selectedKey.value) ?? null)
const selectedItems = computed(() => selected.value?.items ?? [])
const listItems = computed(() => (selected.value ? selectedItems.value : shown.value).slice(0, 60))
const listDays = computed(() => [{
  key: 'map',
  label: '',
  items: listItems.value.map(({ event, trip }) => ({ event, artists: [], note: selected.value ? '' : `${event.venue} · ${describeTrip(trip)}` }))
}])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [from, to] = windowFor(when.value)
    events.value = await $fetch('/api/ade-planner/map', { query: { from: new Date(from).toISOString(), to: new Date(to).toISOString() } })
  } catch {
    error.value = 'Could not load the map. Try again in a moment.'
  } finally {
    loading.value = false
  }
}

function locate() {
  if (!navigator.geolocation) {
    error.value = 'Your browser has no location. Move the map to your spot and tap "Search this area".'
    return
  }
  locating.value = true
  error.value = ''
  navigator.geolocation.getCurrentPosition(
    (result) => {
      centre.value = { lat: result.coords.latitude, lng: result.coords.longitude }
      centreMode.value = 'you'
      locating.value = false
      selectedKey.value = ''
      fitArea()
      track('ade-map-locate', { result: 'shared' })
    },
    () => {
      // Common in Instagram's and TikTok's in-app browsers.
      error.value = 'Location was not shared. Allow it for this site, or move the map to where you are and tap "Search this area".'
      locating.value = false
      track('ade-map-locate', { result: 'denied' })
    },
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
  )
}

function searchArea() {
  if (!map) return
  const point = map.getCenter()
  centre.value = { lat: point.lat, lng: point.lng }
  centreMode.value = 'area'
  moved.value = false
  selectedKey.value = ''
  drawArea()
  track('ade-map-area', { result: String(radius.value) })
}

function selectVenue(key) {
  selectedKey.value = key ?? ''
  if (key) {
    track('ade-map-venue', { result: String(selectedItems.value.length) })
    nextTick(() => listTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  drawMarkers()
}

let L = null
let map = null
let markerLayer = null
let areaLayer = null
// Our own fitBounds also fires move events; only a person moving the map counts.
let programmatic = false

const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function drawMarkers() {
  if (!map) return
  markerLayer?.remove()
  markerLayer = L.layerGroup().addTo(map)
  for (const venue of venues.value.values()) {
    const count = venue.items.length
    const size = Math.min(30, 18 + count * 2)
    const active = venue.key === selectedKey.value
    L.marker([venue.place.lat, venue.place.lng], {
      // A 40px tap target around a dot that grows with the number of parties.
      icon: L.divIcon({
        className: 'ade-pin',
        html: `<span class="ade-pin__dot${active ? ' is-active' : ''}" style="width:${size}px;height:${size}px">${count > 1 ? count : ''}</span>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
      title: `${venue.venue}: ${count} ${count === 1 ? 'party' : 'parties'}`,
      keyboard: true,
      riseOnHover: true,
      zIndexOffset: active ? 1000 : count,
    })
      .bindTooltip(escape(venue.venue), { direction: 'top', offset: [0, -14] })
      .on('click', () => selectVenue(venue.key))
      .addTo(markerLayer)
  }
}

function drawArea() {
  if (!map) return
  areaLayer?.remove()
  areaLayer = L.layerGroup().addTo(map)
  if (centreMode.value === 'you') {
    L.circleMarker([centre.value.lat, centre.value.lng], { radius: 8, color: '#ffffff', weight: 3, fillColor: '#ff7a6b', fillOpacity: 1, interactive: false }).addTo(areaLayer)
  }
  if (radius.value) {
    L.circle([centre.value.lat, centre.value.lng], { radius: radius.value * 1000, color: '#ffff07', weight: 1, fillOpacity: 0.04, dashArray: '4 6', interactive: false }).addTo(areaLayer)
  }
  fitArea()
}

function fitArea() {
  if (!map) return
  programmatic = true
  if (radius.value) map.fitBounds(L.latLng(centre.value.lat, centre.value.lng).toBounds(radius.value * 2000), { padding: [8, 8] })
  else if (shown.value.length) map.fitBounds(shown.value.map(item => [item.event.place.lat, item.event.place.lng]), { padding: [24, 24], maxZoom: 15 })
  else map.setView([centre.value.lat, centre.value.lng], 13)
  setTimeout(() => { programmatic = false }, 400)
}

async function setup() {
  if (!mapEl.value) return
  L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')
  map = L.map(mapEl.value, { scrollWheelZoom: false, inertiaMaxSpeed: 1200 })
  // OpenStreetMap's own tiles (no key), darkened with a CSS filter to match the site.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    className: 'ade-map-tiles'
  }).addTo(map)
  map.on('movestart', () => {
    if (!programmatic) moved.value = true
  })
  drawArea()
  drawMarkers()
}

watch(when, async () => {
  selectedKey.value = ''
  await load()
  track('ade-map-window', { result: when.value })
})
watch(radius, () => {
  selectedKey.value = ''
  drawArea()
})
watch(venues, drawMarkers)
watch(centre, drawArea)

onMounted(async () => {
  track('ade-map-open', { result: duringAde ? 'live' : 'preview' })
  await load()
  await setup()
})
onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>
