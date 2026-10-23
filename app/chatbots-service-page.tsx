import { chatbotsCopy, type ChatbotsCopy } from "./chatbots-copy";
import { ChatbotsFaq } from "./chatbots-faq";
import { ChatbotsShowcase } from "./chatbots-showcase";
import { LocaleSync } from "./locale-sync";
import { PriceText } from "./price-text";
import { getChatbotsPrices, getService, type ServiceLocale } from "./services";
import { SiteHeader } from "./site-chrome";
import { UiArrow } from "./ui-arrow";
import "./chatbots-service.css";

function ScopeList({ items }: { items: readonly string[] }) {
  return <ul className="chatbots-scope-list">{items.map((item) => <li className="service-text-body" key={item}>{item}</li>)}</ul>;
}

export function ChatbotsServicePage({ locale }: { locale: ServiceLocale }) {
  const ui: ChatbotsCopy = chatbotsCopy[locale];
  const service = getService(locale, "chatbots");
  const prices = getChatbotsPrices(locale);
  const otherLocale: ServiceLocale = locale === "ua" ? "en" : "ua";
  const contactHref = "#contact";

  return (
    <div className="service-page chatbots-service-page" lang={locale === "ua" ? "uk" : "en"} data-service="chatbots">
      <LocaleSync locale={locale} />
      <SiteHeader locale={locale} pageKind="service" languageHref={`/${otherLocale}/services/chatbots`} />

      <main className="service-page-main" id="main">
        <section className="service-intro chatbots-intro" id="top" aria-labelledby="service-title" data-scroll-region="hero">
          <div className="service-section-label"><span>{ui.service}</span><span><PriceText value={prices.guided} /></span></div>
          <h1 className="service-text-title" id="service-title">{service.name}</h1>
          <div className="service-intro-copy chatbots-intro-copy">
            <div className="chatbots-intro-text">
              <p className="service-text-lead">{ui.lead}</p>
              <p className="service-text-body">{ui.intro}</p>
            </div>
            <a className="service-primary-cta" href="#hover-example"><span>{ui.seeExample}</span><UiArrow direction="down" /></a>
          </div>
        </section>

        <section className="service-editorial-section chatbots-formats" aria-labelledby="chatbots-formats-title" data-scroll-region="chatbots-formats">
          <span className="service-section-index">{ui.formatsLabel}</span>
          <div className="chatbots-section-content">
            <h2 className="chatbots-section-title content-heading" id="chatbots-formats-title">{ui.formatsTitle}</h2>
            <ol className="chatbots-format-list">
              {ui.formats.map((format, index) => (
                <li className="chatbots-format" key={format.label}>
                  <div className="chatbots-format-meta content-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{format.label}</span></div>
                  <h3 className="service-content-subheading chatbots-format-title">{format.title}</h3>
                  {format.body.map((paragraph) => <p className="service-text-body" key={paragraph}>{paragraph}</p>)}
                  {format.options && <div className="chatbots-connection-options">{format.options.map((option) => <div key={option.title}><h4 className="service-content-subheading">{option.title}</h4><p className="service-text-body">{option.text}</p></div>)}</div>}
                  {format.flow && <p className="chatbots-flow">{format.flow}</p>}
                  {format.note && <p className="service-text-body chatbots-note">{format.note}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="service-editorial-section chatbots-wide-section chatbots-example" id="hover-example" aria-labelledby="chatbots-example-title" data-scroll-region="chatbots-example">
          <div className="chatbots-section-heading">
            <span className="service-section-index">{ui.exampleLabel}</span>
            <div className="chatbots-section-content">
              <h2 className="chatbots-section-title content-heading" id="chatbots-example-title">{ui.exampleTitle}</h2>
              <p className="service-text-body">{ui.exampleBody}</p>
              <p className="chatbots-small-note content-meta">{ui.ownSolution}</p>
            </div>
          </div>

          <ChatbotsShowcase locale={locale} />

          <div className="chatbots-example-details">
            <div>
              <h3 className="service-content-subheading">{ui.replyTitle}</h3>
              <p className="service-text-body">{ui.replyBody}</p>
              <p className="service-text-body chatbots-note">{ui.privacyBody}</p>
            </div>
            <div className="chatbots-live-bot">
              <h3 className="service-content-subheading">{ui.liveBotTitle}</h3>
              <p className="service-text-body">{ui.liveBotBody}</p>
              <a className="chatbots-text-link" href="https://t.me/hoverstudiobot" target="_blank" rel="noopener noreferrer"><span>{ui.liveBotLink}</span><UiArrow /></a>
              <span className="chatbots-bot-handle content-meta">@hoverstudiobot</span>
            </div>
          </div>
        </section>

        <section className="service-editorial-section chatbots-scope" aria-labelledby="chatbots-scope-title" data-scroll-region="chatbots-scope">
          <span className="service-section-index">{ui.scopeLabel}</span>
          <div className="chatbots-section-content">
            <h2 className="chatbots-section-title content-heading" id="chatbots-scope-title">{ui.scopeTitle}</h2>
            <p className="service-text-body chatbots-scope-intro">{ui.scopeIntro}</p>
            <div className="chatbots-scope-columns">
              <div><h3 className="service-content-subheading">{ui.includedTitle}</h3><ScopeList items={ui.included} /></div>
              <div><h3 className="service-content-subheading">{ui.separateTitle}</h3><ScopeList items={ui.separate} /></div>
            </div>
          </div>
        </section>

        <section className="service-editorial-section chatbots-wide-section chatbots-prices" id="chatbots-prices" aria-labelledby="chatbots-prices-title" data-scroll-region="chatbots-prices">
          <div className="chatbots-section-heading">
            <span className="service-section-index">{ui.pricesLabel}</span>
            <h2 className="chatbots-section-title content-heading" id="chatbots-prices-title"><span>{ui.pricesTitle[0]}</span>{" "}<span className="chatbots-prices-title-second">{ui.pricesTitle[1]}</span></h2>
          </div>
          <div className="chatbots-price-comparison">
            {ui.packages.map((format, index) => (
              <article className="chatbots-price-format" key={format.key} aria-labelledby={`chatbots-price-${format.key}`}>
                <div className="chatbots-format-meta content-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{ui.oneOff}</span></div>
                <h3 className="service-content-subheading" id={`chatbots-price-${format.key}`}>{format.title}</h3>
                <p className="chatbots-price"><PriceText value={prices[format.key]} /></p>
                <p className="service-text-body chatbots-price-intro">{format.intro}</p>
                <ScopeList items={format.items} />
                <p className="service-text-body chatbots-price-limit">{format.limit}</p>
                <a className="service-primary-cta" href={contactHref}><span>{ui.discuss}</span><UiArrow /></a>
              </article>
            ))}
          </div>
          <div className="chatbots-commercial-notes">
            <aside className="chatbots-integration-estimate" aria-labelledby="chatbots-integrations-title">
              <div className="chatbots-integration-heading">
                <h3 className="service-content-subheading" id="chatbots-integrations-title">{ui.integrationsTitle}</h3>
                <p>{ui.integrationsPrice}</p>
              </div>
              <p className="service-text-body">{ui.integrationsBody}</p>
              <p className="service-text-body chatbots-budget-note">{ui.budgetNote}</p>
            </aside>
            <section className="chatbots-running-costs" id="chatbots-hosting" aria-labelledby="chatbots-hosting-title">
              <div className="chatbots-hosting-overview">
                <h3 className="service-content-subheading" id="chatbots-hosting-title">{ui.runningTitle}</h3>
                <div>
                  <p className="service-text-body">{ui.runningBody}</p>
                  <p className="service-text-body">{ui.hostingExample}</p>
                </div>
              </div>
              <ol className="chatbots-hosting-options">
                {ui.hostingOptions.map((option, index) => <li key={option.title}>
                  <span className="chatbots-hosting-number content-meta" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div><h4 className="service-content-subheading">{option.title}</h4><p className="service-text-body">{option.text}</p></div>
                </li>)}
              </ol>
              <div className="chatbots-hosting-terms">
                <div><h4>{ui.hostingCostsLabel}</h4><p className="service-text-body">{ui.hostingCosts}</p></div>
                <div><h4>{ui.supportLabel}</h4><p className="service-text-body">{ui.supportBody}</p></div>
                <div><h4>{ui.accessLabel}</h4><p className="service-text-body">{ui.accessBody}</p></div>
              </div>
            </section>
          </div>
        </section>

        <section className="service-editorial-section chatbots-process" aria-labelledby="chatbots-process-title" data-scroll-region="chatbots-process">
          <span className="service-section-index">{ui.processLabel}</span>
          <div className="chatbots-section-content">
            <h2 className="chatbots-section-title content-heading" id="chatbots-process-title">{ui.processTitle}</h2>
            <ol className="chatbots-process-list">
              {ui.steps.map((step, index) => <li key={step.title}><span className="chatbots-process-number content-meta" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3 className="service-content-subheading">{step.title}</h3><p className="service-text-body">{step.text}</p></div></li>)}
            </ol>
            <p className="service-text-body chatbots-note chatbots-timeline">{ui.timeline}</p>
            <section className="chatbots-materials" aria-labelledby="chatbots-materials-title">
              <h3 className="service-content-subheading" id="chatbots-materials-title">{ui.materialsTitle}</h3>
              <ol className="chatbots-materials-list" role="list">
                {ui.materials.map((item, index) => <li key={item}>
                  <span className="chatbots-materials-number content-meta" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <p className="service-text-body">{item}</p>
                </li>)}
              </ol>
              <p className="service-text-body chatbots-note chatbots-materials-note">{ui.materialsNote}</p>
            </section>
          </div>
        </section>

        <section className="service-editorial-section chatbots-faq" aria-labelledby="chatbots-faq-title" data-scroll-region="chatbots-faq">
          <span className="service-section-index">{ui.faqLabel}</span>
          <div className="chatbots-section-content">
            <h2 className="chatbots-section-title content-heading" id="chatbots-faq-title">{ui.faqTitle}</h2>
            <ChatbotsFaq items={ui.faqs} />
          </div>
        </section>

        <section className="service-editorial-section chatbots-final" aria-labelledby="chatbots-final-title" data-scroll-region="chatbots-final">
          <span className="service-section-index">{ui.finalLabel}</span>
          <div className="chatbots-section-content">
            <h2 className="chatbots-section-title content-heading" id="chatbots-final-title">{ui.finalTitle}</h2>
            <p className="service-text-body">{ui.finalBody}</p>
            <a className="service-primary-cta" href={contactHref}><span>{ui.discuss}</span><UiArrow /></a>
          </div>
        </section>
      </main>
    </div>
  );
}
