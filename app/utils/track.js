/**
 * Send an Umami event. Silently does nothing when Umami isn't loaded (ad blockers,
 * local dev) so tracking can never break the page.
 * https://docs.umami.is/docs/track-events
 *
 * ADE Planner events ("ade-...") are also counted in VAMS (one ade-usage entry per
 * day), so feature use can be reported without Umami's paid API. Only the event
 * name and one detail (tab, budget, view, ...), never who; batched and sent a few
 * seconds later, or when the page is hidden.
 */
export function track(name, data) {
  try {
    if (typeof window !== 'undefined' && typeof window.umami?.track === 'function') {
      window.umami.track(name, data)
    }
    if (typeof window !== 'undefined' && name.startsWith('ade-')) countUsage(usageKey(name, data))
  } catch {
    // Analytics must never throw into the UI.
  }
}

// The one detail kept with a usage count, in this order of preference.
const DETAIL_KEYS = ['tab', 'budget', 'view', 'section', 'action', 'result', 'kind', 'group']

/** "ade-budget" + { budget: '25' } -> "ade-budget:25" */
export function usageKey(name, data = {}) {
  const key = DETAIL_KEYS.find(k => typeof data?.[k] === 'string' && data[k])
  const detail = key ? String(data[key]).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) : ''
  const base = name.toLowerCase().replace(/[^a-z-]+/g, '-').slice(0, 44)
  return detail ? `${base}:${detail}` : base
}

let queue = []
let timer = null

function flush() {
  clearTimeout(timer)
  timer = null
  if (!queue.length) return
  const body = JSON.stringify({ features: queue.splice(0, 50) })
  const sent = navigator.sendBeacon?.('/api/ade-planner/usage', new Blob([body], { type: 'application/json' }))
  if (!sent) fetch('/api/ade-planner/usage', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {})
}

function countUsage(feature) {
  queue.push(feature)
  if (queue.length >= 50) return flush()
  if (!timer) {
    timer = setTimeout(flush, 5000)
    // Leaving or switching tabs: send what's queued now.
    window.addEventListener('pagehide', flush, { once: true })
    document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush(), { once: true })
  }
}
