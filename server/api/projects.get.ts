export default defineEventHandler(async () => {
  const projects = await loadProjects()
  return [...projects].sort((a, b) => b.year - a.year)
})
