<template>
  <section class="space-y-4 rounded-xl border border-accent p-4" aria-labelledby="ade-shared-plan-heading">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <AtomsHeading
        id="ade-shared-plan-heading"
        :text="data ? `A friend's plan (${data.events.length})` : 'A friend\'s plan'"
        :level="2"
        size="xl"
        class="uppercase tracking-wide"
      />
      <AtomsButton size="sm" variant="ghost" text="Close" @click="$emit('close')" />
    </div>

    <AtomsLoader v-if="status === 'pending'" text="Opening the plan..." />
    <MoleculesStatusAlert v-else-if="error" :message="error.statusMessage || 'This plan link is empty or broken.'" type="error" />

    <template v-else-if="data">
      <p class="text-sm text-content-muted">
        Shared with you. Tap ☆ on what you like, or add the lot to your own plan.
        <span v-if="data.missing">{{ data.missing }} {{ data.missing === 1 ? 'event is' : 'events are' }} no longer on ADE's program.</span>
      </p>

      <div class="flex flex-wrap items-center gap-3">
        <AtomsButton
          size="sm"
          :text="unsaved ? `Add all ${unsaved} to my plan` : '★ All in my plan'"
          :disabled="!unsaved"
          @click="addAll"
        />
        <span v-if="addedText" class="text-sm text-success" role="status">{{ addedText }}</span>
      </div>

      <AdePlannerDayGroups :days="days" />
    </template>
  </section>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { groupEventsByDay } from '~/composables/useAdePlanner.js'
import { track } from '~/utils/track'

const props = defineProps({
  // The `plan` query value from a shared link.
  plan: { type: String, required: true }
})

defineEmits(['close'])

const { isFavorite, addFavorites } = useAdeFavorites()
const addedText = ref('')

const { data, status, error } = useFetch('/api/ade-planner/plan', {
  query: { plan: computed(() => props.plan) },
  key: computed(() => `ade-shared-plan:${props.plan}`)
})

const items = computed(() => (data.value?.events ?? []).map(event => ({ event, artists: [] })))
const days = computed(() => groupEventsByDay(items.value))
const unsaved = computed(() => items.value.filter(({ event }) => !isFavorite(event.id)).length)

watch(data, (value) => {
  if (value) track('ade-shared-plan-open', { events: value.events.length, missing: value.missing })
}, { immediate: true })

function addAll() {
  const added = addFavorites(items.value)
  track('ade-shared-plan-add-all', { added })
  addedText.value = `Added ${added} to your plan.`
}
</script>
