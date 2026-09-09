<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="label"
    :aria-pressed="pressed === null ? undefined : pressed"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <AtomsIcon :path="iconPath" :size="iconSize" />
  </button>
</template>

<script setup>
const props = defineProps({
  iconPath: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
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
  pressed: {
    type: Boolean,
    default: null
  },
  variant: {
    type: String,
    default: 'ghost',
    validator: (value) => ['ghost', 'bordered'].includes(value)
  },
  iconSize: {
    type: String,
    default: 'sm',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    ghost: 'text-content-muted hover:text-content hover:bg-elevated',
    bordered: 'border border-border-default text-content-muted hover:text-content hover:border-accent-muted'
  }

  return [base, variants[props.variant]].join(' ')
})
</script>
