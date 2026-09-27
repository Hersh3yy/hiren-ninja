import type { Project, ProjectImage } from '../types/projects'

// Images still live on the Hygraph asset CDN; VAMS stores those URLs.
const HYGRAPH_ENDPOINT = 'https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clvkp3ut01ajw07wc38106mxt/master'

interface VamsImage { url?: string, path?: string }

function toImages(value: unknown): ProjectImage[] {
  if (!Array.isArray(value)) return []
  return value
    .map((image: VamsImage) => image?.url ?? image?.path)
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
    .map(url => ({ id: url, url }))
}

async function loadFromVams(): Promise<Project[]> {
  const entries = await fetchVamsEntries('projects')
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

async function loadFromHygraph(): Promise<Project[]> {
  const { data } = await $fetch<{ data: { projects: Project[] } }>(HYGRAPH_ENDPOINT, {
    method: 'POST',
    body: {
      query: `{ projects(first: 100) {
        id title shortDescription fullDescription year url projectType slug
        coverImage { id url } screenshots { id url }
      } }`,
    },
    timeout: 15_000,
  })
  return data.projects
}

/** Projects from VAMS; Hygraph's public CDN only while VAMS is unreachable. */
export const loadProjects = defineCachedFunction(async (): Promise<Project[]> => {
  if (isVamsConfigured()) {
    try {
      return await loadFromVams()
    } catch (error) {
      console.warn('[projects] VAMS unavailable, using Hygraph:', (error as Error).message)
    }
  }
  return loadFromHygraph()
}, { name: 'projects', maxAge: 60 * 10, swr: true })
