<template>
  <section class="space-y-3 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-near-me-heading">
    <AtomsHeading id="ade-near-me-heading" text="Starting soon near me" :level="2" size="xl" class="uppercase tracking-wide" />
    <p class="text-sm text-content-muted">
      What starts in the next two hours, nearest first, with a rough bike or walking time.
      Your location is only used for this list and never stored.
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <AtomsButton text="Use my location" size="sm" :loading="isLoading && !preview" @click="find(false)" />
      <AtomsButton v-if="!duringAde" text="Preview: Friday 23 Oct, 22:00" size="sm" variant="outline" :loading="isLoading && preview" @click="find(true)" />
    </div>
    <p v-if="!duringAde" class="text-xs text-content-muted">ADE runs 21-25 October; until then the preview shows what you'd see on Friday night.</p>

    <MoleculesStatusAlert :message="error" type="error" />

    <p v-if="searched && !days.length && !error" class="text-sm text-content-muted">Nothing starts near you in the next two hours.</p>
    <AdePlannerDayGroups v-if="days.length" :days="days" :show-day-headings="false" />
  </section>
</template>

<script setup>
import { describeTrip } from '../../../server/utils/ade-planner/travel'
import { track } from '~/utils/track'

const PREVIEW_AT = '2026-10-23T22:00:00+02:00'
const now = new Date()
const duringAde = now >= new Date('2026-10-21T00:00:00+02:00') && now < new Date('2026-10-26T08:00:00+01:00')

const isLoading = ref(false)
const preview = ref(false)
const error = ref('')
const searched = ref(false)
const results = ref([])

const days = computed(() => results.value.length
  ? [{ key: 'near', label: '', items: results.value.map(({ event, trip, startsInMinutes }) => ({
      event,
      artists: [],
      note: `${startsInMinutes <= 0 ? 'Just started' : `Starts in ${startsInMinutes} min`} · ${describeTrip(trip)}`
    })) }]
  : [])

function position() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Your browser has no location.'))
    navigator.geolocation.getCurrentPosition(
      result => resolve(result.coords),
      () => reject(new Error('Location was not shared. Allow it for this site and try again.')),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 120_000 }
    )
  })
}

async function find(asPreview) {
  isLoading.value = true
  preview.value = asPreview
  error.value = ''
  try {
    const coords = await position()
    const response = await $fetch('/api/ade-planner/nearby', {
      query: { lat: coords.latitude.toFixed(4), lng: coords.longitude.toFixed(4), at: asPreview ? PREVIEW_AT : undefined }
    })
    results.value = response.events
    searched.value = true
    track('ade-near-me', { preview: asPreview, found: response.events.length })
  } catch (err) {
    error.value = err?.message || 'Could not look up what is near you.'
  } finally {
    isLoading.value = false
  }
}
</script>
