<template>
  <div class="space-y-2">
    <div ref="mapEl" class="h-[420px] w-full overflow-hidden rounded-lg border border-border-subtle bg-ink" role="region" aria-label="Map of your plan" />
    <p class="text-xs text-content-muted">
      Numbers are the order per day. {{ missing ? `${missing} saved ${missing === 1 ? 'event has' : 'events have'} no known location.` : '' }}
    </p>
  </div>
</template>

<script setup>
// Your saved events on a map, one colour per day, in order. Leaflet and its tiles only
// load when the map is opened (dynamic import), so the planner itself stays light.
const props = defineProps({
  /** [{ id, lat, lng, day, dayLabel, order, title, time }] */
  stops: { type: Array, required: true },
  missing: { type: Number, default: 0 }
})

const DAY_COLOURS = ['#ffff07', '#6c9cf0', '#f2a541', '#b48af5', '#4cc9a8', '#f4f4f5']

const mapEl = ref(null)
let map = null
let layer = null

async function draw() {
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')
  if (!mapEl.value) return
  if (!map) {
    map = L.map(mapEl.value, { scrollWheelZoom: false })
    // OpenStreetMap's own tiles (no key), darkened with a CSS filter to match the site.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'ade-map-tiles'
    }).addTo(map)
  }
  layer?.remove()
  layer = L.layerGroup().addTo(map)

  const days = [...new Set(props.stops.map(stop => stop.day))].sort()
  for (const [i, day] of days.entries()) {
    const colour = DAY_COLOURS[i % DAY_COLOURS.length]
    const stops = props.stops.filter(stop => stop.day === day).sort((a, b) => a.order - b.order)
    if (stops.length > 1) L.polyline(stops.map(stop => [stop.lat, stop.lng]), { color: colour, weight: 2, opacity: 0.6, dashArray: '4 6' }).addTo(layer)
    for (const stop of stops) {
      L.marker([stop.lat, stop.lng], {
        icon: L.divIcon({
          className: '',
          html: `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;background:${colour};color:#0d0d0d;font:700 12px/1 monospace;border:2px solid #0d0d0d">${stop.order}</span>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        }),
        title: `${stop.dayLabel} ${stop.order}: ${stop.title}`
      }).bindTooltip(`${stop.dayLabel} · ${stop.time} · ${stop.title}`).addTo(layer)
    }
  }
  if (props.stops.length) map.fitBounds(props.stops.map(stop => [stop.lat, stop.lng]), { padding: [32, 32], maxZoom: 15 })
  else map.setView([52.3702, 4.8952], 12)
}

onMounted(draw)
watch(() => props.stops, draw, { deep: true })
onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<style>
.ade-map-tiles {
  filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9) saturate(0.6);
}
</style>
