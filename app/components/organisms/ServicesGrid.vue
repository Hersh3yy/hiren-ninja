<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MoleculesServiceCard
        v-for="service in services"
        :key="service.id"
        :title="service.title"
        :description="service.description"
        :features="service.features"
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
import { services } from '~/data/services'

const modalOpen = ref(false)
const selectedService = ref(null)

function openModal(serviceId) {
  selectedService.value = serviceId
  modalOpen.value = true
}

function handleSubmit() {
  modalOpen.value = false
}
</script>
