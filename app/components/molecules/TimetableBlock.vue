<template>
  <button
    type="button"
    class="absolute overflow-hidden rounded-md border-l-4 px-2 py-1 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    :class="[TONES[tone], clash ? 'ring-2 ring-danger' : '', saved ? 'outline outline-1 outline-accent' : '']"
    :style="{ top: `${top}px`, height: `${height}px`, left: `${left}px`, width: `${width}px` }"
    :aria-label="`${time}, ${title}${meta ? `, ${meta}` : ''}${clash ? ', clashes with another event' : ''}`"
    @click="$emit('click')"
  >
    <span class="block font-mono text-xs font-bold text-content">{{ time }}<span v-if="saved" class="text-accent"> ★</span></span>
    <span class="block text-xs font-bold leading-snug text-content line-clamp-3">{{ title }}</span>
    <span v-if="meta && height > 70" class="block truncate text-xs text-content-muted">{{ meta }}</span>
  </button>
</template>

<script setup>
// One positioned block in a timetable grid (AdePlannerTimetable places it).
defineProps({
  time: { type: String, required: true },
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  /** a timetableTone: business, artists, tech, impact, meet, party */
  tone: { type: String, default: 'meet' },
  clash: { type: Boolean, default: false },
  saved: { type: Boolean, default: false },
  top: { type: Number, required: true },
  height: { type: Number, required: true },
  left: { type: Number, required: true },
  width: { type: Number, required: true }
})

defineEmits(['click'])

const TONES = {
  business: 'border-topic-business bg-topic-business/15 hover:bg-topic-business/25',
  artists: 'border-topic-artists bg-topic-artists/15 hover:bg-topic-artists/25',
  tech: 'border-topic-tech bg-topic-tech/15 hover:bg-topic-tech/25',
  impact: 'border-topic-impact bg-topic-impact/15 hover:bg-topic-impact/25',
  meet: 'border-topic-meet bg-topic-meet/15 hover:bg-topic-meet/25',
  party: 'border-topic-party bg-topic-party/10 hover:bg-topic-party/20'
}
</script>
