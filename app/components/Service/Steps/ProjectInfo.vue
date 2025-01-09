# components/Service/Steps/ProjectInfo.vue
<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-yellow-300">Tell me about your project</h2>

        <div class="space-y-4">
            <div>
                <label class="text-gray-200 block mb-2">What's your main goal?</label>
                <textarea v-model="formData.goal" rows="3"
                    class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                    placeholder="Example: I need a website to showcase my restaurant's menu and take reservations"></textarea>
            </div>

            <div>
                <label class="text-gray-200 block mb-2">Current situation</label>
                <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                        <input type="radio" v-model="formData.currentSituation" value="new"
                            class="text-yellow-300 focus:ring-yellow-300">
                        <span class="text-white">Starting from scratch</span>
                    </label>
                    <label class="flex items-center space-x-2">
                        <input type="radio" v-model="formData.currentSituation" value="existing"
                            class="text-yellow-300 focus:ring-yellow-300">
                        <span class="text-white">Improving existing project</span>
                    </label>
                </div>
            </div>

            <div v-if="formData.currentSituation === 'existing'">
                <label class="text-gray-200 block mb-2">Current website/app URL (if any)</label>
                <input v-model="formData.currentUrl" type="url"
                    class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                    placeholder="https://">
            </div>
        </div>

        <div class="flex justify-between mt-8">
            <button @click="$emit('back')"
                class="px-6 py-2 border border-yellow-300 text-yellow-300 rounded hover:bg-yellow-300/10">
                Back
            </button>
            <button @click="handleNext" :disabled="!isValid"
                class="px-6 py-2 bg-yellow-300 text-black rounded hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update:modelValue', 'next', 'back']);

const formData = ref({
    goal: props.modelValue?.goal || '',
    currentSituation: props.modelValue?.currentSituation || 'new',
    currentUrl: props.modelValue?.currentUrl || ''
});

const isValid = computed(() => {
    if (!formData.value.goal || !formData.value.currentSituation) return false;
    if (formData.value.currentSituation === 'existing' && !formData.value.currentUrl) return false;
    return true;
});

const handleNext = () => {
    emit('update:modelValue', { ...formData.value });
    emit('next');
};
</script>