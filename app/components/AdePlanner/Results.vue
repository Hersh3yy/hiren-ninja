<template>
  <section aria-live="polite" class="space-y-8">
    <p class="text-content">
      <span class="text-2xl font-bold text-accent">{{ matchCount }}</span>
      of your {{ queryCount }} artists {{ matchCount === 1 ? 'is' : 'are' }} on the ADE 2026 lineup,
      across {{ eventCount }} {{ eventCount === 1 ? 'event' : 'events' }}.
      <span v-if="source === 'snapshot'" class="block text-xs text-content-muted mt-1">
        Using the bundled program snapshot.
      </span>
    </p>

    <div v-for="day in days" :key="day.key">
      <AtomsHeading :text="day.label" :level="3" size="lg" class="mb-3" />
      <ul class="grid gap-3 md:grid-cols-2">
        <AdePlannerEventCard
          v-for="item in day.items"
          :key="item.event.id"
          :title="item.event.title"
          :starts-at="item.event.startsAt"
          :ends-at="item.event.endsAt || ''"
          :venue="item.event.venue || ''"
          :sold-out="item.event.soldOut"
          :ade-url="item.event.adeUrl"
          :artists="item.artists"
          :lineup="item.event.lineupNames || []"
        />
      </ul>
    </div>

    <p v-if="artistsWithoutEvents.length" class="text-sm text-content-muted">
      On the lineup, event not announced yet:
      <a
        v-for="(match, i) in artistsWithoutEvents"
        :key="match.artist.id"
        :href="match.artist.adeUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-content hover:text-accent"
      >{{ match.artist.name }}{{ i < artistsWithoutEvents.length - 1 ? ', ' : '' }}</a>
    </p>

    <details v-if="unmatched.length" class="text-sm text-content-muted">
      <summary class="cursor-pointer hover:text-content">
        Not playing ADE ({{ unmatched.length }})
      </summary>
      <p class="mt-2">{{ unmatched.join(', ') }}</p>
    </details>
  </section>
</template>

<script setup>
const props = defineProps({
  days: { type: Array, required: true },
  matchCount: { type: Number, required: true },
  queryCount: { type: Number, required: true },
  unmatched: { type: Array, default: () => [] },
  artistsWithoutEvents: { type: Array, default: () => [] },
  source: { type: String, default: 'vams' }
})

const eventCount = computed(() => props.days.reduce((sum, day) => sum + day.items.length, 0))
</script>
