<template>
  <div class="w-full bg-surface rounded-lg overflow-hidden border border-border-subtle hover:border-border-default transition-all duration-300">
    <button
      type="button"
      class="w-full text-left p-6 hover:bg-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      @click="$emit('toggle', experiment.id)"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <span class="block text-xl font-bold text-content mb-2">{{ experiment.title }}</span>
          <span class="block text-content-muted text-sm">{{ experiment.description }}</span>
        </div>

        <AtomsIcon
          :path="ICONS.chevronDown"
          size="md"
          class="ml-4 text-content-muted transition-transform duration-300 shrink-0"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-screen"
      leave-active-class="transition-all duration-300 ease-in motion-reduce:transition-none"
      leave-from-class="opacity-100 max-h-screen"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isOpen" :id="panelId" class="overflow-hidden" role="region" :aria-label="experiment.title">
        <div class="px-2 pb-2 border-t border-border-subtle">
          <div v-if="experiment.id === 'led-sculpture-generator'" class="mt-2">
            <LSSExperiment />
          </div>
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
import { useId } from 'vue'
import { ICONS } from '~/utils/icons'

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

const panelId = useId()
</script>
