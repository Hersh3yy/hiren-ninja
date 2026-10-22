<template>
  <section class="space-y-4" aria-label="Ask">
    <p class="text-sm text-content-muted">Say what you're after, like a text to a friend: a day, a place, a sound, an artist.</p>

    <MoleculesPromptBox
      id="ade-ask-prompt"
      v-model="prompt"
      label="What are you looking for?"
      placeholder="e.g. techno in West tonight from 8pm"
      submit-text="Find events"
      :loading="isLoading"
      :disabled="!prompt.trim()"
      @submit="run"
    />

    <div v-if="!result && !isLoading" class="space-y-2">
      <p class="text-xs font-bold uppercase tracking-wide text-content-muted">Try</p>
      <ul class="space-y-2 text-sm">
        <li v-for="example in EXAMPLES" :key="example">
          <AtomsButton variant="link" :text="example" class="text-left" @click="useExample(example)" />
        </li>
      </ul>
    </div>

    <AtomsLoader v-if="isLoading" type="dots" size="md" color="accent" text="Finding events" />
    <MoleculesStatusAlert :message="error" type="error" />

    <template v-if="result && !isLoading">
      <p v-if="result.unclear" class="text-sm text-content-muted">
        Couldn't tell what you're after. Add a day, a place or a kind of event ("talks in West tomorrow"),
        type an artist's name, or
        <AtomsButton variant="link" text="pick from the schedule" @click="$emit('show-schedule')" />.
      </p>
      <MoleculesStatusAlert v-else-if="result.source === 'rules'" message="Read with simple keyword matching: the AI helper is busy. Check the headings below match what you meant." />

      <div v-for="group in result.groups" :key="group.key" class="space-y-3">
        <div>
          <AtomsHeading :text="group.label" :level="3" size="md" class="uppercase tracking-wide" />
          <p class="text-xs text-content-muted">{{ group.summary }}</p>
        </div>
        <p v-if="!group.items.length" class="text-sm text-content-muted">
          Nothing open matches that. Try another time or place.
        </p>
        <AdePlannerDayGroups v-else :days="[toDay(group)]" :show-day-headings="false" />
        <p v-if="group.items.length && group.total > group.items.length" class="text-xs text-content-muted">
          Top {{ group.items.length }} of {{ group.total }}. Add a place, time or sound you like to narrow it down.
        </p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { EXAMPLES, useAdeAsk } from '~/composables/useAdeAsk.js'

const emit = defineEmits(['use-artists', 'show-schedule'])

// A pasted playlist or an artist's name goes to Your artists, which does that job properly.
const { prompt, isLoading, error, result, run, useExample } = useAdeAsk({ onRoute: input => emit('use-artists', input) })

// DayGroups lists days; one slot's answer is one "day" without a heading.
const toDay = group => ({
  key: group.key,
  label: group.label,
  items: group.items.map(item => ({ event: item.event, artists: [], note: item.why }))
})
</script>
