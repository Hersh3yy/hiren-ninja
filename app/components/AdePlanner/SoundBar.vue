<template>
  <div v-if="sound.length" class="space-y-2">
    <p class="text-sm text-content-muted">
      Your sound at ADE. Tap a genre to filter.
    </p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
      <button
        v-for="{ genre, count } in sound.slice(0, 10)"
        :key="genre"
        type="button"
        :aria-pressed="modelValue === genre"
        class="rounded-full border px-3 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        :class="modelValue === genre ? 'border-accent bg-accent text-ink font-bold' : 'border-border-default text-content hover:border-accent-muted'"
        @click="$emit('update:modelValue', modelValue === genre ? '' : genre)"
      >
        {{ genre }} <span class="opacity-70">{{ count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sound: { type: Array, required: true },
  modelValue: { type: String, default: '' }
})

defineEmits(['update:modelValue'])
</script>
