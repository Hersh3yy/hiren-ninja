<template>
  <div class="type-switch">
    <input 
      id="switch-website" 
      name="projectType" 
      type="radio" 
      value="website" 
      class="switch-input" 
      :checked="modelValue === 'website'"
      @change="$emit('update:modelValue', 'website')"
    />
    <label for="switch-website" class="switch-label switch-label-website">Website</label>
    
    <input 
      id="switch-both" 
      name="projectType" 
      type="radio" 
      value="both" 
      class="switch-input" 
      :checked="modelValue === 'both'"
      @change="$emit('update:modelValue', 'both')"
    />
    <label for="switch-both" class="switch-label switch-label-both">Both</label>
    
    <input 
      id="switch-webapp" 
      name="projectType" 
      type="radio" 
      value="webApplication" 
      class="switch-input" 
      :checked="modelValue === 'webApplication'"
      @change="$emit('update:modelValue', 'webApplication')"
    />
    <label for="switch-webapp" class="switch-label switch-label-webapp">Web App</label>
    <span class="switch-selector"></span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.type-switch {
  @apply relative w-[300px] mx-auto rounded-full bg-gray-900 ;
}

.switch-label {
  @apply relative z-10 float-left w-[100px] leading-8 text-xs sm:text-sm font-medium text-gray-600 text-center cursor-pointer transition-colors duration-150;
}

.switch-input {
  @apply hidden;
}

.switch-input:checked + .switch-label {
  @apply text-black;
}

/* Selector positioning and colors */
.switch-input:checked + .switch-label-website ~ .switch-selector {
  @apply translate-x-0 bg-yellow-300;
}

.switch-input:checked + .switch-label-both ~ .switch-selector {
  @apply translate-x-[100px] bg-yellow-500;
}

.switch-input:checked + .switch-label-webapp ~ .switch-selector {
  @apply translate-x-[200px] bg-yellow-300;
}

.switch-selector {
  @apply absolute z-[1] top-0 left-0 block w-[100px] h-8 rounded-full transition-all duration-300 ease-in-out;
}
</style> 