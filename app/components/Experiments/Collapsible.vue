<template>
  <!-- Native disclosure: <summary> is the button (keyboard, aria-expanded for free) and
       name="experiments" makes the browser keep one open at a time. -->
  <details
    name="experiments"
    class="w-full bg-surface rounded-lg overflow-hidden border border-border-subtle hover:border-border-default transition-all duration-300"
    :open="isOpen"
    @toggle="onToggle"
  >
    <summary
      class="block cursor-pointer list-none p-6 hover:bg-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent [&::-webkit-details-marker]:hidden"
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
    </summary>

    <Transition
      enter-active-class="transition-all duration-300 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-screen"
      leave-active-class="transition-all duration-300 ease-in motion-reduce:transition-none"
      leave-from-class="opacity-100 max-h-screen"
      leave-to-class="opacity-0 max-h-0"
    >
      <!-- Mounted only while open, so an experiment's heavy code loads on demand. -->
      <div v-if="isOpen" class="overflow-hidden">
        <div class="px-2 pb-2 border-t border-border-subtle">
          <div v-if="experimentComponent" class="mt-2">
            <component :is="experimentComponent" />
          </div>
          <div v-else class="mt-4">
            <div class="text-content-muted text-sm">
              Experiment coming soon...
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </details>
</template>

<script setup>
import { computed } from 'vue'
import { ICONS } from '~/utils/icons'
import { LazyLSSExperiment } from '#components'

const EXPERIMENT_COMPONENTS = {
  'led-sculpture-generator': LazyLSSExperiment
}

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

// Fires for clicks and for the browser closing this one when another opens.
function onToggle(event) {
  if (event.target.open !== props.isOpen) emit('toggle', props.experiment.id, event.target.open)
}

const experimentComponent = computed(() => EXPERIMENT_COMPONENTS[props.experiment.id] ?? null)
</script>
