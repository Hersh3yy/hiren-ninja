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
                                :placeholder="placeholderText" required></textarea>
                        </div>

                        <div>
                            <label class="block text-gray-200 mb-2">{{ timelineLabel }}</label>
                            <select v-model="formData.timeline"
                                class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                required>
                                <option value="">Select {{ timelineLabel.toLowerCase() }}</option>
                                <option v-for="option in timelineOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
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
import { ref, computed, watch } from 'vue';

const props = defineProps({
    isOpen: Boolean,
    serviceType: String
});

const emit = defineEmits(['close', 'submit']);

const serviceTitle = computed(() => {
    const titles = {
        discovery: 'Discovery & Consultation',
        website: 'Website Development',
        application: 'Web Applications',
        maintenance: 'Maintenance & Support'
    };
    return titles[props.serviceType] || 'Service Request';
});

// Customize placeholder text based on service type
const placeholderText = computed(() => {
    const placeholders = {
        discovery: "Tell me about your business and what you're looking to achieve with technology. What challenges are you facing?",
        website: "Describe the website you envision. What features do you need? Any specific design preferences?",
        application: "What processes are you looking to automate? Tell me about your workflow and pain points.",
        maintenance: "What issues are you experiencing? What kind of support do you need?"
    };
    return placeholders[props.serviceType] || "Tell me about your project";
});

// Customize timeline options based on service type
const showTimeline = computed(() => props.serviceType !== 'discovery');
const timelineLabel = computed(() =>
    props.serviceType === 'discovery' ? 'Preferred Meeting Time' : 'Timeline'
);
const timelineOptions = computed(() => {
    if (props.serviceType === 'discovery') {
        return [
            { value: 'morning', label: 'Morning (9AM - 12PM EST)' },
            { value: 'afternoon', label: 'Afternoon (1PM - 5PM EST)' },
            { value: 'evening', label: 'Evening (6PM - 8PM EST)' }
        ];
    }
    return [
        { value: 'urgent', label: 'ASAP (1-2 weeks)' },
        { value: 'soon', label: 'Soon (1-2 months)' },
        { value: 'flexible', label: 'Flexible (2+ months)' }
    ];
});

const formData = ref({
    description: '',
    timeline: '',
    name: '',
    email: '',
    serviceType: props.serviceType
});

watch(() => props.serviceType, (newType) => {
    formData.value.serviceType = newType;
}, { immediate: true });

const handleSubmit = async () => {
    try {
        console.log('Submitting form data:', formData.value)
        const response = await $fetch('/.netlify/functions/service-request', {
            method: 'POST',
            body: JSON.stringify(formData.value)
        })
        console.log('Response:', response)
        emit('submit', formData.value)
        close()
    } catch (error) {
        console.error('Error submitting form:', error)
        alert('Failed to submit request. Please try again.')
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