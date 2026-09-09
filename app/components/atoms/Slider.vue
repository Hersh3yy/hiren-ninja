<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label v-if="label" class="text-sm font-medium text-content" :for="inputId">
        {{ label }}
      </label>
      <span class="text-sm text-content-muted" aria-hidden="true">
        {{ displayValue }}{{ suffix }}
      </span>
    </div>

    <input
      :id="inputId"
      :value="modelValue"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      :aria-valuetext="`${displayValue}${suffix}`"
      :class="sliderClasses"
      @input="handleInput"
    >

    <p v-if="description" :id="descriptionId" class="text-xs text-content-muted">
      {{ description }}
    </p>

    <div v-if="showMinMax" class="flex justify-between text-xs text-content-muted" aria-hidden="true">
      <span>{{ min }}{{ suffix }}</span>
      <span>{{ max }}{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: null
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  suffix: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showMinMax: {
    type: Boolean,
    default: false
  },
  precision: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['update:modelValue'])

const inputId = useId()
const descriptionId = useId()

const displayValue = computed(() => {
  return Math.round(props.modelValue * Math.pow(10, props.precision)) / Math.pow(10, props.precision)
})

const sliderClasses = computed(() => {
  const baseClasses = 'w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer slider'
  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return [baseClasses, disabledClasses].filter(Boolean).join(' ')
})

function handleInput(event) {
  emit('update:modelValue', parseFloat(event.target.value))
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: theme('colors.accent.DEFAULT');
  cursor: pointer;
  border: 2px solid theme('colors.accent.hover');
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: theme('colors.accent.hover');
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: theme('colors.accent.DEFAULT');
  cursor: pointer;
  border: 2px solid theme('colors.accent.hover');
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: theme('colors.accent.hover');
  transform: scale(1.1);
}

@media (prefers-reduced-motion: reduce) {
  .slider::-webkit-slider-thumb,
  .slider::-moz-range-thumb {
    transition: none;
  }

  .slider::-webkit-slider-thumb:hover,
  .slider::-moz-range-thumb:hover {
    transform: none;
  }
}
</style>
