<template>
  <article
    class="flex gap-3 border border-border-subtle bg-surface px-4 py-3 transition-colors"
    :class="expanded ? 'rounded-t-lg border-accent-muted' : 'rounded-lg hover:border-border-default'"
  >
    <div class="hidden w-16 shrink-0 font-mono leading-tight sm:block">
      <span class="block text-sm font-bold text-accent">{{ timeLabel }}</span>
      <span v-if="durationLabel" class="block text-xs text-content-muted">{{ durationLabel }}</span>
    </div>

    <button
      type="button"
      class="min-w-0 flex-1 rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      :aria-expanded="expanded"
      :aria-controls="detailsId || undefined"
      @click="$emit('toggle-details')"
    >
      <span class="block font-mono text-xs font-bold text-accent sm:hidden">
        {{ timeLabel }}<span v-if="durationLabel" class="font-normal text-content-muted"> · {{ durationLabel }}</span>
      </span>
      <span class="font-bold text-content line-clamp-2">{{ title }}</span>
      <span v-if="meta" class="block truncate text-sm text-content-muted">{{ meta }}</span>
      <span v-if="people.length" class="mt-1 text-sm text-content-muted line-clamp-2">
        <template v-for="(person, i) in shownPeople" :key="person.name">
          <span :class="person.highlight ? 'font-bold text-accent' : 'text-content'">{{ person.name }}</span>{{ i < shownPeople.length - 1 ? ', ' : '' }}
        </template>
        <span v-if="people.length > peopleMax"> +{{ people.length - peopleMax }} more</span>
      </span>
    </button>

    <div class="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-start">
      <MoleculesIconButton
        :icon-path="ICONS.star"
        :label="favorite ? `Remove ${title} from my plan` : `Add ${title} to my plan`"
        :pressed="favorite"
        :filled="favorite"
        @click="$emit('toggle-favorite')"
      />
      <AtomsBadge v-if="badge" class="sm:order-first sm:mt-2" :text="badge.text" :tone="badge.tone" />
    </div>
  </article>
</template>

<script setup>
import { ICONS } from '~/utils/icons'

// Compact, props-only event row: time, title, one line of context, who plays, one badge, a star.
// Details and actions live one level up (the feature's organism).
const props = defineProps({
  timeLabel: { type: String, required: true },
  durationLabel: { type: String, default: '' },
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  /** [{ name, highlight }] — highlighted names first */
  people: { type: Array, default: () => [] },
  peopleMax: { type: Number, default: 6 },
  badge: { type: Object, default: null },
  favorite: { type: Boolean, default: false },
  expanded: { type: Boolean, default: false },
  detailsId: { type: String, default: '' }
})

defineEmits(['toggle-details', 'toggle-favorite'])

const shownPeople = computed(() => props.people.slice(0, props.peopleMax))
</script>
