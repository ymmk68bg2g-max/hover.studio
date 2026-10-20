"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ContactForm } from "./contact-form";
import { contactEmail } from "./contact-settings";
import { isServiceSlug } from "./services";
import { SiteFooter, type SiteLocale, type SitePageKind } from "./site-chrome";

const copy = {
  en: {
    label: "09 / START",
    interiorLabel: "LET’S DISCUSS YOUR PROJECT",
    headline: ["HAVE", "SOMETHING", "IN MIND?"],
    intro: "Tell us what you are building. We will reply with the right questions and a practical next step.",
    location: ["KYIV / UKRAINE", "WORKING WORLDWIDE"],
  },
  ua: {
    label: "09 / СТАРТ",
    interiorLabel: "ОБГОВОРІМО ПРОЄКТ",
    headline: ["МАЄТЕ", "ЩОСЬ", "НА ДУМЦІ?"],
    intro: "Розкажіть, що ви створюєте. Ми відповімо правильними питаннями та практичним наступним кроком.",
    location: ["КИЇВ / УКРАЇНА", "ПРАЦЮЄМО ПО ВСЬОМУ СВІТУ"],
  },
} as const;

export function SitePageEnd({ fallbackLocale }: { fallbackLocale: SiteLocale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parts = pathname.split("/").filter(Boolean);
  const hasLocale = parts[0] === "ua" || parts[0] === "en";
  const locale: SiteLocale = hasLocale ? parts[0] as SiteLocale : fallbackLocale;
  const otherLocale = locale === "ua" ? "en" : "ua";
  const pageKind: SitePageKind = hasLocale && parts.length === 1 ? "home"
    : parts[1] === "services" ? "service"
    : parts[1] === "work" ? "project"
    : "default";
  const languageHref = hasLocale ? `/${otherLocale}${pathname.slice(locale.length + 1)}` : `/${otherLocale}`;
  const requestedService = searchParams.get("service");
  const routeService = parts[1] === "services" ? parts[2] : undefined;
  const initialService = isServiceSlug(routeService) ? routeService
    : isServiceSlug(requestedService) ? requestedService : undefined;
  const t = copy[locale];
  const contactRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;
    const root = document.documentElement;
    // Preserve the light canvas at the top and match the footer during overscroll.
    const observer = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-footer-visible", entry.isIntersecting);
    });
    observer.observe(footer);
    return () => {
      observer.disconnect();
      root.removeAttribute("data-footer-visible");
    };
  }, [pathname]);

  useEffect(() => {
    const elements = contactRef.current?.querySelectorAll(".reveal");
    if (!elements) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname, locale]);

  return (
    <div className="site-page-end" lang={locale === "ua" ? "uk" : "en"} data-site-page-end>
      <section id="contact" className="contact section-pad" ref={contactRef} aria-labelledby="contact-title" data-scroll-region="contact">
        <div className="section-label reveal"><span>{pageKind === "home" ? t.label : t.interiorLabel}</span></div>
        <div className="contact-grid">
          <div className="contact-intro reveal">
            <h2 id="contact-title">{t.headline.map(line => <span key={line}>{line}</span>)}</h2>
            <p>{t.intro}</p>
            <div>
              {t.location.map(line => <span key={line}>{line}</span>)}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          </div>
          <div className="contact-form-wrap reveal">
            <ContactForm key={`${pathname}:${locale}:${initialService ?? ""}`} locale={locale} initialService={initialService} />
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} pageKind={pageKind} languageHref={languageHref} />
    </div>
  );
}
