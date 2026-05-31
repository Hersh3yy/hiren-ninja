<template>
  <div class="mb-4 sm:mb-6 -mx-4 px-4">
    <div class="overflow-x-auto">
      <div class="inline-flex space-x-2 pb-2">
        <AtomsTag
          v-for="year in years"
          :key="year"
          :label="year"
          interactive
          :active="activeFilters.includes(year)"
          @click="emit('toggleFilter', year)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['toggleFilter'])

defineProps({
  years: {
    type: Array,
    required: true
  },
  activeFilters: {
    type: Array,
    required: true
  }
})
</script>
