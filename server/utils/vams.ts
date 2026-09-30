export interface VamsEntry {
  id: string
  title: string
  content: Record<string, unknown>
  order: number
}

export function isVamsConfigured(): boolean {
  const { vamsApiUrl, vamsApiKey } = useRuntimeConfig()
  return Boolean(vamsApiUrl && vamsApiKey)
}

/** All published entries of one VAMS entry type. The key stays on the server. */
export async function fetchVamsEntries(slug: string): Promise<VamsEntry[]> {
  const { vamsApiUrl, vamsApiKey } = useRuntimeConfig()
  const response = await $fetch<{ data?: { entries: VamsEntry[] } }>(
    `${vamsApiUrl}/entries/by-type/${slug}`,
    // Short on purpose: Netlify functions stop at 10s, and a slow VAMS must still leave
    // time to fall back to the bundled snapshots (ADE, projects).
    { headers: { 'X-API-Key': vamsApiKey, Accept: 'application/json' }, timeout: 4_000 },
  )
  return response.data?.entries ?? []
}

/** A write to VAMS (only the ADE Planner counters accept one). Short timeout: callers wait on it. */
export async function postVams<T>(path: string, body: Record<string, unknown>, timeout = 1_500): Promise<T> {
  const { vamsApiUrl, vamsApiKey } = useRuntimeConfig()
  return $fetch<T>(`${vamsApiUrl}${path}`, {
    method: 'POST',
    body,
    headers: { 'X-API-Key': vamsApiKey, Accept: 'application/json' },
    timeout,
  })
}
