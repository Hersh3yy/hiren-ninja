<template>
  <div class="space-y-2">
    <!-- Label and Value -->
    <div class="flex items-center justify-between">
      <label v-if="label" class="text-sm font-medium text-gray-300">
        {{ label }}
      </label>
      <span class="text-sm text-gray-400">
        {{ displayValue }}{{ suffix }}
      </span>
    </div>
    
    <!-- Slider Input -->
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
    
    <!-- Description -->
    <p v-if="description" class="text-xs text-gray-400">
      {{ description }}
    </p>
    
    <!-- Min/Max Labels -->
    <div v-if="showMinMax" class="flex justify-between text-xs text-gray-500">
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
  const baseClasses = 'w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider'
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
  background: #3B82F6;
  cursor: pointer;
  border: 2px solid #1E40AF;
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #2563EB;
  transform: scale(1.1);
}

.slider::-webkit-slider-thumb:disabled {
  background: #6B7280;
  cursor: not-allowed;
  transform: none;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: 2px solid #1E40AF;
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #2563EB;
  transform: scale(1.1);
}
</style>
