import { cookies, headers } from "next/headers";
import { isProductionHost } from "./site-config";

// proxy.ts overwrites this internal header from the actual request pathname.
// Native Next.js has no Vinext request-context module.
async function explicitRequestLocale(): Promise<"ua" | "en" | null> {
  const pathname = (await headers()).get("x-hover-request-pathname");
  const locale = pathname?.match(/^\/(ua|en)(?=\/|$)/)?.[1];
  return locale === "ua" || locale === "en" ? locale : null;
}

export async function getRequestIndexing(): Promise<{ index: boolean; follow: boolean }> {
  const requestHeaders = await headers();
  // Use the request's actual host; forwarded host is only a fallback for a
  // hosting adapter that omits Host. Unknown/local/preview hosts stay noindex.
  const host = requestHeaders.get("host") ?? requestHeaders.get("x-forwarded-host")?.split(",")[0] ?? null;
  const index = isProductionHost(host);
  return { index, follow: index };
}

export async function getRequestLocale(): Promise<"ua" | "en"> {
  const explicit = await explicitRequestLocale();
  if (explicit) return explicit;
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const saved = cookieStore.get("hover_locale")?.value;
  const country = requestHeaders.get("cf-ipcountry") ?? requestHeaders.get("x-vercel-ip-country");
  const language = requestHeaders.get("accept-language") ?? "";
  return saved === "ua" || saved === "en"
    ? saved
    : country === "UA" || /(^|,)\s*uk\b/i.test(language)
      ? "ua"
      : "en";
}
