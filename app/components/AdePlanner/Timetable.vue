<template>
  <div class="space-y-3">
    <!-- Wide timetables scroll sideways inside their own box; the time column stays put. -->
    <div class="overflow-x-auto rounded-lg border border-border-subtle bg-ink/40">
      <div class="relative flex" :style="{ minWidth: `${TIME_COLUMN + totalWidth}px` }">
        <div class="sticky left-0 z-10 shrink-0 bg-surface" :style="{ width: `${TIME_COLUMN}px` }">
          <div :style="{ height: `${HEADER}px` }" />
          <div class="relative" :style="{ height: `${gridHeight}px` }">
            <span
              v-for="hour in hours"
              :key="hour"
              class="absolute right-2 -translate-y-1/2 font-mono text-xs text-content-muted"
              :style="{ top: `${(hour - range.from) * pxPerMinute}px` }"
            >{{ formatMinutes(hour) }}</span>
          </div>
        </div>

        <div class="relative flex" :style="{ width: `${totalWidth}px` }">
          <div
            v-for="hour in hours"
            :key="`line-${hour}`"
            class="pointer-events-none absolute left-0 right-0 border-t border-dashed border-border-subtle"
            :style="{ top: `${HEADER + (hour - range.from) * pxPerMinute}px` }"
          />
          <div
            v-for="column in columns"
            :key="column.id"
            class="relative shrink-0 border-l border-border-subtle first:border-l-0"
            :style="{ width: `${column.lanes * laneWidth}px` }"
          >
            <div class="sticky top-0 flex flex-col justify-center px-2" :style="{ height: `${HEADER}px` }">
              <span class="truncate text-sm font-bold text-content">{{ column.label }}</span>
              <span v-if="column.sublabel" class="truncate text-xs text-content-muted">{{ column.sublabel }}</span>
            </div>
            <div class="relative" :style="{ height: `${gridHeight}px` }">
              <MoleculesTimetableBlock
                v-for="item in column.items"
                :key="item.event.id"
                :time="formatMinutes(item.from)"
                :title="item.event.title"
                :meta="item.meta || item.event.venue || ''"
                :tone="timetableTone(item.event)"
                :clash="item.clash"
                :saved="markSaved && isFavorite(item.event.id)"
                :top="(item.from - range.from) * pxPerMinute + 1"
                :height="Math.max(MIN_BLOCK, (item.to - item.from) * pxPerMinute - 3)"
                :left="item.lane * laneWidth + 3"
                :width="laneWidth - 6"
                @click="open(item.event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-content-muted" aria-label="Colours">
      <span v-for="tone in tones" :key="tone" class="inline-flex items-center gap-1.5">
        <span class="inline-block h-2.5 w-2.5 rounded-sm" :class="SWATCH[tone]" />{{ TONE_LABELS[tone] }}
      </span>
    </div>

    <MoleculesModalShell
      :is-open="!!opened"
      :title="openedDay"
      close-label="Close event"
      panel-class="max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      @close="opened = null"
    >
      <ul v-if="opened">
        <AdePlannerEventItem
          :event="opened"
          :artists="openedArtists"
          :favorite="isFavorite(opened.id)"
          initially-expanded
          @toggle-favorite="toggleFavorite(opened, openedArtists)"
        />
      </ul>
    </MoleculesModalShell>
  </div>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { TONE_LABELS, formatMinutes, planningDay, timetableTone } from '~/utils/timetable.js'

// A school-timetable grid: time runs down, columns are days or venues, and events that
// overlap inside a column get their own lane ("room"). Tap a block for its details.
const props = defineProps({
  /** [{ id, label, sublabel?, lanes, items: [{ event, from, to, lane, clash?, meta?, artists? }] }] */
  columns: { type: Array, required: true },
  pxPerMinute: { type: Number, default: 1.2 },
  laneWidth: { type: Number, default: 148 },
  // Off in My plan, where everything is saved.
  markSaved: { type: Boolean, default: true }
})

const TIME_COLUMN = 52
const HEADER = 44
const MIN_BLOCK = 30
const SWATCH = {
  business: 'bg-topic-business', artists: 'bg-topic-artists', tech: 'bg-topic-tech',
  impact: 'bg-topic-impact', meet: 'bg-topic-meet', party: 'bg-topic-party'
}

const { isFavorite, toggleFavorite } = useAdeFavorites()

const allItems = computed(() => props.columns.flatMap(column => column.items))
// Whole hours around everything shown.
const range = computed(() => {
  const from = Math.min(...allItems.value.map(item => item.from), 9 * 60)
  const to = Math.max(...allItems.value.map(item => item.to), 18 * 60)
  return { from: Math.floor(from / 60) * 60, to: Math.ceil(to / 60) * 60 }
})
const hours = computed(() => Array.from({ length: (range.value.to - range.value.from) / 60 + 1 }, (_, i) => range.value.from + i * 60))
const gridHeight = computed(() => (range.value.to - range.value.from) * props.pxPerMinute)
const totalWidth = computed(() => props.columns.reduce((sum, column) => sum + column.lanes * props.laneWidth, 0))
const tones = computed(() => [...new Set(allItems.value.map(item => timetableTone(item.event)))])

const dayLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
const opened = ref(null)
const openedDay = computed(() => (opened.value ? dayLabel.format(new Date(`${planningDay(opened.value)}T12:00:00Z`)) : 'Event'))
const openedArtists = ref([])
function open(event) {
  opened.value = event
  openedArtists.value = allItems.value.find(item => item.event.id === event.id)?.artists ?? []
}
</script>
