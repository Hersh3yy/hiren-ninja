# components/Service/Modal.vue
<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/70" @click="close"></div>

            <div class="relative min-h-full p-4 flex items-center justify-center">
                <div class="w-full max-w-2xl bg-black/95 rounded-xl p-6 shadow-xl">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-yellow-300">{{ serviceTitle }}</h2>
                        <button @click="close" class="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <!-- Form -->
                    <form @submit.prevent="handleSubmit" class="space-y-6">
                        <div>
                            <label class="block text-gray-200 mb-2">Project Description</label>
                            <textarea v-model="formData.description" rows="3"
                                class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                placeholder="Tell me about your project and what you're looking to achieve"
                                required></textarea>
                        </div>

                        <div>
                            <label class="block text-gray-200 mb-2">Timeline</label>
                            <select v-model="formData.timeline"
                                class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                required>
                                <option value="">Select timeline</option>
                                <option value="urgent">ASAP (1-2 weeks)</option>
                                <option value="soon">Soon (1-2 months)</option>
                                <option value="flexible">Flexible (2+ months)</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-200 mb-2">Full Name</label>
                                <input v-model="formData.name" type="text"
                                    class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                    required>
                            </div>
                            <div>
                                <label class="block text-gray-200 mb-2">Email</label>
                                <input v-model="formData.email" type="email"
                                    class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                    required>
                            </div>
                        </div>

                        <div class="flex justify-end gap-4">
                            <button type="button" @click="close"
                                class="px-6 py-2 border border-yellow-300 text-yellow-300 rounded hover:bg-yellow-300/10">
                                Cancel
                            </button>
                            <button type="submit"
                                class="px-6 py-2 bg-yellow-300 text-black rounded hover:bg-yellow-400">
                                Send Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    isOpen: Boolean,
    serviceType: String
});

const emit = defineEmits(['close', 'submit']);

const formData = ref({
    description: '',
    timeline: '',
    name: '',
    email: '',
    serviceType: props.serviceType
});

const serviceTitle = computed(() => {
    const titles = {
        discovery: 'Discovery & Consultation',
        website: 'Website Development',
        application: 'Web Applications',
        maintenance: 'Maintenance & Support'
    };
    return titles[props.serviceType] || '';
});

const handleSubmit = async (formData) => {
    try {
        await $fetch('/.netlify/functions/service-request', {
            method: 'POST',
            body: formData
        })
        modalOpen.value = false
    } catch (error) {
        console.error('Error:', error)
    }
}

const close = () => {
    emit('close');
    formData.value = {
        description: '',
        timeline: '',
        name: '',
        email: '',
        serviceType: props.serviceType
    };
};
</script>