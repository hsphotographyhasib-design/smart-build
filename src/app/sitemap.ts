import { MetadataRoute } from "next"
import { company } from "@/lib/corporate-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = company.website

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/projects",
    "/industries",
    "/products",
    "/safety",
    "/careers",
    "/news",
    "/gallery",
    "/contact",
    "/privacy",
    "/terms",
  ]

  const serviceRoutes = company.services.map((s) => `/services/${s.slug}`)
  const projectRoutes = company.projects.map((p) => `/projects/${p.slug}`)

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }))
}
