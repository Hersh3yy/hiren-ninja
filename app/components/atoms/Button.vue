<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>

    <component
      v-if="icon && !loading"
      :is="icon"
      class="w-4 h-4 mr-2"
    />

    <span>{{ text }}</span>

    <component
      v-if="trailingIcon"
      :is="trailingIcon"
      class="w-4 h-4 ml-2"
    />
  </button>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'ghost', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [String, Object],
    default: null
  },
  trailingIcon: {
    type: [String, Object],
    default: null
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-accent text-ink hover:bg-accent-hover focus:ring-accent',
    secondary: 'bg-elevated text-content hover:bg-border-default focus:ring-border-default',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-content-muted hover:bg-elevated hover:text-content focus:ring-border-default',
    outline: 'border border-border-default text-content-muted hover:bg-elevated hover:text-content focus:ring-border-default'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const widthClass = props.fullWidth ? 'w-full' : ''

  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    widthClass
  ].filter(Boolean).join(' ')
})
</script>
