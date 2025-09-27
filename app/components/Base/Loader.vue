<template>
  <div :class="containerClasses">
    <!-- Spinner -->
    <div v-if="type === 'spinner'" :class="spinnerClasses"></div>
    
    <!-- Dots -->
    <div v-else-if="type === 'dots'" class="flex space-x-1">
      <div 
        v-for="i in 3" 
        :key="i"
        :class="dotClasses"
        :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
      ></div>
    </div>
    
    <!-- Pulse -->
    <div v-else-if="type === 'pulse'" :class="pulseClasses"></div>
    
    <!-- Text (optional) -->
    <p v-if="text" :class="textClasses">{{ text }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'dots', 'pulse'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  text: {
    type: String,
    default: null
  },
  overlay: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'white', 'gray'].includes(value)
  }
})

const containerClasses = computed(() => {
  const baseClasses = 'flex flex-col items-center justify-center'
  const overlayClasses = props.overlay ? 'absolute inset-0 bg-gray-900 bg-opacity-75 z-50' : ''
  
  return [baseClasses, overlayClasses].filter(Boolean).join(' ')
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4'
  }
  
  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500'
  }
  
  return [
    'animate-spin rounded-full border-t-transparent',
    sizeClasses[props.size],
    colorClasses[props.color]
  ].join(' ')
})

const dotClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }
  
  const colorClasses = {
    blue: 'bg-blue-500',
    white: 'bg-white',
    gray: 'bg-gray-500'
  }
  
  return [
    'rounded-full animate-bounce',
    sizeClasses[props.size],
    colorClasses[props.color]
  ].join(' ')
})

const pulseClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  const colorClasses = {
    blue: 'bg-blue-500',
    white: 'bg-white',
    gray: 'bg-gray-500'
  }
  
  return [
    'rounded-full animate-pulse',
    sizeClasses[props.size],
    colorClasses[props.color]
  ].join(' ')
})

const textClasses = computed(() => {
  const colorClasses = {
    blue: 'text-blue-200',
    white: 'text-white',
    gray: 'text-gray-300'
  }
  
  return [
    'mt-2 text-sm font-medium',
    colorClasses[props.color]
  ].join(' ')
})
</script>
