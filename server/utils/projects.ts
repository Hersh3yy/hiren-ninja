import type { Project, ProjectImage } from '../types/projects'

interface VamsImage { url?: string, path?: string }

function toImages(value: unknown): ProjectImage[] {
  if (!Array.isArray(value)) return []
  return value
    .map((image: VamsImage) => image?.url ?? image?.path)
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
    .map(url => ({ id: url, url }))
}

function toProjects(entries: VamsEntry[]): Project[] {
  return entries.map(({ id, title, content }) => ({
    id,
    title,
    shortDescription: String(content.shortDescription ?? ''),
    fullDescription: String(content.fullDescription ?? ''),
    year: Number(content.year) || 0,
    url: (content.url as string) || null,
    projectType: (content.projectType as string) || null,
    slug: String(content.slug ?? id),
    coverImage: toImages(content.coverImage)[0] ?? null,
    screenshots: toImages(content.screenshots),
  }))
}

// Bundled copy of the VAMS projects (server/assets/projects-snapshot.json), for when
// VAMS is unreachable or not configured. Refresh it by re-exporting from VAMS.
async function loadSnapshot(): Promise<Project[]> {
  const entries = await useStorage('assets:server').getItem<VamsEntry[]>('projects-snapshot.json')
  return toProjects(entries ?? [])
}

/** Projects from VAMS; the bundled snapshot only while VAMS is unreachable. */
export const loadProjects = defineCachedFunction(async (): Promise<Project[]> => {
  if (isVamsConfigured()) {
    try {
      return toProjects(await fetchVamsEntries('projects'))
    } catch (error) {
      console.warn('[projects] VAMS unavailable, using snapshot:', (error as Error).message)
    }
  }
  return loadSnapshot()
}, { name: 'projects', maxAge: 60 * 10, swr: true })
