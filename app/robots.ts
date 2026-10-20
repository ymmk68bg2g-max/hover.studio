import type { MetadataRoute } from "next";
import { getRequestIndexing } from "./request-locale";
import { siteUrl } from "./site-config";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { index } = await getRequestIndexing();
  return {
    rules: index ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
