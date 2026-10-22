<template>
  <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="label">
    <span class="w-14 shrink-0 text-xs font-bold uppercase tracking-wide text-content-muted">{{ label }}</span>
    <AtomsChip
      v-for="option in options"
      :key="option.value"
      size="sm"
      :text="option.label"
      :pressed="isOn(option.value)"
      @click="toggle(option.value)"
    />
  </div>
</template>

<script setup>
// A labelled row of toggle chips. Single choice by default (tap again to clear), or `multiple`.
const props = defineProps({
  label: { type: String, required: true },
  /** [{ value, label }] */
  options: { type: Array, required: true },
  /** a string, or an array when `multiple` */
  modelValue: { type: [String, Array], default: '' },
  multiple: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const isOn = (value) => (props.multiple ? props.modelValue.includes(value) : props.modelValue === value)

function toggle(value) {
  if (props.multiple) {
    emit('update:modelValue', isOn(value) ? props.modelValue.filter(item => item !== value) : [...props.modelValue, value])
  } else {
    emit('update:modelValue', isOn(value) ? '' : value)
  }
}
</script>
