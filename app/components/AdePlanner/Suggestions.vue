<template>
  <section v-if="loading || suggestions.length" class="space-y-4" aria-labelledby="ade-suggestions-heading">
    <div>
      <AtomsHeading id="ade-suggestions-heading" text="You'd probably like" :level="2" size="xl" class="uppercase tracking-wide" />
      <p class="text-sm text-content-muted">
        Similar artists on the lineup (from Deezer's related artists) and acts that share a bill with yours.
      </p>
    </div>

    <AtomsLoader v-if="loading" type="spinner" size="md" color="accent" text="Finding similar artists" />

    <ul v-else class="space-y-6">
      <li v-for="suggestion in suggestions" :key="suggestion.artist.id" class="space-y-2">
        <p>
          <a
            :href="suggestion.artist.adeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-lg font-bold text-content hover:text-accent"
          >{{ suggestion.artist.name }}</a>
          <span class="ml-2 text-sm text-content-muted">{{ reasonText(suggestion.reasons) }}</span>
        </p>
        <ul class="space-y-2">
          <AdePlannerEventItem
            v-for="event in suggestion.events"
            :key="event.id"
            :event="event"
            :artists="[suggestion.artist.name]"
            :favorite="isFavorite(event.id)"
            @toggle-favorite="toggleFavorite(event, [suggestion.artist.name])"
          />
        </ul>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'

defineProps({
  suggestions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const { isFavorite, toggleFavorite } = useAdeFavorites()

function reasonText(reasons) {
  const similar = reasons.filter(r => r.kind === 'similar').map(r => r.via)
  const sameBill = reasons.filter(r => r.kind === 'same-bill').map(r => r.via)
  return [
    similar.length ? `Similar to ${similar.slice(0, 3).join(', ')}` : '',
    sameBill.length ? `On the bill with ${sameBill.slice(0, 3).join(', ')}` : ''
  ].filter(Boolean).join(' · ')
}
</script>
