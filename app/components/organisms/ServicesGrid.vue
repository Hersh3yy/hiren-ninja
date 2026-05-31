<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MoleculesServiceCard
        v-for="service in services"
        :key="service.id"
        v-bind="service"
        @start="openModal(service.id)"
      />
    </div>

    <OrganismsServiceModal
      :is-open="modalOpen"
      :service-type="selectedService"
      @close="modalOpen = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const services = [
  {
    id: 'website',
    title: 'Web Development & Maintenance',
    description:
      'I think with you to figure out your needs, then deliver a modern, fast digital presence and keep it healthy over time.',
    features: [
      'A modern, fast website or app',
      'Built around your real needs',
      'Looks great on every device',
      'Easy to keep updated'
    ]
  },
  {
    id: 'ai',
    title: 'A.I. Integration into Business',
    description:
      'Feasible? Let\'s see how artificial intelligence can help you reach your goals while staying human.',
    features: [
      'Spot where AI genuinely helps',
      'Speed up research, content, or support',
      'Always keep a human in the loop',
      'Practical, no hype'
    ]
  },
  {
    id: 'automation',
    title: 'Workflow Automation',
    description:
      'Add smart automation to your processes and create time you can spend elsewhere.',
    features: [
      'Remove repetitive manual work',
      'Connect the tools you already use',
      'Let routine tasks run themselves',
      'Free up time for what matters'
    ]
  },
  {
    id: 'backend',
    title: 'High-Performance Backends',
    description:
      'Secure storing, updating, and serving of your data, right where it needs to be.',
    features: [
      'Your data stored securely',
      'Fast, reliable access',
      'Grows as you grow',
      'Always up to date'
    ]
  }
]

const modalOpen = ref(false)
const selectedService = ref(null)

const openModal = (serviceId) => {
  selectedService.value = serviceId
  modalOpen.value = true
}

const handleSubmit = () => {
  modalOpen.value = false
}
</script>
