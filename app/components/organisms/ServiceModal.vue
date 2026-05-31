<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/70" @click="close"></div>

      <div class="relative min-h-full p-4 flex items-center justify-center">
        <div class="w-full max-w-2xl bg-surface rounded-xl p-6 shadow-xl border border-border-subtle">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-accent">{{ serviceTitle }}</h2>
            <button @click="close" class="text-content-muted hover:text-content">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6"
            :class="{ 'opacity-50 pointer-events-none': isSubmitting }">
            <div>
              <label class="block text-content-muted mb-2">Project Description</label>
              <textarea v-model="formData.description" rows="3"
                class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                :placeholder="placeholderText" required></textarea>
            </div>

            <div>
              <label class="block text-content-muted mb-2">{{ timelineLabel }}</label>
              <select v-model="formData.timeline"
                class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                required>
                <option value="">Select {{ timelineLabel.toLowerCase() }}</option>
                <option v-for="option in timelineOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-content-muted mb-2">Full Name</label>
                <input v-model="formData.name" type="text"
                  class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                  required>
              </div>
              <div>
                <label class="block text-content-muted mb-2">Email</label>
                <input v-model="formData.email" type="email"
                  class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                  required>
              </div>
            </div>

            <div v-if="statusMessage" :class="[
              'p-3 rounded text-sm',
              statusMessage.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
            ]">
              {{ statusMessage.text }}
            </div>

            <div class="flex justify-end gap-4">
              <button type="button" @click="close"
                class="px-6 py-2 border border-accent text-accent rounded hover:bg-accent/10">
                Cancel
              </button>
              <button type="submit"
                class="px-6 py-2 bg-accent text-ink rounded hover:bg-accent-hover flex items-center gap-2"
                :disabled="isSubmitting">
                <span v-if="isSubmitting"
                  class="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"></span>
                {{ isSubmitting ? 'Sending...' : 'Send Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  serviceType: String
})

const emit = defineEmits(['close', 'submit'])

const isSubmitting = ref(false)
const statusMessage = ref(null)

const serviceTitle = computed(() => {
  const titles = {
    website: 'Website Development & Maintenance',
    ai: 'A.I. Integration into Business',
    automation: 'Workflow Automation',
    backend: 'High-Performance Backends'
  }
  return titles[props.serviceType] || 'Service Request'
})

const placeholderText = computed(() => {
  const placeholders = {
    website: 'Share your vision for the site or app: key features, audience, and any technical or maintenance requirements.',
    ai: 'Describe the workflow or product where AI could add leverage. What decisions, content, or lookups are slow or manual today?',
    automation: 'Outline the manual, repetitive process you want gone. What triggers it, what systems are involved, and what should happen automatically?',
    backend: 'Detail the system that needs to scale or speed up: current load, pain points, and the performance targets you care about.'
  }
  return placeholders[props.serviceType] || 'Please describe your project requirements'
})

const timelineLabel = computed(() => 'Timeline')

const timelineOptions = computed(() => {
  return [
    { value: 'urgent', label: 'Urgent (1-2 weeks)' },
    { value: 'soon', label: 'Standard (1-2 months)' },
    { value: 'flexible', label: 'Flexible (2+ months)' }
  ]
})

const formData = ref({
  description: '',
  timeline: '',
  name: '',
  email: '',
  serviceType: props.serviceType
})

watch(() => props.serviceType, (newType) => {
  formData.value.serviceType = newType
}, { immediate: true })

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    statusMessage.value = null

    const response = await fetch('/.netlify/functions/service-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit request')
    }

    statusMessage.value = {
      type: 'success',
      text: 'Request submitted successfully! We\'ll be in touch soon.'
    }

    setTimeout(() => {
      emit('submit', formData.value)
      close()
    }, 2000)
  } catch (error) {
    console.error('Error submitting form:', error)
    statusMessage.value = {
      type: 'error',
      text: 'Failed to submit request. Please try again or contact us directly.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  emit('close')
  formData.value = {
    description: '',
    timeline: '',
    name: '',
    email: '',
    serviceType: props.serviceType
  }
  statusMessage.value = null
}
</script>
