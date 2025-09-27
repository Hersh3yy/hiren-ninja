<template>
  <div class="p-4 space-y-4">
    <h3 class="text-lg font-semibold text-white mb-4">LED Sculpture Parameters</h3>
    
    <!-- Loop Length -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Loop Length: {{ parameters.loopLength }}m
      </label>
      <input
        v-model.number="parameters.loopLength"
        type="range"
        min="10"
        max="50"
        step="1"
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
    
    <!-- Bend Count -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Number of Bends: {{ parameters.bendCount }}
      </label>
      <input
        v-model.number="parameters.bendCount"
        type="range"
        min="3"
        max="16"
        step="1"
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
    
    <!-- Bend Intensity -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Bend Intensity: {{ parameters.bendIntensity }}
      </label>
      <input
        v-model.number="parameters.bendIntensity"
        type="range"
        min="0.1"
        max="3.0"
        step="0.1"
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
    
    <!-- Vertical Complexity -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Vertical Complexity: {{ parameters.verticalComplexity }}
        <span class="text-xs text-gray-400">(loops & winding)</span>
      </label>
      <input
        v-model.number="parameters.verticalComplexity"
        type="range"
        min="0.1"
        max="3.0"
        step="0.1"
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
    
    <!-- Seed -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Variation Seed: {{ parameters.randomSeed }}
      </label>
      <input
        v-model.number="parameters.randomSeed"
        type="range"
        min="1"
        max="9999"
        step="1"
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
    
    <!-- LED Glow Intensity -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        LED Glow: {{ parameters.glowIntensity }}
      </label>
      <input
        v-model.number="parameters.glowIntensity"
        type="range"
        min="0.1"
        max="2.0"
        step="0.1"
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
    
    <!-- Action Buttons -->
    <div class="space-y-2 pt-4">
      <button
        @click="$emit('randomize')"
        class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        Randomize
      </button>
      <button
        @click="$emit('reset')"
        class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  parameters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['randomize', 'reset'])
</script>
