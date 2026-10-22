import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LocaleEntry({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const saved = cookieStore.get("hover_locale")?.value;
  const country = requestHeaders.get("cf-ipcountry") ?? requestHeaders.get("x-vercel-ip-country");
  const language = requestHeaders.get("accept-language") ?? "";
  const locale = saved === "ua" || saved === "en"
    ? saved
    : country === "UA" || /(^|,)\s*uk\b/i.test(language)
      ? "ua"
      : "en";

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    } else if (value !== undefined) {
      query.append(key, value);
    }
  }
  const search = query.toString();
  redirect(`/${locale}${search ? `?${search}` : ""}`);
}
