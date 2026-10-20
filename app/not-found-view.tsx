"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSync } from "./locale-sync";
import { SiteHeader } from "./site-chrome";

const copy = {
  ua: {
    eyebrow: "ПОМИЛКА / 404",
    title: "Цю сторінку не знайдено.",
    body: "Можливо, посилання змінилося. Поверніться на головну або перегляньте наші роботи.",
    home: "НА ГОЛОВНУ",
    work: "ПЕРЕГЛЯНУТИ ПРОЄКТИ",
  },
  en: {
    eyebrow: "ERROR / 404",
    title: "This page couldn’t be found.",
    body: "The link may have changed. Return to the homepage or explore our work.",
    home: "BACK TO HOME",
    work: "VIEW WORK",
  },
} as const;

export function NotFoundView({ fallbackLocale = "en" }: { fallbackLocale?: "ua" | "en" }) {
  const pathname = usePathname();
  const locale = pathname === "/ua" || pathname.startsWith("/ua/")
    ? "ua"
    : pathname === "/en" || pathname.startsWith("/en/")
      ? "en"
      : fallbackLocale;
  const t = copy[locale];
  const otherLocale = locale === "ua" ? "en" : "ua";

  return (
    <div className="not-found-page" lang={locale === "ua" ? "uk" : "en"}>
      <LocaleSync locale={locale} />
      <SiteHeader locale={locale} pageKind="default" languageHref={`/${otherLocale}`} />

      <main className="not-found-page__main" id="main">
        <section className="not-found-page__content" id="top" aria-labelledby="not-found-title">
          <p className="not-found-page__eyebrow">{t.eyebrow}</p>
          <p className="not-found-page__code" aria-hidden="true">
            404
          </p>
          <h1 className="content-heading" id="not-found-title">{t.title}</h1>
          <p className="not-found-page__description content-body">{t.body}</p>
          <div className="not-found-page__actions">
            <Link href={`/${locale}`}>{t.home}</Link>
            <a href={`/${locale}#work`}>{t.work}</a>
          </div>
        </section>
      </main>
    </div>
  );
}
