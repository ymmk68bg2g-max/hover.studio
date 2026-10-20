import type { Metadata } from "next";
import { NotFoundView } from "./not-found-view";
import { getRequestLocale } from "./request-locale";

export const metadata: Metadata = {
  title: "404 — HOVER.STUDIO",
  description: "The requested page could not be found.",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const fallbackLocale = await getRequestLocale();
  return <NotFoundView fallbackLocale={fallbackLocale} />;
}
