<template>
  <section :class="sectionClasses">
    <!-- Section Header -->
    <div v-if="title || subtitle" class="mb-6">
      <h2 v-if="title" :class="titleClasses">
        {{ title }}
      </h2>
      <p v-if="subtitle" :class="subtitleClasses">
        {{ subtitle }}
      </p>
    </div>
    
    <!-- Section Content -->
    <div :class="contentClasses">
      <slot />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: null
  },
  subtitle: {
    type: String,
    default: null
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'elevated', 'filled'].includes(value)
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  titleSize: {
    type: String,
    default: 'lg',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})

const sectionClasses = computed(() => {
  const baseClasses = 'w-full'
  
  const variantClasses = {
    default: '',
    bordered: 'border border-gray-600 rounded-lg',
    elevated: 'bg-gray-800 shadow-lg rounded-lg',
    filled: 'bg-gray-700 rounded-lg'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return [
    baseClasses,
    variantClasses[props.variant],
    paddingClasses[props.padding]
  ].filter(Boolean).join(' ')
})

const titleClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }
  
  return [
    'font-bold text-white mb-2',
    sizeClasses[props.titleSize]
  ].join(' ')
})

const subtitleClasses = computed(() => {
  return 'text-gray-300 text-sm'
})

const contentClasses = computed(() => {
  return 'text-gray-100'
})
</script>
