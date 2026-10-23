import { loadAdeData } from '../../utils/ade-planner/data'
import { ADE_DAYS, artistsBySlug, genresBySlug, venuesBySlug } from '../../utils/ade-planner/seo'

/** Sitemap source (nuxt.config sitemap.sources): the ADE Planner day, budget and artist pages. */
export default defineEventHandler(async () => {
  const data = await loadAdeData()
  return [
    { loc: '/ade-planner/free-parties', changefreq: 'daily', priority: 0.8 },
    ...ADE_DAYS.map(day => ({ loc: `/ade-planner/${day.slug}`, changefreq: 'daily', priority: 0.8 })),
    ...[...genresBySlug(data).keys()].map(slug => ({ loc: `/ade-planner/genre/${slug}`, changefreq: 'daily', priority: 0.7 })),
    ...[...venuesBySlug(data).keys()].map(slug => ({ loc: `/ade-planner/venue/${slug}`, changefreq: 'daily', priority: 0.5 })),
    ...[...artistsBySlug(data).keys()].map(slug => ({ loc: `/ade-planner/artist/${slug}`, changefreq: 'daily', priority: 0.5 })),
  ]
})
