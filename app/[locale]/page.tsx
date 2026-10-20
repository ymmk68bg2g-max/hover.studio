import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HoverSite } from "../site-client";
import { localizedAlternates, socialMetadata } from "../site-config";

const supported = ["en", "ua"] as const;
type Locale = (typeof supported)[number];

export function generateStaticParams() {
  return supported.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!supported.includes(locale as Locale)) return { robots: { index: false, follow: false } };
  const isUa = locale === "ua";
  const title = isUa ? "HOVER.STUDIO — Дизайн, що реагує" : "HOVER.STUDIO — Design that responds";
  const description = isUa
    ? "Незалежна digital-студія з Києва. Стратегія, дизайн, розробка та motion для амбітного бізнесу."
    : "Independent digital studio in Kyiv creating distinctive websites through strategy, design, development and motion.";
  return {
    title,
    description,
    alternates: localizedAlternates(locale as Locale),
    ...socialMetadata({ locale: locale as Locale, path: `/${locale}`, title, description }),
  };
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!supported.includes(locale as Locale)) notFound();
  return <HoverSite locale={locale as Locale} />;
}
