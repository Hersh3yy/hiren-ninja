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
    { headers: { 'X-API-Key': vamsApiKey, Accept: 'application/json' }, timeout: 20_000 },
  )
  return response.data?.entries ?? []
}
