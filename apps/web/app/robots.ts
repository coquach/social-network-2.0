import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/(platform)/conversations", "/(platform)/notifications"],
      },
    ],
    sitemap: "https://sentimeta.vercel.app/sitemap.xml",
  }
}
