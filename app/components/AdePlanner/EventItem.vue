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
      @toggle-details="toggleDetails"
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

      <p v-if="event.address" class="text-sm text-content-muted">
        {{ [event.address, event.place?.neighbourhood, event.area].filter(Boolean).join(' · ') }}<span v-if="event.place?.acrossIj"> · north of the IJ, take the ferry</span>
      </p>

      <p v-if="event.alsoListedAs?.length" class="text-sm text-content-muted">
        Also listed by ADE as
        <template v-for="(other, i) in event.alsoListedAs" :key="other.id">
          <AtomsButton variant="link-muted" :href="other.ticketUrl || other.adeUrl" external :text="other.title" />{{ i < event.alsoListedAs.length - 1 ? ', ' : '' }}
        </template>
      </p>

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
          :data-umami-event-title="event.title"
          @click="countTicketClick"
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
          :data-umami-event-title="event.title"
          @click="countTicketClick"
        />
        <AtomsButton
          :href="event.adeUrl"
          external
          size="sm"
          variant="ghost"
          text="ADE page"
          data-umami-event="ade-ticket"
          data-umami-event-kind="ade-page"
          :data-umami-event-title="event.title"
          @click="countTicketClick"
        />
        <AtomsButton
          size="sm"
          :variant="favorite ? 'outline' : 'secondary'"
          :text="favorite ? '★ In my plan' : 'Save to my plan'"
          :aria-pressed="favorite"
          @click="$emit('toggle-favorite')"
        />
        <AtomsButton size="sm" variant="ghost" :text="hidden ? 'Show again' : 'Not for me'" @click="$emit('toggle-hidden')" />
      </div>
    </div>
  </li>
</template>

<script setup>
import { TOPIC_LABELS } from '~/composables/useDaytimeBrowse.js'
import { track } from '~/utils/track'
import { isFreeEntry, priceLabel } from '../../../server/utils/ade-planner/price'
import { vibeLabel } from '../../../server/utils/ade-planner/vibe'

const props = defineProps({
  event: { type: Object, required: true },
  artists: { type: Array, default: () => [] },
  favorite: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  // In a dialog (timetable block opened): show the details straight away.
  initiallyExpanded: { type: Boolean, default: false }
})

defineEmits(['toggle-favorite', 'toggle-hidden'])

const PEOPLE_ON_CARD = 6

const expanded = ref(props.initiallyExpanded)
const detailsId = useId()

// Anonymous per-event counters in VAMS (opens, ticketClicks); fire and forget.
function countEventAction(action) {
  globalThis.$fetch?.('/api/ade-planner/event-action', { method: 'POST', body: { eventId: props.event.id, action } }).catch(() => {})
}

function toggleDetails() {
  expanded.value = !expanded.value
  if (!expanded.value) return
  track('ade-event-details', { kind: props.event.isParty !== false ? 'party' : 'daytime', party: props.event.isParty !== false, title: props.event.title })
  countEventAction('open')
}

function countTicketClick() {
  track('ade-ticket-click', { kind: props.event.isParty !== false ? 'party' : 'daytime' })
  countEventAction('ticket')
}

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit' })
const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short' })

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
  props.event.venue,
  props.event.area,
  vibeLabel(props.event),
  isDropIn.value ? `Drop-in${seriesRange.value ? ` · ${seriesRange.value}` : ''}` : ''
].filter(Boolean).join(' · '))

// One badge: the thing you need to know before tapping.
const badge = computed(() => {
  switch (props.event.ticketStatus) {
    case 'sold out': return { text: 'Sold out', tone: 'danger' }
    case 'pro pass': return { text: 'ADE Pro', tone: 'outline' }
  }
  const price = priceLabel(props.event)
  if (!price) return null
  return { text: price, tone: isFreeEntry(props.event) ? 'accent' : 'outline' }
})

const lineup = computed(() => [
  ...props.artists,
  ...(props.event.lineupNames ?? []).filter(name => !props.artists.includes(name))
])

const people = computed(() => lineup.value.map(name => ({ name, highlight: props.artists.includes(name) })))

const tags = computed(() => [
  ...(props.event.isParty === false ? (props.event.topics ?? []).map(topic => TOPIC_LABELS[topic]).filter(Boolean) : []),
  ...(props.event.genres ?? [])
])

// TicketSwap has no public API; a search on the event title is the best deep link.
// A merged listing ("A / B") searches on its first name.
const ticketSwapUrl = computed(() => `https://www.ticketswap.com/search?query=${encodeURIComponent(props.event.title.split(' / ')[0])}`)
</script>
