import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/expenses", "/clients", "/ledger", "/onboarding"],
      },
    ],
    sitemap: "https://flowwled.com/sitemap.xml",
  };
}
