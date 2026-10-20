import type { Metadata } from "next";

// The approved public identity stays stable on preview and production hosts.
export const SITE_ORIGIN = "https://byhover.studio";
export const SITE_NAME = "HOVER.STUDIO";
export const DEFAULT_SOCIAL_IMAGE = "/images/yevheniy-polosenko.webp";

export function siteUrl(path = "/"): string {
  return new URL(path, SITE_ORIGIN).href;
}

export function isProductionHost(host: string | null): boolean {
  if (!host) return false;
  try {
    const hostname = new URL(`https://${host.trim()}`).hostname.toLowerCase();
    const productionHostname = new URL(SITE_ORIGIN).hostname;
    return hostname === productionHostname || hostname === `www.${productionHostname}`;
  } catch {
    return false;
  }
}

export function localizedAlternates(locale: "ua" | "en", suffix = ""): Metadata["alternates"] {
  return {
    canonical: siteUrl(`/${locale}${suffix}`),
    languages: {
      en: siteUrl(`/en${suffix}`),
      "uk-UA": siteUrl(`/ua${suffix}`),
      "x-default": siteUrl(`/en${suffix}`),
    },
  };
}

export function socialMetadata({ locale, path, title, description, image = DEFAULT_SOCIAL_IMAGE }: {
  locale: "ua" | "en";
  path: string;
  title: string;
  description: string;
  image?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = siteUrl(image);
  return {
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "ua" ? "uk_UA" : "en_US",
      alternateLocale: locale === "ua" ? "en_US" : "uk_UA",
      url: siteUrl(path),
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: image === DEFAULT_SOCIAL_IMAGE ? "summary" : "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
  };
}
