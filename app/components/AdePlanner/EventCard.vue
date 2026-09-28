<template>
  <li class="rounded-lg border border-border-subtle bg-elevated/40 p-4 hover:border-border-default transition-colors">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="font-mono text-sm text-accent">{{ timeRange }}</span>
      <div class="flex items-center gap-2">
        <span :class="['rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide', status.classes]">
          {{ status.label }}
        </span>
        <button
          type="button"
          :aria-pressed="favorite"
          :aria-label="favorite ? `Remove ${event.title} from my plan` : `Add ${event.title} to my plan`"
          class="rounded p-1 text-lg leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :class="favorite ? 'text-accent' : 'text-content-muted hover:text-content'"
          @click="$emit('toggle-favorite')"
        >
          {{ favorite ? '★' : '☆' }}
        </button>
      </div>
    </div>

    <a
      :href="event.adeUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-1 block text-lg font-bold text-content hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
    >
      {{ event.title }}
      <span class="sr-only">(opens ADE event page in a new tab)</span>
    </a>

    <p v-if="event.venue" class="text-sm text-content-muted">
      {{ event.venue }}<span v-if="event.address"> · {{ event.address }}</span>
    </p>

    <ul v-if="event.genres?.length || kindLabels.length" class="mt-2 flex flex-wrap gap-1" aria-label="Kind and genres">
      <li
        v-for="kind in kindLabels"
        :key="kind"
        class="rounded-full bg-elevated px-2 py-0.5 text-xs font-semibold text-content"
      >
        {{ kind }}
      </li>
      <li
        v-for="genre in event.genres"
        :key="genre"
        class="rounded-full border border-border-default px-2 py-0.5 text-xs text-content-muted"
      >
        {{ genre }}
      </li>
    </ul>

    <p v-if="lineupWithYours.length" class="mt-2 text-sm text-content-muted">
      <span>{{ 'Lineup: ' }}</span>
      <template v-for="(name, i) in lineupWithYours" :key="name">
        <span :class="artists.includes(name) ? 'font-semibold text-accent' : 'text-content'">{{ name }}</span>{{ i < lineupWithYours.length - 1 ? ', ' : '' }}
      </template>
    </p>

    <div class="mt-3 flex flex-wrap gap-2">
      <AtomsButton
        v-if="event.ticketUrl && event.ticketStatus !== 'sold out'"
        :href="event.ticketUrl"
        external
        size="sm"
        :text="event.ticketLabel || 'Tickets'"
      />
      <AtomsButton
        :href="ticketSwapUrl"
        external
        size="sm"
        :variant="event.ticketStatus === 'sold out' ? 'primary' : 'outline'"
        text="Resale on TicketSwap"
      />
    </div>
  </li>
</template>

<script setup>
import { KIND_LABELS } from '~/composables/useDaytimeBrowse.js'

const props = defineProps({
  event: { type: Object, required: true },
  artists: { type: Array, default: () => [] },
  favorite: { type: Boolean, default: false }
})

defineEmits(['toggle-favorite'])

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit' })

const STATUSES = {
  available: { label: 'Tickets available', classes: 'bg-success-muted text-success' },
  'sold out': { label: 'Sold out', classes: 'bg-danger-muted text-danger' },
  free: { label: 'Free', classes: 'bg-accent text-ink' },
  unknown: { label: 'Check tickets', classes: 'bg-elevated text-content-muted' }
}

// Kinds only mean something for daytime events; a club night is just a club night.
const kindLabels = computed(() => (props.event.isParty === false ? (props.event.kinds ?? []).slice(0, 2).map(kind => KIND_LABELS[kind]) : []))

const status = computed(() => STATUSES[props.event.ticketStatus] ?? STATUSES.unknown)

const timeRange = computed(() => {
  const start = clock.format(new Date(props.event.startsAt))
  return props.event.endsAt ? `${start} - ${clock.format(new Date(props.event.endsAt))}` : start
})

// TicketSwap has no public API; a search on the event title is the best deep link.
const ticketSwapUrl = computed(() => `https://www.ticketswap.com/search?query=${encodeURIComponent(props.event.title)}`)

// Your artists first, then the rest of the bill.
const lineupWithYours = computed(() => [
  ...props.artists,
  ...(props.event.lineupNames ?? []).filter(name => !props.artists.includes(name))
])
</script>
