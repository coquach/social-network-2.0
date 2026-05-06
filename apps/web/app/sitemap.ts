import { MetadataRoute } from "next";

export default async function sitemap() : Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: '/',
      lastModified: new Date(),
      priority: 1,
      changeFrequency: 'daily',
    },
    {
      url: '/search',
      lastModified: new Date(),
    },
    {
      url: '/posts',
      lastModified: new Date(),
    },
    {
      url: '/users',
      lastModified: new Date(),
    },
  ]
}