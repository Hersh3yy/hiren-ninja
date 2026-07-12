import { ref } from 'vue'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const DEFAULT_DURATION_MS = 360

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function rectToStyle(rect) {
  return {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    zIndex: '70',
    objectFit: 'cover',
    borderRadius: '0.75rem',
    pointerEvents: 'none'
  }
}

/**
 * FLIP-style shared element transition between a card image and modal hero.
 */
export function useSharedElementTransition() {
  const isAnimating = ref(false)

  function animateClone(clone, fromRect, toRect, durationMs) {
    return new Promise((resolve) => {
      Object.assign(clone.style, rectToStyle(fromRect))
      document.body.appendChild(clone)

      // Force layout before animating to the destination rect
      clone.getBoundingClientRect()

      clone.style.transition = `top ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), left ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), width ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), height ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), border-radius ${durationMs}ms ease`

      requestAnimationFrame(() => {
        Object.assign(clone.style, {
          top: `${toRect.top}px`,
          left: `${toRect.left}px`,
          width: `${toRect.width}px`,
          height: `${toRect.height}px`
        })
      })

      const finish = () => {
        clone.removeEventListener('transitionend', finish)
        resolve()
      }

      clone.addEventListener('transitionend', finish)
      window.setTimeout(finish, durationMs + 80)
    })
  }

  async function runOpen({ sourceEl, targetSelector, imageUrl, durationMs = DEFAULT_DURATION_MS }) {
    if (!sourceEl || !imageUrl || prefersReducedMotion()) {
      return
    }

    isAnimating.value = true
    const fromRect = sourceEl.getBoundingClientRect()

    const clone = document.createElement('img')
    clone.src = imageUrl
    clone.alt = ''
    clone.setAttribute('aria-hidden', 'true')
    clone.className = 'shared-element-clone'

    // Brief wait so the modal can mount and expose the target
    await new Promise((r) => requestAnimationFrame(r))
    await new Promise((r) => requestAnimationFrame(r))

    const targetEl = typeof targetSelector === 'string'
      ? document.querySelector(targetSelector)
      : targetSelector

    if (!targetEl) {
      isAnimating.value = false
      return
    }

    const toRect = targetEl.getBoundingClientRect()
    targetEl.style.opacity = '0'

    try {
      await animateClone(clone, fromRect, toRect, durationMs)
    } finally {
      clone.remove()
      targetEl.style.opacity = ''
      isAnimating.value = false
    }
  }

  async function runClose({ sourceSelector, targetEl, imageUrl, durationMs = DEFAULT_DURATION_MS }) {
    if (!targetEl || !imageUrl || prefersReducedMotion()) {
      return
    }

    isAnimating.value = true

    const sourceEl = typeof sourceSelector === 'string'
      ? document.querySelector(sourceSelector)
      : sourceSelector

    const fromEl = sourceEl || targetEl
    const fromRect = fromEl.getBoundingClientRect()
    const toRect = targetEl.getBoundingClientRect()

    const clone = document.createElement('img')
    clone.src = imageUrl
    clone.alt = ''
    clone.setAttribute('aria-hidden', 'true')
    clone.className = 'shared-element-clone'

    if (sourceEl) {
      sourceEl.style.opacity = '0'
    }

    try {
      await animateClone(clone, fromRect, toRect, durationMs)
    } finally {
      clone.remove()
      if (sourceEl) {
        sourceEl.style.opacity = ''
      }
      isAnimating.value = false
    }
  }

  return {
    isAnimating,
    runOpen,
    runClose,
    prefersReducedMotion
  }
}
