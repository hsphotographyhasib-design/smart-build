import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hasanurjaya.com"

  const routes = [
    "",
    "/about",
    "/services",
    "/services/general-construction",
    "/services/architectural-design",
    "/services/project-management",
    "/services/renovation-remodeling",
    "/services/infrastructure-development",
    "/services/green-building",
    "/projects",
    "/industries",
    "/products",
    "/safety",
    "/careers",
    "/news",
    "/gallery",
    "/contact",
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }))
}
