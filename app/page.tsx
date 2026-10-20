import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LocaleEntry() {
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

  redirect(`/${locale}`);
}
