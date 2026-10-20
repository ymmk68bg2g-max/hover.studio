import { FeaturedSolarcity } from "./featured-solarcity";
import type { ProjectLocale } from "./projects";
import { solarCityCaseCopy } from "./solarcity-case-copy";
import { SolarCityMotionShowcase } from "./solarcity-motion";
import { SolarCityContext } from "./solarcity-context";
import { SolarCityScreenGallery } from "./solarcity-screen-gallery";
import { SolarCityHeroShowcase } from "./solarcity-hero-showcase";
import { CaseTaskMotion } from "./case-task-motion";

const palette = ["#061120", "#102740", "#f3f6f8", "#35d6e4"] as const;

function EditorialCopy({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="case-editorial-copy">
      {paragraphs.map((paragraph, index) => (
        <p className={index === 0 ? "case-text-lead" : "case-text-body"} key={paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function SolarCityCaseSection({ index, locale }: { index: number; locale: ProjectLocale }) {
  const content = solarCityCaseCopy[locale];
  const labels = content.labels;
  const isUa = locale === "ua";

  if (index === 0) {
    return (
      <div className="case-content case-context">
        <EditorialCopy paragraphs={content.context} />
        <SolarCityContext
          locale={locale}
          alt={labels.contextImage}
          caption={labels.contextCaption}
          note={labels.conceptCaption}
        />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="case-content case-challenge">
        <p className="case-text-lead">{content.challenge}</p>
        <p className="case-text-body sc-challenge-description">{content.challengeDescription}</p>
        <CaseTaskMotion>
          {content.tasks.map(([title, description], taskIndex) => (
            <div className="case-task-row" key={title}>
              <span>{String(taskIndex + 1).padStart(2, "0")}</span>
              <h3 className="content-subheading">{title}</h3>
              <p className="case-text-body">{description}</p>
            </div>
          ))}
        </CaseTaskMotion>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="case-content case-structure">
        <EditorialCopy paragraphs={content.structure} />
        <ol className="sc-journey" aria-label={isUa ? "Послідовність головної сторінки SolarCity" : "SolarCity homepage sequence"}>
          {content.journey.map((step, stepIndex) => (
            <li key={step}>
              <span className="sc-journey-index content-meta" aria-hidden="true">{String(stepIndex + 1).padStart(2, "0")}</span>
              <p className="content-subheading">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="case-content case-art-direction">
        <EditorialCopy paragraphs={content.art} />
        <SolarCityHeroShowcase
          locale={locale}
          caption={labels.artCaption}
          note={labels.conceptCaption}
        />
      </div>
    );
  }

  if (index === 4) {
    return (
      <div className="case-content case-design-system">
        <p className="case-text-lead">{content.system}</p>
        <div className="sc-system-board">
          <p className="sc-type-specimen" aria-label={isUa ? "Типографіка SolarCity — Arial" : "SolarCity typography — Arial"}>
            <span>SOLARCITY</span>
            <span>Aa / 0123456789</span>
          </p>
          <div className="sc-palette" aria-label={isUa ? "Колірна система SolarCity" : "SolarCity color system"}>
            {palette.map((color) => (
              <div className="sc-swatch" key={color}>
                <span className="sc-swatch-color" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="content-meta">{color.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="sc-system-parts">
            {content.systemParts.map(([title, description]) => (
              <div key={title}>
                <h3 className="content-subheading">{title}</h3>
                <p className="case-text-body">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (index === 5) {
    return (
      <div className="case-content case-interaction">
        <EditorialCopy paragraphs={content.motion} />
        <SolarCityMotionShowcase locale={locale} />
      </div>
    );
  }

  if (index === 6) {
    return (
      <div className="case-content case-responsive">
        <EditorialCopy paragraphs={content.responsive} />
        <div className="sc-responsive-showcase">
          <FeaturedSolarcity locale={locale} reveal={false} variant="responsive" />
          <p className="sc-visuals-caption content-meta">{labels.visualsCaption}</p>
        </div>
      </div>
    );
  }

  if (index === 7) {
    return (
      <div className="case-content case-selected-screens">
        <EditorialCopy paragraphs={content.screens} />
        <div className="sc-gallery-heading">
          <h3 className="content-subheading">{labels.galleryTitle}</h3>
          <p className="case-text-body">{labels.galleryIntro}</p>
        </div>
        <SolarCityScreenGallery locale={locale} />
      </div>
    );
  }

  if (index === 8) {
    return (
      <div className="case-content case-result">
        <EditorialCopy paragraphs={content.result} />
        <div className="sc-result-facts">
          {content.resultFacts.map(([value, label], factIndex) => (
            <div key={label}>
              <span className="content-meta" aria-hidden="true">{String(factIndex + 1).padStart(2, "0")}</span>
              <strong>{value}</strong>
              <p className="content-meta">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
