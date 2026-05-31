<template>
  <div class="w-full bg-surface rounded-lg overflow-hidden border border-border-subtle hover:border-border-default transition-all duration-300">
    <!-- Header (Always Visible) -->
    <div 
      class="p-6 cursor-pointer hover:bg-elevated transition-colors"
      @click="$emit('toggle', experiment.id)"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-content mb-2">{{ experiment.title }}</h3>
          <p class="text-content-muted text-sm">{{ experiment.description }}</p>
        </div>
        
        <!-- Expand/Collapse Icon -->
        <div class="ml-4">
          <svg 
            :class="{ 'rotate-180': isOpen }"
            class="w-6 h-6 text-content-muted transition-transform duration-300"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
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
        <div class="px-2 pb-2 border-t border-border-subtle">
          <!-- LED Sculpture Experiment -->
          <div v-if="experiment.id === 'led-sculpture-generator'" class="mt-2">
            <LSSExperiment />
          </div>
          
          <!-- Other experiments will go here -->
          <div v-else class="mt-4">
            <div class="text-content-muted text-sm">
              Experiment coming soon...
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  experiment: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])
</script>

<style scoped>
.max-h-32 {
  max-height: 8rem;
}
</style>