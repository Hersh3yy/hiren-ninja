<template>
  <section v-if="loading || events.length" class="space-y-4" aria-labelledby="ade-suggestions-heading">
    <div>
      <AtomsHeading id="ade-suggestions-heading" text="You'd probably like" :level="2" size="xl" class="uppercase tracking-wide" />
      <p class="text-sm text-content-muted">
        Similar artists on the lineup (from Deezer's related artists) and acts that share a bill with yours.
      </p>
    </div>

    <AtomsLoader v-if="loading" type="spinner" size="md" color="accent" text="Finding similar artists" />

    <template v-else>
      <ul class="space-y-2">
        <template v-for="item in visibleEvents" :key="item.event.id">
          <AdePlannerEventItem
            :event="item.event"
            :artists="item.artists"
            :favorite="isFavorite(item.event.id)"
            :hidden="isHidden(item.event.id)"
            show-day
            @toggle-favorite="toggleFavorite(item.event, item.artists)"
            @toggle-hidden="toggleHidden(item.event.id)"
          />
          <li class="-mt-1 pb-1 pl-4 text-xs text-content-muted">{{ item.reason }}</li>
        </template>
      </ul>
      <AtomsButton
        v-if="events.length > limit"
        variant="ghost"
        size="sm"
        :text="`Show ${events.length - limit} more`"
        @click="limit += 6"
      />
    </template>
  </section>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { useAdeHidden } from '~/composables/useAdeHidden.js'

const props = defineProps({
  suggestions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  // Events already in your results; no need to suggest them again.
  excludeEventIds: { type: Array, default: () => [] }
})

const { isFavorite, toggleFavorite } = useAdeFavorites()
const { isHidden, toggleHidden } = useAdeHidden()
const limit = ref(6)

function reasonText(reasons) {
  const similar = [...new Set(reasons.filter(r => r.kind === 'similar').map(r => r.via))]
  const sameBill = [...new Set(reasons.filter(r => r.kind === 'same-bill').map(r => r.via))]
  return [
    similar.length ? `Similar to ${similar.slice(0, 3).join(', ')}` : '',
    sameBill.length ? `On the bill with ${sameBill.slice(0, 3).join(', ')}` : ''
  ].filter(Boolean).join(' · ')
}

// One entry per event (a big lineup would otherwise repeat the same night for every
// suggested artist), ordered by the best suggestion on it.
const events = computed(() => {
  const exclude = new Set(props.excludeEventIds)
  const byEvent = new Map()
  for (const suggestion of props.suggestions) {
    for (const event of suggestion.events) {
      if (exclude.has(event.id)) continue
      const entry = byEvent.get(event.id) ?? { event, artists: [], reasons: [] }
      entry.artists.push(suggestion.artist.name)
      entry.reasons.push(...suggestion.reasons)
      byEvent.set(event.id, entry)
    }
  }
  return [...byEvent.values()].map(entry => ({ ...entry, reason: reasonText(entry.reasons) }))
})

const visibleEvents = computed(() => events.value.filter(item => !isHidden(item.event.id)).slice(0, limit.value))
</script>
