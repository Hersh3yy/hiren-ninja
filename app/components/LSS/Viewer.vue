<template>
  <div class="relative w-full h-full bg-ink">
    <!-- Three.js canvas will be mounted here -->
    <div ref="canvasContainer" class="w-full h-full"></div>
    
    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 bg-ink/75 flex items-center justify-center">
      <div class="text-center text-content">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
        <p>Generating LED sculpture...</p>
      </div>
    </div>
    
    <!-- Controls overlay -->
    <div class="absolute top-4 left-4 space-y-2">
      <!-- Info panel -->
      <div v-if="curveData" class="bg-black bg-opacity-70 text-content p-3 rounded text-sm">
        <div class="font-semibold text-accent mb-1">LED Sculpture</div>
        <div>Length: {{ Math.round(curveData.totalLength) }}m</div>
        <div>Height: {{ Math.round(maxHeight * 10) / 10 }}m</div>
      </div>
      
      <!-- Controls -->
      <div class="bg-black bg-opacity-70 text-content p-2 rounded space-y-2">
        <!-- Spin controls -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <button
              @click="toggleSpin"
              class="px-3 py-1 bg-accent text-ink hover:bg-accent-hover rounded text-xs transition-colors"
            >
              {{ isSpinning ? '⏸ Pause' : '▶ Spin' }}
            </button>
            <span class="text-xs text-content-muted">Rotation</span>
          </div>
          
          <!-- Speed control -->
          <div class="flex items-center space-x-2">
            <input
              v-model.number="rotationSpeed"
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              class="flex-1 h-1 bg-elevated rounded-lg appearance-none cursor-pointer"
            />
            <span class="text-xs text-content-muted w-12">Speed: {{ rotationSpeed }}x</span>
          </div>
        </div>
        
        <!-- Zoom controls -->
        <div class="flex items-center space-x-2">
          <button
            @click="zoomIn"
            class="px-2 py-1 bg-elevated hover:bg-border-default rounded text-xs transition-colors"
            title="Zoom In"
          >
            🔍+
          </button>
          <button
            @click="zoomOut"
            class="px-2 py-1 bg-elevated hover:bg-border-default rounded text-xs transition-colors"
            title="Zoom Out"
          >
            🔍-
          </button>
          <button
            @click="resetView"
            class="px-2 py-1 bg-elevated hover:bg-border-default rounded text-xs transition-colors"
            title="Reset View"
          >
            ↺
          </button>
          <span class="text-xs text-content-muted">Zoom</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three'

const props = defineProps({
  curveData: Object,
  parameters: Object,
  loading: Boolean
})

const canvasContainer = ref(null)
const isSpinning = ref(false)
const maxHeight = ref(0)
const rotationSpeed = ref(1.0)

let scene, camera, renderer, curve3D, groundGrid, sparkEffect
let animationId = null
const initialCameraPosition = { x: 15, y: 10, z: 15 }
let currentZoom = 1
let sparkProgress = 0

onMounted(() => {
  initThreeJS()
})

watch(() => props.curveData, (newData) => {
  if (newData) {
    updateVisualization(newData)
  }
})

watch(() => props.parameters?.glowIntensity, () => {
  if (curve3D && props.parameters) {
    updateLEDGlow()
  }
})

function initThreeJS() {
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0f) // Darker background for LED effect
  
  // Camera - positioned to show sculpture from a good angle
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  camera.position.set(15, 10, 15)
  camera.lookAt(0, 3, 0)
  
  // Renderer with glow effects
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasContainer.value.appendChild(renderer.domElement)
  
  // Create ground grid
  createGroundGrid()
  
  // Lighting setup for LED sculpture
  const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3) // Dark blue ambient
  scene.add(ambientLight)
  
  // Key light
  const keyLight = new THREE.DirectionalLight(0x4a90e2, 0.5)
  keyLight.position.set(10, 20, 10)
  keyLight.castShadow = true
  scene.add(keyLight)
  
  // Handle resize
  window.addEventListener('resize', handleResize)
  
  // Start render loop
  animate()
}

function createGroundGrid() {
  // Ground plane (invisible but receives shadows)
  const groundGeometry = new THREE.PlaneGeometry(100, 100)
  const groundMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.1
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  
  // Grid helper to show ground reference
  groundGrid = new THREE.GridHelper(50, 50, 0x333366, 0x222244)
  groundGrid.position.y = 0
  scene.add(groundGrid)
}

function updateVisualization(curveData) {
  // Remove existing curve
  if (curve3D) {
    scene.remove(curve3D)
  }
  
  // Calculate max height for display
  maxHeight.value = Math.max(...curveData.points.map(p => p.y))
  
  // Create tube geometry from curve (closed loop)
  const geometry = new THREE.TubeGeometry(
    curveData.curve,
    Math.max(50, curveData.points.length * 2), // More segments for smooth LED effect
    props.parameters?.tubeRadius || 0.08,
    16, // More radial segments for better lighting
    true // Closed loop
  )
  
  // LED-style material with glow
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(props.parameters?.primaryColor || '#00FFFF'),
    emissive: new THREE.Color(props.parameters?.primaryColor || '#00FFFF'),
    emissiveIntensity: (props.parameters?.glowIntensity || 0.8) * 0.3,
    shininess: 100,
    transparent: true,
    opacity: 0.9
  })
  
  curve3D = new THREE.Mesh(geometry, material)
  curve3D.castShadow = true
  scene.add(curve3D)
  
  // Add outer glow effect
  const glowGeometry = new THREE.TubeGeometry(
    curveData.curve,
    Math.max(50, curveData.points.length * 2),
    (props.parameters?.tubeRadius || 0.08) * 1.5,
    16,
    true
  )
  
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(props.parameters?.primaryColor || '#00FFFF'),
    transparent: true,
    opacity: (props.parameters?.glowIntensity || 0.8) * 0.1,
    side: THREE.BackSide
  })
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  curve3D.add(glow) // Attach to main curve so it rotates together
  
  // Create flowing spark effect
  createSparkEffect(curveData.curve)
}

function createSparkEffect(curve) {
  // Remove existing spark effect
  if (sparkEffect) {
    scene.remove(sparkEffect)
  }
  
  // Create spark geometry - a small bright sphere that follows the curve
  const sparkGeometry = new THREE.SphereGeometry(0.05, 8, 8)
  const sparkMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.0
  })
  
  sparkEffect = new THREE.Mesh(sparkGeometry, sparkMaterial)
  scene.add(sparkEffect)
  
  // Add trail effect using multiple spheres
  const trailLength = 10
  const trailSpheres = []
  
  for (let i = 0; i < trailLength; i++) {
    const trailGeometry = new THREE.SphereGeometry(0.02, 6, 6)
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5 * (1 - i / trailLength),
      transparent: true,
      opacity: 1 - (i / trailLength) * 0.8
    })
    
    const trailSphere = new THREE.Mesh(trailGeometry, trailMaterial)
    scene.add(trailSphere)
    trailSpheres.push(trailSphere)
  }
  
  sparkEffect.userData = { curve, trailSpheres }
}

function updateLEDGlow() {
  if (!curve3D || !props.parameters) return
  
  const material = curve3D.material
  material.emissiveIntensity = props.parameters.glowIntensity * 0.3
  
  // Update glow effect
  const glow = curve3D.children[0]
  if (glow) {
    glow.material.opacity = props.parameters.glowIntensity * 0.1
  }
}

function toggleSpin() {
  isSpinning.value = !isSpinning.value
}

function zoomIn() {
  currentZoom *= 0.8 // Zoom in by 20%
  updateCameraPosition()
}

function zoomOut() {
  currentZoom *= 1.25 // Zoom out by 25%
  updateCameraPosition()
}

function resetView() {
  currentZoom = 1
  updateCameraPosition()
}

function updateCameraPosition() {
  if (!camera) return
  
  camera.position.set(
    initialCameraPosition.x * currentZoom,
    initialCameraPosition.y * currentZoom,
    initialCameraPosition.z * currentZoom
  )
  camera.lookAt(0, 3, 0)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  // Controlled rotation with speed control
  if (curve3D && isSpinning.value) {
    curve3D.rotation.y += 0.008 * rotationSpeed.value
  }
  
  // Animate spark effect
  if (sparkEffect && sparkEffect.userData.curve) {
    sparkProgress += 0.01 // Speed of spark movement
    if (sparkProgress > 1) sparkProgress = 0 // Loop back
    
    const curve = sparkEffect.userData.curve
    const trailSpheres = sparkEffect.userData.trailSpheres
    
    // Update main spark position
    const sparkPosition = curve.getPoint(sparkProgress)
    sparkEffect.position.copy(sparkPosition)
    
    // Update trail positions
    for (let i = 0; i < trailSpheres.length; i++) {
      const trailProgress = (sparkProgress - (i + 1) * 0.02) % 1
      if (trailProgress < 0) continue // Don't show trail behind start
      
      const trailPosition = curve.getPoint(trailProgress)
      trailSpheres[i].position.copy(trailPosition)
    }
  }
  
  renderer.render(scene, camera)
}

function handleResize() {
  if (!canvasContainer.value) return
  
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (sparkEffect) {
    scene.remove(sparkEffect)
    if (sparkEffect.userData.trailSpheres) {
      sparkEffect.userData.trailSpheres.forEach(trail => scene.remove(trail))
    }
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>
