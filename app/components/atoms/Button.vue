<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :href="href || undefined"
    :to="to || undefined"
    :target="href && external ? '_blank' : undefined"
    :rel="href && external ? 'noopener noreferrer' : undefined"
    :disabled="tag === 'button' ? (disabled || loading) : undefined"
    :aria-disabled="tag !== 'button' && (disabled || loading) ? 'true' : undefined"
    :aria-busy="loading || undefined"
    :class="buttonClasses"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
      aria-hidden="true"
    />

    <AtomsIcon
      v-if="iconPath && !loading"
      :path="iconPath"
      size="sm"
      class="mr-2"
    />

    <span>{{ text }}</span>

    <AtomsIcon
      v-if="trailingIconPath"
      :path="trailingIconPath"
      size="sm"
      class="ml-2"
    />

    <span v-if="external && href" class="sr-only">(opens in a new tab)</span>
  </component>
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
    // link / link-muted: an action that reads as text, inline in a sentence or a row of
    // chips ("Show them", "Clear", "Get in touch"). Size is ignored for those.
    validator: (value) => ['primary', 'secondary', 'ghost', 'outline', 'link', 'link-muted'].includes(value)
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
  href: {
    type: String,
    default: ''
  },
  // Internal route; renders a NuxtLink (client-side navigation, prefetch).
  to: {
    type: String,
    default: ''
  },
  external: {
    type: Boolean,
    default: false
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
  iconPath: {
    type: String,
    default: ''
  },
  trailingIconPath: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const NuxtLink = resolveComponent('NuxtLink')
const tag = computed(() => (props.to ? NuxtLink : props.href ? 'a' : 'button'))
const isLink = computed(() => props.variant === 'link' || props.variant === 'link-muted')

const buttonClasses = computed(() => {
  if (isLink.value) {
    return [
      'inline rounded-sm underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed',
      props.variant === 'link' ? 'text-accent hover:text-accent-hover' : 'text-content-muted hover:text-content'
    ].join(' ')
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-accent text-ink hover:bg-accent-hover focus-visible:ring-accent',
    secondary: 'bg-elevated text-content hover:bg-border-default focus-visible:ring-border-default',
    ghost: 'bg-transparent text-content-muted hover:bg-elevated hover:text-content focus-visible:ring-border-default',
    outline: 'border border-accent text-accent hover:bg-accent/10 focus-visible:ring-accent'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const widthClass = props.fullWidth ? 'w-full' : ''
  const disabledLinkClass = props.href && (props.disabled || props.loading)
    ? 'pointer-events-none opacity-50'
    : ''

  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    widthClass,
    disabledLinkClass
  ].filter(Boolean).join(' ')
})

function onClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>
