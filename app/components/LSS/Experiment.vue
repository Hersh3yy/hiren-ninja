<template>
  <div class="space-y-4">
    <!-- Experiment Layout -->
    <div class="flex flex-col xl:flex-row gap-4">
      <!-- Parameter Panel -->
      <div class="xl:w-80 xl:flex-shrink-0">
        <LSSParameterPanel 
          :parameters="parameters"
          @randomize="randomizeParameters"
          @reset="resetParameters"
        />
      </div>
      
      <!-- 3D Viewer - takes remaining space -->
      <div class="flex-1 h-96 xl:h-[600px] min-w-0">
        <LSSViewer 
          :curve-data="curveData"
          :parameters="parameters"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLEDSculpture } from '~/composables/experiments/useLEDSculpture.js'

// Use the composable
const { 
  parameters, 
  curveData, 
  loading,
  randomizeParameters,
  resetParameters
} = useLEDSculpture()
</script>
