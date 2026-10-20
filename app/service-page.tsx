import Image from "next/image";
import Link from "next/link";
import { LocaleSync } from "./locale-sync";
import { getProject } from "./projects";
import { PriceText } from "./price-text";
import { getService, type ServiceLocale, type ServiceSlug } from "./services";
import { SiteHeader } from "./site-chrome";

const copy = {
  en: {
    service: "SERVICE", start: "START A PROJECT", when: "WHEN IT FITS",
    scope: "SCOPE", agreedScope: "Agreed scope may include", separate: "Agreed separately when needed",
    workTitle: "RELEVANT WORK", viewCase: "VIEW CASE", process: "PROCESS & ESTIMATE",
    processTitle: "How the work is shaped", estimateTitle: "Timeline & budget",
  },
  ua: {
    service: "ПОСЛУГА", start: "ПОЧАТИ ПРОЄКТ", when: "КОЛИ ПІДХОДИТЬ",
    scope: "ОБСЯГ РОБІТ", agreedScope: "Погоджений обсяг може охоплювати", separate: "За потреби погоджуємо окремо",
    workTitle: "ДОРЕЧНІ КЕЙСИ", viewCase: "ДИВИТИСЯ КЕЙС", process: "ПРОЦЕС І ОЦІНКА",
    processTitle: "Як формується робота", estimateTitle: "Строки й бюджет",
  },
} as const;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function ServicePage({ locale, slug }: { locale: ServiceLocale; slug: ServiceSlug }) {
  const service = getService(locale, slug);
  const ui = copy[locale];
  const otherLocale: ServiceLocale = locale === "ua" ? "en" : "ua";
  const contactHref = "#contact";
  const languageHref = `/${otherLocale}/services/${slug}`;

  return (
    <div className="service-page" lang={locale === "ua" ? "uk" : "en"} data-service={service.id}>
      <LocaleSync locale={locale} />
      <SiteHeader locale={locale} pageKind="service" languageHref={languageHref} />

      <main className="service-page-main" id="main">
        <section className="service-intro" id="top" aria-labelledby="service-title" data-scroll-region="hero">
          <div className="service-section-label"><span>{ui.service}</span><span><PriceText value={service.price} /></span></div>
          <h1 className="service-text-title" id="service-title">{service.name}</h1>
          <div className="service-intro-copy">
            <p className="service-text-lead">{service.intro}</p>
            <a className="service-primary-cta" href={contactHref}><span>{ui.start}</span><Arrow /></a>
          </div>
        </section>

        <section className="service-editorial-section service-when" aria-labelledby="service-when-title" data-scroll-region="service-when">
          <span className="service-section-index">02 / {ui.when}</span>
          <h2 className="service-text-lead" id="service-when-title">{service.whenItFits}</h2>
        </section>

        <section className="service-editorial-section service-scope" aria-labelledby="service-scope-title" data-scroll-region="service-scope">
          <span className="service-section-index">03 / {ui.scope}</span>
          <div className="service-scope-columns">
            <div className="service-content-group"><h2 className="service-content-subheading" id="service-scope-title">{ui.agreedScope}</h2><ul>{service.scope.map((item) => <li className="service-text-body" key={item}>{item}</li>)}</ul></div>
            <div className="service-content-group"><h2 className="service-content-subheading">{ui.separate}</h2><ul>{service.separatelyAgreed.map((item) => <li className="service-text-body" key={item}>{item}</li>)}</ul></div>
          </div>
        </section>

        {service.relatedWork.length > 0 && (
          <section className="service-editorial-section service-related" aria-labelledby="service-work-title" data-scroll-region="service-related">
            <span className="service-section-index">04 / {ui.workTitle}</span>
            <h2 id="service-work-title" className="sr-only">{ui.workTitle}</h2>
            <div className="service-related-grid">
              {service.relatedWork.map((projectSlug, index) => {
                const project = getProject(locale, projectSlug);
                return (
                  <Link className="service-related-card" href={`/${locale}/work/${projectSlug}`} key={projectSlug}>
                    <figure>{project.preview && <Image src={project.preview} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized />}</figure>
                    <div>
                      <span>{String(index + 1).padStart(2, "0")} / {project.category}</span>
                      <strong>{project.title}</strong><p className="service-text-body">{project.description}</p><span>{ui.viewCase} <Arrow /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="service-editorial-section service-process" aria-labelledby="service-process-title" data-scroll-region="service-process">
          <span className="service-section-index">{service.relatedWork.length > 0 ? "05" : "04"} / {ui.process}</span>
          <div className="service-process-grid">
            <div className="service-content-group"><h2 className="service-content-subheading" id="service-process-title">{ui.processTitle}</h2><p className="service-text-body">{service.process}</p></div>
            <div className="service-content-group"><h2 className="service-content-subheading">{ui.estimateTitle}</h2><p className="service-text-body">{service.estimate}</p></div>
          </div>
        </section>

      </main>
    </div>
  );
}
