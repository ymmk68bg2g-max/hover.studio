import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "../../../service-page";
import { ChatbotsServicePage } from "../../../chatbots-service-page";
import { getService, isServiceSlug, serviceSlugs, type ServiceLocale } from "../../../services";
import { localizedAlternates, siteUrl, socialMetadata } from "../../../site-config";

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
    alternates: slug === "chatbots" ? {
      canonical: siteUrl(`/${locale}/services/chatbots`),
      languages: {
        uk: siteUrl("/ua/services/chatbots"),
        en: siteUrl("/en/services/chatbots"),
        "x-default": siteUrl("/en/services/chatbots"),
      },
    } : localizedAlternates(locale, `/services/${slug}`),
    ...socialMetadata({ locale, path: `/${locale}/services/${slug}`, title, description: service.intro,
      ...(slug === "chatbots" ? { image: `/images/chatbots-share-${locale}.png` } : {}),
    }),
  };
}

export default async function LocalizedServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isServiceLocale(locale) || !isServiceSlug(slug)) notFound();
  if (slug === "chatbots") return <ChatbotsServicePage locale={locale} />;
  return <ServicePage locale={locale} slug={slug} />;
}
