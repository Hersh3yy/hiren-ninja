<template>
  <div class="mb-4 sm:mb-6 -mx-4 px-4">
    <div class="overflow-x-auto">
      <div class="inline-flex space-x-2 pb-2">
        <button
          v-for="year in years"
          :key="year"
          @click="emit('toggleFilter', year)"
          :class="[
            'px-3 py-1 rounded-full text-xs sm:text-sm transition-colors duration-200',
            activeFilters.includes(year)
              ? 'bg-yellow-300 text-black'
              : 'bg-gray-700 text-white hover:bg-gray-600',
          ]"
        >
          {{ year }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["toggleFilter"]);

defineProps({
  years: {
    type: Array,
    required: true,
  },
  activeFilters: {
    type: Array,
    required: true,
  },
});
</script>
