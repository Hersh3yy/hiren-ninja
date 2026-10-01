<template>
  <li>
    <MoleculesEventCard
      :time-label="timeLabel"
      :duration-label="durationLabel"
      :title="event.title"
      :meta="meta"
      :people="people"
      :people-max="PEOPLE_ON_CARD"
      :badge="badge"
      :favorite="favorite"
      :expanded="expanded"
      :details-id="detailsId"
      @toggle-details="expanded = !expanded; expanded && track('ade-event-details', { party: event.isParty !== false })"
      @toggle-favorite="$emit('toggle-favorite')"
    />

    <div v-if="expanded" :id="detailsId" class="space-y-3 rounded-b-lg border-x border-b border-accent-muted bg-surface px-4 pb-4 pt-3">
      <p v-if="event.subtitle" class="text-sm text-content">{{ event.subtitle }}</p>

      <p v-if="lineup.length > PEOPLE_ON_CARD" class="text-sm text-content-muted">
        <span>{{ 'Full lineup: ' }}</span>
        <template v-for="(name, i) in lineup" :key="name">
          <span :class="artists.includes(name) ? 'font-bold text-accent' : 'text-content'">{{ name }}</span>{{ i < lineup.length - 1 ? ', ' : '' }}
        </template>
      </p>

      <p v-if="event.address" class="text-sm text-content-muted">{{ event.address }}</p>

      <div v-if="tags.length" class="flex flex-wrap gap-1">
        <AtomsBadge v-for="tag in tags" :key="tag" :text="tag" tone="muted" />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <AtomsButton
          v-if="event.ticketUrl && event.ticketStatus !== 'sold out'"
          :href="event.ticketUrl"
          external
          size="sm"
          :text="event.ticketLabel || 'Tickets'"
          data-umami-event="ade-ticket"
          data-umami-event-kind="shop"
        />
        <AtomsButton
          v-if="event.program !== 'pro'"
          :href="ticketSwapUrl"
          external
          size="sm"
          :variant="event.ticketStatus === 'sold out' ? 'primary' : 'outline'"
          text="Resale on TicketSwap"
          data-umami-event="ade-ticket"
          data-umami-event-kind="ticketswap"
        />
        <AtomsButton :href="event.adeUrl" external size="sm" variant="ghost" text="ADE page" data-umami-event="ade-ticket" data-umami-event-kind="ade-page" />
        <AtomsButton size="sm" variant="ghost" :text="hidden ? 'Show again' : 'Not for me'" @click="$emit('toggle-hidden')" />
      </div>
    </div>
  </li>
</template>

<script setup>
import { KIND_LABELS } from '~/composables/useDaytimeBrowse.js'
import { planningDate } from '~/composables/useAdePlanner.js'
import { track } from '~/utils/track'

const props = defineProps({
  event: { type: Object, required: true },
  artists: { type: Array, default: () => [] },
  favorite: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  // Lists not grouped under day headings (suggestions) put the day on the card.
  showDay: { type: Boolean, default: false }
})

defineEmits(['toggle-favorite', 'toggle-hidden'])

const PEOPLE_ON_CARD = 6

const expanded = ref(false)
const detailsId = useId()

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit' })
const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short' })
const shortDay = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', day: 'numeric', month: 'short' })

// A 9-hour club night is long too, but "drop-in" only helps when planning a day.
const isDropIn = computed(() => props.event.format === 'drop-in' && props.event.isParty === false)
const seriesRange = computed(() => {
  const dates = props.event.seriesDates ?? []
  if (dates.length < 2) return ''
  const day = date => weekday.format(new Date(`${date}T12:00:00+02:00`))
  return `${day(dates[0])}–${day(dates[dates.length - 1])}`
})

const timeLabel = computed(() => {
  if (props.event.timeOfDay === 'tba') return 'TBA'
  if (props.event.timeOfDay === 'all-day') return 'All day'
  return clock.format(new Date(props.event.startsAt))
})

const durationLabel = computed(() => {
  const minutes = props.event.durationMinutes
  // ADE sometimes lists an end before the start; show no duration rather than a negative one.
  if (!minutes || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours}h${rest ? String(rest).padStart(2, '0') : ''}` : `${rest}m`
})

const meta = computed(() => [
  // An after-midnight party shows the night it belongs to, like the day headings do.
  props.showDay && props.event.timeOfDay !== 'tba' ? shortDay.format(planningDate(props.event)) : '',
  props.event.venue,
  props.event.area,
  isDropIn.value ? `Drop-in${seriesRange.value ? ` · ${seriesRange.value}` : ''}` : ''
].filter(Boolean).join(' · '))

// One badge: the thing you need to know before tapping.
const badge = computed(() => {
  switch (props.event.ticketStatus) {
    case 'sold out': return { text: 'Sold out', tone: 'danger' }
    case 'free': return { text: 'Free', tone: 'accent' }
    case 'pro pass': return { text: 'ADE Pro', tone: 'outline' }
    default: return null
  }
})

const lineup = computed(() => [
  ...props.artists,
  ...(props.event.lineupNames ?? []).filter(name => !props.artists.includes(name))
])

const people = computed(() => lineup.value.map(name => ({ name, highlight: props.artists.includes(name) })))

const tags = computed(() => [
  ...(props.event.isParty === false ? (props.event.kinds ?? []).map(kind => KIND_LABELS[kind]).filter(Boolean) : []),
  ...(props.event.genres ?? [])
])

// TicketSwap has no public API; a search on the event title is the best deep link.
const ticketSwapUrl = computed(() => `https://www.ticketswap.com/search?query=${encodeURIComponent(props.event.title)}`)
</script>
