<template>
  <div v-if="sound.length" class="space-y-2">
    <p class="text-sm text-content-muted">
      Your sound at ADE. Tap a genre to filter.
    </p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
      <AtomsChip
        v-for="{ genre, count } in sound.slice(0, 5)"
        :key="genre"
        size="sm"
        :text="genre"
        :count="count"
        :pressed="modelValue === genre"
        @click="$emit('update:modelValue', modelValue === genre ? '' : genre)"
      />
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
