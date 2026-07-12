<template>
  <Teleport to="body">
    <Transition name="project-modal">
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/70" @click="close" />

        <div class="relative min-h-full p-4 flex items-center justify-center">
          <div
            ref="dialogRef"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            tabindex="-1"
            class="w-full max-w-2xl bg-surface rounded-xl p-6 shadow-xl border border-border-subtle outline-none"
          >
            <div class="flex justify-between items-center mb-6">
              <h2 :id="titleId" class="text-2xl font-bold text-accent">{{ serviceTitle }}</h2>
              <AtomsModalCloseButton label="Close service request form" @click="close" />
            </div>

            <form
              class="space-y-6"
              :class="{ 'opacity-50 pointer-events-none': isSubmitting }"
              @submit.prevent="handleSubmit"
            >
              <div>
                <label class="block text-content-muted mb-2" for="service-description">Project Description</label>
                <textarea
                  id="service-description"
                  v-model="formData.description"
                  rows="3"
                  class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                  :placeholder="placeholderText"
                  required
                />
              </div>

              <div>
                <label class="block text-content-muted mb-2" for="service-timeline">{{ timelineLabel }}</label>
                <select
                  id="service-timeline"
                  v-model="formData.timeline"
                  class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                >
                  <option value="">Select {{ timelineLabel.toLowerCase() }}</option>
                  <option v-for="option in timelineOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-content-muted mb-2" for="service-name">Full Name</label>
                  <input
                    id="service-name"
                    v-model="formData.name"
                    type="text"
                    class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-content-muted mb-2" for="service-email">Email</label>
                  <input
                    id="service-email"
                    v-model="formData.email"
                    type="email"
                    class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  >
                </div>
              </div>

              <div
                v-if="statusMessage"
                :class="[
                  'p-3 rounded text-sm',
                  statusMessage.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
                ]"
                role="status"
              >
                {{ statusMessage.text }}
              </div>

              <div class="flex justify-end gap-4">
                <button
                  type="button"
                  class="px-6 py-2 border border-accent text-accent rounded hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent"
                  @click="close"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-accent text-ink rounded hover:bg-accent-hover flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  {{ isSubmitting ? 'Sending...' : 'Send Request' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, useId, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  serviceType: String
})

const emit = defineEmits(['close', 'submit'])

const titleId = useId()
const dialogRef = ref(null)

const { isSubmitting, statusMessage, submit, clearStatus } = useSubmitLead('/api/service-request')

const formData = ref({
  description: '',
  timeline: '',
  name: '',
  email: '',
  serviceType: props.serviceType
})

function close() {
  emit('close')
  formData.value = {
    description: '',
    timeline: '',
    name: '',
    email: '',
    serviceType: props.serviceType
  }
  clearStatus()
}

useModalA11y({
  isOpen: computed(() => props.isOpen),
  onClose: close,
  containerRef: dialogRef
})

const serviceTitle = computed(() => {
  const titles = {
    website: 'Websites & Digital Experiences',
    ai: 'Practical AI That Saves Time',
    automation: 'Remove Repetitive Work',
    backend: 'Reliable Systems That Scale'
  }
  return titles[props.serviceType] || 'Service Request'
})

const placeholderText = computed(() => {
  const placeholders = {
    website: 'Tell me about the site or app you have in mind: what it should say, who it\'s for, and how you want people to feel when they land on it.',
    ai: 'Describe where your time gets eaten up. What decisions, research, or content are slow or repetitive today?',
    automation: 'Walk me through the manual process you want gone — what triggers it, what tools are involved, and what the end result should be.',
    backend: 'Describe what you\'re building or running: current pain points, how it needs to grow, and what\'s most important to you.'
  }
  return placeholders[props.serviceType] || 'Please describe your project'
})

const timelineLabel = computed(() => 'Timeline')

const timelineOptions = computed(() => [
  { value: 'urgent', label: 'Urgent (1-2 weeks)' },
  { value: 'soon', label: 'Standard (1-2 months)' },
  { value: 'flexible', label: 'Flexible (2+ months)' }
])

watch(() => props.serviceType, (newType) => {
  formData.value.serviceType = newType
}, { immediate: true })

async function handleSubmit() {
  try {
    await submit(formData.value)

    setTimeout(() => {
      emit('submit', formData.value)
      close()
    }, 2000)
  } catch {
    // Error message is set by useSubmitLead
  }
}
</script>
