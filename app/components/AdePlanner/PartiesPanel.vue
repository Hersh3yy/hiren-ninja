<template>
  <div class="space-y-6">
    <p class="text-content-muted max-w-2xl">
      Paste a public Spotify, Apple Music, YouTube Music, Tidal or Deezer playlist link, or a list of artist names.
      See who plays Amsterdam Dance Event 2026 (21-25 October), when and where.
    </p>

    <form class="space-y-4" @submit.prevent="run">
      <MoleculesFormField
        v-model="input"
        label="Playlist link or artist names"
        name="ade-planner-input"
        type="textarea"
        :rows="isPlaylistLink ? 3 : 5"
        placeholder="https://open.spotify.com/playlist/...  or one artist per line"
        :described-by="error ? 'ade-planner-status' : ''"
      />

      <div class="flex flex-wrap items-center gap-3">
        <AtomsButton
          type="submit"
          :text="isLoading ? 'Scanning the lineup...' : 'Find my ADE'"
          :loading="isLoading"
          :disabled="isLoading || !input.trim()"
        />
        <AtomsButton
          variant="ghost"
          size="sm"
          text="Try an example"
          :disabled="isLoading"
          @click="input = EXAMPLE"
        />
      </div>

      <MoleculesStatusAlert id="ade-planner-status" :message="error" type="error" />
    </form>

    <p v-if="playlist" class="text-sm text-content-muted">
      Read "{{ playlist.title }}": {{ playlist.trackCount }} tracks, {{ playlist.artists.length }} artists.
      <span v-if="playlist.partial" class="block text-danger">
        Spotify only let us read {{ playlist.trackCount }}{{ playlist.totalTracks > playlist.trackCount ? ` of ${playlist.totalTracks}` : '' }} tracks right now (the oldest and newest).
        Missing someone? Add their names on new lines below the link and search again.
      </span>
      <span v-else-if="playlist.totalTracks > playlist.trackCount" class="block">
        That's the first {{ playlist.trackCount }} of {{ playlist.totalTracks }} tracks. Missing someone? Add their names on new lines below the link.
      </span>
    </p>

    <AdePlannerResults
      v-if="result"
      v-model:genre-filter="genreFilter"
      :days="days"
      :sound="sound"
      :match-count="result.matches.length"
      :query-count="result.matches.length + result.unmatched.length"
      :unmatched="result.unmatched"
      :artists-without-events="artistsWithoutEvents"
      :source="result.source"
      :did-you-mean="result.didYouMean"
      @use-suggestion="useSuggestion"
    />

    <p v-if="daytimeWithYourArtists" class="text-sm text-content-muted">
      Your artists also have {{ daytimeWithYourArtists }} daytime {{ daytimeWithYourArtists === 1 ? 'event' : 'events' }}
      (talks, signings, showcases).
      <AtomsButton variant="link" text="See them in Daytime & networking" @click="$emit('show-daytime', daytimeQuery)" />
    </p>

    <AdePlannerSuggestions
      v-if="result"
      :suggestions="suggestions"
      :loading="suggestionsLoading"
      :exclude-event-ids="matchedEventIds"
    />

  </div>
</template>

<script setup>
import { EXAMPLE_INPUT, useAdePlanner } from '~/composables/useAdePlanner.js'
import { track } from '~/utils/track'

const props = defineProps({
  // Artist names handed over from the daytime tab: fill in and search right away.
  prefill: { type: Array, default: () => [] }
})

defineEmits(['show-daytime'])

const EXAMPLE = EXAMPLE_INPUT

const {
  input, isLoading, error, playlist, result, days, sound, genreFilter,
  suggestions, suggestionsLoading, artistsWithoutEvents, isPlaylistLink, run,
  daytimeWithYourArtists, daytimeQuery
} = useAdePlanner()

const matchedEventIds = computed(() => (result.value?.matches ?? []).flatMap(match => match.events.map(event => event.id)))

// "Did you mean Enrico Sangiuliano?": swap the typo for the lineup name and search again.
function useSuggestion({ query, name }) {
  const lines = input.value.split('\n')
  const at = lines.findIndex(line => line.trim().toLowerCase() === query.trim().toLowerCase())
  if (at >= 0) lines[at] = name
  else lines.push(name)
  input.value = lines.join('\n')
  track('ade-did-you-mean', { kind: 'parties' })
  run()
}

watch(() => props.prefill, (names) => {
  if (names.length) {
    input.value = names.join('\n')
    run()
  }
})
</script>
