import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/chat", "/intake", "/results"],
    },
    sitemap: "https://webapp-self-rho.vercel.app/sitemap.xml",
  };
}
