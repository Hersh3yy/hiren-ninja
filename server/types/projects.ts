export interface ProjectImage {
  id: string
  url: string
}

export interface Project {
  id: string
  title: string
  shortDescription: string
  fullDescription: string
  year: number
  url: string | null
  projectType: string | null
  slug: string
  coverImage: ProjectImage | null
  screenshots: ProjectImage[]
}
