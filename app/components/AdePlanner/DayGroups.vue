<template>
  <div class="space-y-8">
    <div v-for="day in visibleDays" :key="day.key">
      <AtomsHeading v-if="showDayHeadings" :text="day.label" :level="headingLevel" size="md" class="mb-3 uppercase tracking-wide" />
      <ul class="space-y-2">
        <template v-for="item in day.items" :key="item.event.id">
          <AdePlannerEventItem
            :event="item.event"
            :artists="item.artists"
            :favorite="isFavorite(item.event.id)"
            :hidden="isHidden(item.event.id)"
            @toggle-favorite="toggleFavorite(item.event, item.artists)"
            @toggle-hidden="toggleHidden(item.event.id)"
          />
          <!-- Why it's here, e.g. a suggestion's "Similar to ..." -->
          <li v-if="item.note" class="-mt-1 pb-1 pl-4 text-xs text-content-muted">{{ item.note }}</li>
        </template>
      </ul>
    </div>

    <p v-if="hiddenCount" class="text-sm text-content-muted">
      {{ hiddenCount }} hidden.
      <AtomsButton variant="link" :text="showHidden ? 'Hide them again' : 'Show them'" @click="showHidden = !showHidden" />
    </p>
  </div>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { useAdeHidden } from '~/composables/useAdeHidden.js'

const props = defineProps({
  days: { type: Array, required: true },
  showDayHeadings: { type: Boolean, default: true },
  // 3 when the days sit under a section heading of their own (suggestions).
  headingLevel: { type: Number, default: 2 }
})

const { isFavorite, toggleFavorite } = useAdeFavorites()
const { isHidden, toggleHidden } = useAdeHidden()
const showHidden = ref(false)

const hiddenCount = computed(() => props.days.reduce((sum, day) => sum + day.items.filter(item => isHidden(item.event.id)).length, 0))

const visibleDays = computed(() => props.days
  .map(day => ({ ...day, items: showHidden.value ? day.items : day.items.filter(item => !isHidden(item.event.id)) }))
  .filter(day => day.items.length))
</script>
