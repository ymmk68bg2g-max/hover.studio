import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyPage, type PrivacyLocale } from "../../privacy-page";

const supported = ["en", "ua"] as const;

export function generateStaticParams() {
  return supported.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!supported.includes(locale as PrivacyLocale)) return { robots: { index: false, follow: false } };
  const isUa = locale === "ua";

  return {
    title: isUa ? "Політика конфіденційності — HOVER.STUDIO" : "Privacy Policy — HOVER.STUDIO",
    description: isUa
      ? "Інформація про обробку персональних даних через сайт HOVER.STUDIO та під час обговорення співпраці."
      : "Information about personal data processed through the HOVER.STUDIO website and during project discussions.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { en: "/en/privacy", "uk-UA": "/ua/privacy" },
    },
  };
}

export default async function LocalizedPrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!supported.includes(locale as PrivacyLocale)) notFound();
  return <PrivacyPage locale={locale as PrivacyLocale} />;
}
