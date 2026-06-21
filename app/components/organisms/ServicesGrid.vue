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
    title: 'Websites & Digital Experiences',
    description:
      'A fast, beautiful digital presence that tells your story the way you want it told — and keeps working for you long after launch.',
    features: [
      'Portfolio sites for photographers, designers & artists',
      'Built around who you are and who you\'re talking to',
      'Looks and feels right on every device',
      'Easy to update, easy to hand off'
    ]
  },
  {
    id: 'ai',
    title: 'Practical AI That Saves Time',
    description:
      'AI built into the way you already work — not a gimmick, but a genuine time-saver that keeps you in control.',
    features: [
      'Speed up research, writing, and content creation',
      'Automate repetitive decisions and lookups',
      'Always keep a human in the loop',
      'No hype, just real leverage'
    ]
  },
  {
    id: 'automation',
    title: 'Remove Repetitive Work',
    description:
      'Connect the tools you already use and let the routine stuff run itself — so your energy goes into the work that actually matters.',
    features: [
      'Auto-generate release schedules, invoices, or reports',
      'Connect booking, CRM, and communication tools',
      'Trigger notifications and handoffs automatically',
      'Free up hours every single week'
    ]
  },
  {
    id: 'backend',
    title: 'Reliable Systems That Scale',
    description:
      'The engine under the hood — secure, fast, and built to grow with your business without breaking when it matters most.',
    features: [
      'Your data stored securely and accessed quickly',
      'APIs that connect your tools and platforms',
      'Scales as your audience and business grow',
      'Built to last, not just to ship'
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
