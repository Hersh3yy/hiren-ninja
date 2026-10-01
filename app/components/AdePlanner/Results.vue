<template>
  <section aria-live="polite" class="space-y-8">
    <p class="text-content">
      <span class="text-3xl font-bold text-accent">{{ matchCount }}</span>
      of your {{ queryCount }} artists {{ matchCount === 1 ? 'is' : 'are' }} on the ADE 2026 lineup,
      across {{ eventCount }} {{ eventCount === 1 ? 'event' : 'events' }}.
      <span v-if="source === 'snapshot'" class="block text-xs text-content-muted mt-1">
        Using the bundled program snapshot.
      </span>
    </p>

    <AdePlannerSoundBar :sound="sound" :model-value="genreFilter" @update:model-value="$emit('update:genreFilter', $event)" />

    <AdePlannerDayGroups :days="days" />

    <p v-if="genreFilter && !days.length" class="text-sm text-content-muted">
      None of your events are tagged {{ genreFilter }}.
    </p>

    <p v-if="artistsWithoutEvents.length" class="text-sm text-content-muted">
      On the lineup, event not announced yet:
      <template v-for="(match, i) in artistsWithoutEvents" :key="match.artist.id">
        <AtomsButton variant="link-muted" :href="match.artist.adeUrl" external :text="match.artist.name" />{{ i < artistsWithoutEvents.length - 1 ? ', ' : '' }}
      </template>
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
  sound: { type: Array, default: () => [] },
  genreFilter: { type: String, default: '' },
  matchCount: { type: Number, required: true },
  queryCount: { type: Number, required: true },
  unmatched: { type: Array, default: () => [] },
  artistsWithoutEvents: { type: Array, default: () => [] },
  source: { type: String, default: 'vams' }
})

defineEmits(['update:genreFilter'])

const eventCount = computed(() => props.days.reduce((sum, day) => sum + day.items.length, 0))
</script>
