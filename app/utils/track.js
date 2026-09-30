/**
 * Send an Umami event. Silently does nothing when Umami isn't loaded (ad blockers,
 * local dev) so tracking can never break the page.
 * https://docs.umami.is/docs/track-events
 */
export function track(name, data) {
  try {
    if (typeof window !== 'undefined' && typeof window.umami?.track === 'function') {
      window.umami.track(name, data)
    }
  } catch {
    // Analytics must never throw into the UI.
  }
}
