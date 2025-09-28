<template>
  <div class="w-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300">
    <!-- Header (Always Visible) -->
    <div 
      @click="$emit('toggle', experiment.id)"
      class="p-6 cursor-pointer hover:bg-gray-750 transition-colors"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white mb-2">{{ experiment.title }}</h3>
          <p class="text-gray-400 text-sm">{{ experiment.description }}</p>
        </div>
        
        <!-- Expand/Collapse Icon -->
        <div class="ml-4">
          <svg 
            :class="{ 'rotate-180': isOpen }"
            class="w-6 h-6 text-gray-400 transition-transform duration-300"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Expanded Content -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-screen"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 max-h-screen"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isOpen" class="overflow-hidden">
        <div class="px-2 pb-2 border-t border-gray-700">
          <!-- LED Sculpture Experiment -->
          <div v-if="experiment.id === 'led-sculpture-generator'" class="mt-2">
            <LSSExperiment />
          </div>
          
          <!-- Other experiments will go here -->
          <div v-else class="mt-4">
            <div class="text-gray-400 text-sm">
              Experiment coming soon...
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  experiment: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])
</script>

<style scoped>
.max-h-32 {
  max-height: 8rem;
}
</style>