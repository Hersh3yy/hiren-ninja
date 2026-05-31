import * as THREE from 'three'

/**
 * Simple LED Sculpture Generator Composable
 * Simplified for prototyping and learning Three.js
 */
export function useLEDSculpture() {
  // Basic parameters - focused on LED sculpture loops
  const parameters = reactive({
    loopLength: 20,         // Circumference of the loop in meters
    bendCount: 8,           // Number of major bends around the loop
    bendIntensity: 1.5,     // How dramatic the bends are (0.1-3.0)
    verticalComplexity: 1.0, // How much vertical winding/looping (0.1-3.0)
    twistFactor: 1.0,       // How much the sculpture twists around itself (0.1-3.0)
    randomSeed: 1234,       // For reproducible results
    tubeRadius: 0.08,       // LED tube thickness in meters
    primaryColor: '#00FFFF', // Cyan LED color
    glowIntensity: 0.8      // LED glow effect intensity
  })
  
  const curveData = ref(null)
  const loading = ref(false)
  
  // Simple seeded random function
  function seedRandom(seed) {
    let state = seed
    return function() {
      state = (state * 1103515245 + 12345) % 0x80000000
      return state / 0x80000000
    }
  }
  
  // Generate the curve - closed loop LED sculpture
  function generateCurve() {
    loading.value = true
    
    try {
      const random = seedRandom(parameters.randomSeed)
      const points = []
      
      // Calculate base radius from desired loop length
      const baseRadius = parameters.loopLength / (2 * Math.PI)
      const steps = Math.max(20, parameters.bendCount * 3) // More points for smoother curves
      
      // Generate points around a circle with complex winding patterns
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2 // Full circle
        const progress = i / steps // 0 to 1
        
        // Base circular position
        let x = Math.cos(angle) * baseRadius
        let z = Math.sin(angle) * baseRadius
        let y = 1.5 // Start higher for more dramatic loops
        
        // HORIZONTAL BENDS - Creates the wavy pattern in the XZ plane
        const bendAngle = angle * parameters.bendCount
        const bendRadius = parameters.bendIntensity * 0.4
        
        x += Math.cos(bendAngle) * bendRadius * (0.7 + random() * 0.3)
        z += Math.sin(bendAngle) * bendRadius * (0.7 + random() * 0.3)
        
        // VERTICAL COMPLEXITY - Creates loop-the-loops and dramatic height changes
        const verticalWave1 = Math.sin(angle * parameters.bendCount * 0.5) * parameters.verticalComplexity
        const verticalWave2 = Math.cos(angle * parameters.bendCount * 0.7) * parameters.verticalComplexity * 0.6
        const verticalSpiral = Math.sin(angle * parameters.bendCount * 1.3) * parameters.verticalComplexity * 0.4
        
        // Combine vertical effects for complex 3D patterns
        y += verticalWave1 * 1.2 // Primary vertical waves
        y += verticalWave2 * 0.8 // Secondary waves for complexity
        y += verticalSpiral * 0.5 // Spiral component
        
        // Add height variation that can create loop-the-loops
        const loopIntensity = parameters.verticalComplexity * 0.8
        y += Math.sin(angle * parameters.bendCount * 2) * loopIntensity * Math.sin(progress * Math.PI)
        
        // RANDOMNESS - Controlled organic variation
        const randomFactor = parameters.bendIntensity * 0.15
        x += (random() - 0.5) * randomFactor
        z += (random() - 0.5) * randomFactor
        y += (random() - 0.5) * randomFactor * parameters.verticalComplexity
        
        // TWISTING - Add rotation around the path for self-intersecting patterns
        const twistAngle = progress * Math.PI * 6 * parameters.twistFactor
        const twistRadius = parameters.bendIntensity * 0.2 * parameters.twistFactor
        
        // Create twisting motion that can make the sculpture turn around itself
        const twistX = Math.cos(twistAngle) * twistRadius
        const twistZ = Math.sin(twistAngle) * twistRadius
        
        // Add secondary twist for more complex self-intersection
        const secondaryTwist = Math.sin(progress * Math.PI * 8 * parameters.twistFactor) * twistRadius * 0.5
        
        x += twistX + secondaryTwist * Math.cos(angle)
        z += twistZ + secondaryTwist * Math.sin(angle)
        
        // Add inward/outward movement to create more dramatic self-intersection
        const radialVariation = Math.sin(angle * parameters.bendCount * 0.5 + progress * Math.PI * 4) * parameters.twistFactor * 0.3
        const currentRadius = Math.sqrt(x * x + z * z)
        const newRadius = Math.max(0.5, currentRadius + radialVariation)
        
        // Adjust x,z to maintain radial variation while keeping the twist
        if (currentRadius > 0) {
          const ratio = newRadius / currentRadius
          x *= ratio
          z *= ratio
        }
        
        // Ensure minimum height but allow dramatic dips and loops
        y = Math.max(0.2, y)
        
        // For very high vertical complexity, allow some points to go higher
        if (parameters.verticalComplexity > 2.0) {
          y += Math.max(0, Math.sin(angle * parameters.bendCount * 0.3)) * (parameters.verticalComplexity - 2.0) * 2
        }
        
        points.push(new THREE.Vector3(x, y, z))
      }
      
      // Create smooth closed curve
      const curve = new THREE.CatmullRomCurve3(points, true) // true = closed loop
      
      curveData.value = {
        curve,
        points,
        totalLength: curve.getLength(),
        parameters: { ...parameters }
      }
      
    } catch (error) {
      console.error('Error generating curve:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Simple functions
  function randomizeParameters() {
    parameters.loopLength = Math.floor(Math.random() * 30) + 15 // 15-45m
    parameters.bendCount = Math.floor(Math.random() * 12) + 4 // 4-16 bends
    parameters.bendIntensity = Math.round((Math.random() * 2.5 + 0.5) * 10) / 10 // 0.5-3.0
    parameters.verticalComplexity = Math.round((Math.random() * 2.5 + 0.3) * 10) / 10 // 0.3-2.8
    parameters.twistFactor = Math.round((Math.random() * 2.5 + 0.2) * 10) / 10 // 0.2-2.7
    parameters.randomSeed = Math.floor(Math.random() * 9999) + 1
    generateCurve()
  }
  
  function resetParameters() {
    parameters.loopLength = 20
    parameters.bendCount = 8
    parameters.bendIntensity = 1.5
    parameters.verticalComplexity = 1.0
    parameters.twistFactor = 1.0
    parameters.randomSeed = 1234
    parameters.tubeRadius = 0.08
    parameters.primaryColor = '#00FFFF'
    parameters.glowIntensity = 0.8
    generateCurve()
  }
  
  // Simple debounce function instead of useDebounceFn
  let timeoutId = null
  function debounce(func, delay) {
    return function(...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }
  
  const debouncedRegenerate = debounce(generateCurve, 300)
  
  // Auto-regenerate when parameters change
  watchEffect(() => {
    JSON.stringify(parameters) // Create dependency
    if (import.meta.client) {
      debouncedRegenerate()
    }
  })
  
  // Generate initial curve
  onMounted(() => {
    generateCurve()
  })
  
  return {
    parameters,
    curveData: readonly(curveData),
    loading: readonly(loading),
    randomizeParameters,
    resetParameters
  }
}