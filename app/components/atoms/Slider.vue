<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label v-if="label" class="text-sm font-medium text-content">
        {{ label }}
      </label>
      <span class="text-sm text-content-muted">
        {{ displayValue }}{{ suffix }}
      </span>
    </div>

    <input
      :value="modelValue"
      @input="handleInput"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :class="sliderClasses"
    />

    <p v-if="description" class="text-xs text-content-muted">
      {{ description }}
    </p>

    <div v-if="showMinMax" class="flex justify-between text-xs text-content-muted">
      <span>{{ min }}{{ suffix }}</span>
      <span>{{ max }}{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup>
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
  background: #fde047;
  cursor: pointer;
  border: 2px solid #facc15;
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #facc15;
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #fde047;
  cursor: pointer;
  border: 2px solid #facc15;
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #facc15;
  transform: scale(1.1);
}
</style>
