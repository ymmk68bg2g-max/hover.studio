import type { MetadataRoute } from "next";
import { projectSlugs } from "./projects";
import { serviceSlugs } from "./services";
import { siteUrl } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const homes = ["en", "ua"].map((locale) => ({
    url: siteUrl(`/${locale}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: locale === "en" ? 1 : 0.9,
    alternates: { languages: { en: siteUrl("/en"), "uk-UA": siteUrl("/ua") } },
  }));
  const cases = projectSlugs.flatMap((slug) => ["en", "ua"].map((locale) => ({
    url: siteUrl(`/${locale}/work/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: {
      languages: {
        en: siteUrl(`/en/work/${slug}`),
        "uk-UA": siteUrl(`/ua/work/${slug}`),
      },
    },
  })));
  const services = serviceSlugs.flatMap((slug) => ["en", "ua"].map((locale) => ({
    url: siteUrl(`/${locale}/services/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
    alternates: {
      languages: {
        en: siteUrl(`/en/services/${slug}`),
        "uk-UA": siteUrl(`/ua/services/${slug}`),
      },
    },
  })));
  return [...homes, ...services, ...cases];
}
