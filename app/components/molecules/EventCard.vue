<template>
  <article
    class="flex gap-4 rounded-lg border border-border-subtle bg-surface px-4 py-3 transition-colors"
    :class="expanded ? 'border-accent-muted' : 'hover:border-border-default'"
  >
    <div class="w-16 shrink-0 font-mono leading-tight">
      <span class="block text-sm font-bold text-accent">{{ timeLabel }}</span>
      <span v-if="durationLabel" class="block text-xs text-content-muted">{{ durationLabel }}</span>
    </div>

    <button
      type="button"
      class="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      :aria-expanded="expanded"
      :aria-controls="detailsId || undefined"
      @click="$emit('toggle-details')"
    >
      <span class="block font-bold text-content line-clamp-2">{{ title }}</span>
      <span v-if="meta" class="block truncate text-sm text-content-muted">{{ meta }}</span>
    </button>

    <div class="flex shrink-0 items-start gap-1">
      <AtomsBadge v-if="badge" :text="badge.text" :tone="badge.tone" />
      <MoleculesIconButton
        :icon-path="ICONS.star"
        :label="favorite ? `Remove ${title} from my plan` : `Add ${title} to my plan`"
        :pressed="favorite"
        :filled="favorite"
        @click="$emit('toggle-favorite')"
      />
    </div>
  </article>
</template>

<script setup>
import { ICONS } from '~/utils/icons'

// Compact, props-only event row: time, title, one line of context, one badge, a star.
// Details and actions live one level up (the feature's organism).
defineProps({
  timeLabel: { type: String, required: true },
  durationLabel: { type: String, default: '' },
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  badge: { type: Object, default: null },
  favorite: { type: Boolean, default: false },
  expanded: { type: Boolean, default: false },
  detailsId: { type: String, default: '' }
})

defineEmits(['toggle-details', 'toggle-favorite'])
</script>
