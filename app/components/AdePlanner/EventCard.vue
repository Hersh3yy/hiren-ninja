<template>
  <li class="rounded-lg border border-border-subtle bg-elevated/40 p-4 hover:border-border-default transition-colors">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <span class="font-mono text-sm text-accent">{{ timeRange }}</span>
      <span
        v-if="soldOut"
        class="rounded bg-danger-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-danger"
      >
        Sold out
      </span>
    </div>

    <a
      :href="adeUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-1 block text-lg font-bold text-content hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
    >
      {{ title }}
      <span class="sr-only">(opens ADE event page in a new tab)</span>
    </a>

    <p v-if="venue" class="text-sm text-content-muted">{{ venue }}</p>

    <p class="mt-2 text-sm text-content-muted">
      <span>{{ 'Lineup: ' }}</span>
      <template v-for="(name, i) in lineupWithYours" :key="name">
        <span :class="artists.includes(name) ? 'font-semibold text-accent' : 'text-content'">{{ name }}</span>{{ i < lineupWithYours.length - 1 ? ', ' : '' }}
      </template>
    </p>
  </li>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  startsAt: { type: String, required: true },
  endsAt: { type: String, default: '' },
  venue: { type: String, default: '' },
  soldOut: { type: Boolean, default: false },
  adeUrl: { type: String, required: true },
  artists: { type: Array, default: () => [] },
  lineup: { type: Array, default: () => [] }
})

// Your artists first, then the rest of the bill.
const lineupWithYours = computed(() => [
  ...props.artists,
  ...props.lineup.filter(name => !props.artists.includes(name))
])

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit' })

const timeRange = computed(() => {
  const start = clock.format(new Date(props.startsAt))
  return props.endsAt ? `${start} - ${clock.format(new Date(props.endsAt))}` : start
})
</script>
