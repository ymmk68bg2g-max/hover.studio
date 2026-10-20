import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "../../../case-study";
import { getProject, projectSlugs, type ProjectLocale, type ProjectSlug } from "../../../projects";
import { localizedAlternates, socialMetadata } from "../../../site-config";

export function generateStaticParams() {
  return (["en", "ua"] as const).flatMap((locale) => projectSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!(locale === "en" || locale === "ua") || !projectSlugs.includes(slug as ProjectSlug)) return {};
  const project = getProject(locale, slug as ProjectSlug);
  const title = `${project.title} — HOVER.STUDIO`;
  return {
    title,
    description: project.description,
    alternates: localizedAlternates(locale, `/work/${slug}`),
    ...socialMetadata({ locale, path: `/${locale}/work/${slug}`, title, description: project.description, image: project.preview ?? undefined }),
  };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!(locale === "en" || locale === "ua") || !projectSlugs.includes(slug as ProjectSlug)) notFound();
  return <CaseStudy locale={locale as ProjectLocale} slug={slug as ProjectSlug} />;
}
