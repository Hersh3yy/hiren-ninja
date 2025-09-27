import * as THREE from 'three'

/**
 * Mathematical utilities for curve generation
 */

/**
 * Generate a seeded random number generator
 * @param {number} seed - The seed value
 * @returns {function} Random number generator function
 */
export function createSeededRandom(seed) {
  let m = 0x80000000 // 2**31
  let a = 1103515245
  let c = 12345
  
  let state = seed
  return function() {
    state = (a * state + c) % m
    return state / (m - 1)
  }
}

/**
 * Calculate the curvature at a point on a curve
 * @param {THREE.Vector3[]} points - Array of curve points
 * @param {number} index - Index of the point to calculate curvature for
 * @returns {number} Curvature value
 */
export function calculateCurvature(points, index) {
  if (index <= 0 || index >= points.length - 1) return 0
  
  const p1 = points[index - 1]
  const p2 = points[index]
  const p3 = points[index + 1]
  
  const v1 = new THREE.Vector3().subVectors(p2, p1).normalize()
  const v2 = new THREE.Vector3().subVectors(p3, p2).normalize()
  
  const cross = new THREE.Vector3().crossVectors(v1, v2)
  const dot = v1.dot(v2)
  
  return Math.atan2(cross.length(), dot)
}

/**
 * Smooth a curve using moving average
 * @param {THREE.Vector3[]} points - Original curve points
 * @param {number} windowSize - Size of smoothing window
 * @returns {THREE.Vector3[]} Smoothed points
 */
export function smoothCurve(points, windowSize = 3) {
  const smoothed = []
  const halfWindow = Math.floor(windowSize / 2)
  
  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - halfWindow)
    const end = Math.min(points.length - 1, i + halfWindow)
    
    const sum = new THREE.Vector3()
    let count = 0
    
    for (let j = start; j <= end; j++) {
      sum.add(points[j])
      count++
    }
    
    smoothed.push(sum.divideScalar(count))
  }
  
  return smoothed
}

/**
 * Calculate the total length of a curve
 * @param {THREE.Vector3[]} points - Curve points
 * @returns {number} Total length
 */
export function calculateCurveLength(points) {
  let totalLength = 0
  
  for (let i = 1; i < points.length; i++) {
    totalLength += points[i].distanceTo(points[i - 1])
  }
  
  return totalLength
}

/**
 * Resample a curve to have uniform spacing
 * @param {THREE.Vector3[]} points - Original points
 * @param {number} targetSpacing - Desired spacing between points
 * @returns {THREE.Vector3[]} Resampled points
 */
export function resampleCurve(points, targetSpacing) {
  if (points.length < 2) return points
  
  const resampled = [points[0].clone()]
  let currentDistance = 0
  let targetDistance = targetSpacing
  
  for (let i = 1; i < points.length; i++) {
    const segmentLength = points[i].distanceTo(points[i - 1])
    currentDistance += segmentLength
    
    while (currentDistance >= targetDistance) {
      // Interpolate point at exact target distance
      const excess = currentDistance - targetDistance
      const t = 1 - (excess / segmentLength)
      
      const interpolated = new THREE.Vector3()
        .lerpVectors(points[i - 1], points[i], t)
      
      resampled.push(interpolated)
      targetDistance += targetSpacing
    }
  }
  
  // Always include the last point
  if (resampled[resampled.length - 1].distanceTo(points[points.length - 1]) > 0.001) {
    resampled.push(points[points.length - 1].clone())
  }
  
  return resampled
}

/**
 * Generate noise-based displacement for organic curves
 * @param {THREE.Vector3} position - Current position
 * @param {number} time - Time parameter for animation
 * @param {number} scale - Scale of the noise
 * @returns {THREE.Vector3} Displacement vector
 */
export function generateNoiseDisplacement(position, time = 0, scale = 1) {
  // Simple Perlin-like noise approximation
  const x = position.x * 0.1 + time * 0.01
  const y = position.y * 0.1 + time * 0.01
  const z = position.z * 0.1 + time * 0.01
  
  const noiseX = Math.sin(x * 2.1) * Math.cos(y * 1.7) * Math.sin(z * 2.3)
  const noiseY = Math.cos(x * 1.9) * Math.sin(y * 2.2) * Math.cos(z * 1.8)
  const noiseZ = Math.sin(x * 2.4) * Math.sin(y * 1.6) * Math.cos(z * 2.0)
  
  return new THREE.Vector3(noiseX, noiseY, noiseZ).multiplyScalar(scale)
}

/**
 * Create a spiral pattern around a base curve
 * @param {THREE.Vector3[]} baseCurve - Base curve points
 * @param {number} radius - Spiral radius
 * @param {number} frequency - Spiral frequency
 * @returns {THREE.Vector3[]} Spiral curve points
 */
export function createSpiral(baseCurve, radius = 1, frequency = 1) {
  const spiral = []
  
  for (let i = 0; i < baseCurve.length; i++) {
    const t = i / (baseCurve.length - 1)
    const angle = t * Math.PI * 2 * frequency
    
    const basePoint = baseCurve[i]
    
    // Create local coordinate system
    let forward = new THREE.Vector3(0, 0, 1)
    if (i < baseCurve.length - 1) {
      forward = new THREE.Vector3().subVectors(baseCurve[i + 1], basePoint).normalize()
    }
    
    const up = new THREE.Vector3(0, 1, 0)
    const right = new THREE.Vector3().crossVectors(forward, up).normalize()
    const correctedUp = new THREE.Vector3().crossVectors(right, forward)
    
    // Apply spiral displacement
    const spiralOffset = new THREE.Vector3()
      .addScaledVector(right, Math.cos(angle) * radius)
      .addScaledVector(correctedUp, Math.sin(angle) * radius)
    
    spiral.push(basePoint.clone().add(spiralOffset))
  }
  
  return spiral
}

/**
 * Analyze curve complexity and provide metrics
 * @param {THREE.Vector3[]} points - Curve points
 * @returns {object} Analysis metrics
 */
export function analyzeCurve(points) {
  if (points.length < 3) {
    return { 
      complexity: 0, 
      averageCurvature: 0, 
      totalLength: 0,
      boundingBox: null 
    }
  }
  
  const totalLength = calculateCurveLength(points)
  let totalCurvature = 0
  let maxCurvature = 0
  
  for (let i = 1; i < points.length - 1; i++) {
    const curvature = calculateCurvature(points, i)
    totalCurvature += curvature
    maxCurvature = Math.max(maxCurvature, curvature)
  }
  
  const averageCurvature = totalCurvature / (points.length - 2)
  
  const boundingBox = new THREE.Box3().setFromPoints(points)
  const dimensions = boundingBox.getSize(new THREE.Vector3())
  
  // Complexity metric based on curvature variation and length
  const complexity = (averageCurvature * 10 + maxCurvature * 5) * 
                    Math.log(totalLength + 1) * 
                    Math.log(points.length + 1)
  
  return {
    complexity: Math.round(complexity * 100) / 100,
    averageCurvature: Math.round(averageCurvature * 1000) / 1000,
    maxCurvature: Math.round(maxCurvature * 1000) / 1000,
    totalLength: Math.round(totalLength * 100) / 100,
    pointCount: points.length,
    dimensions,
    boundingBox,
    fabricationEstimate: {
      estimatedLEDs: Math.ceil(totalLength * 30), // 30 LEDs per meter
      estimatedPower: Math.ceil(totalLength * 30 * 0.3), // 0.3W per LED
      complexity: complexity < 10 ? 'Simple' : complexity < 50 ? 'Moderate' : 'Complex'
    }
  }
}
