import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "../../../service-page";
import { getService, isServiceSlug, serviceSlugs, type ServiceLocale } from "../../../services";
import { localizedAlternates, socialMetadata } from "../../../site-config";

const serviceLocales = ["en", "ua"] as const satisfies readonly ServiceLocale[];

function isServiceLocale(value: string): value is ServiceLocale {
  return serviceLocales.some((locale) => locale === value);
}

export function generateStaticParams() {
  return serviceLocales.flatMap((locale) => serviceSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceLocale(locale) || !isServiceSlug(slug)) return { robots: { index: false, follow: false } };
  const service = getService(locale, slug);
  const title = `${service.name} — HOVER.STUDIO`;
  return {
    title,
    description: service.intro,
    alternates: localizedAlternates(locale, `/services/${slug}`),
    ...socialMetadata({ locale, path: `/${locale}/services/${slug}`, title, description: service.intro }),
  };
}

export default async function LocalizedServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isServiceLocale(locale) || !isServiceSlug(slug)) notFound();
  return <ServicePage locale={locale} slug={slug} />;
}
