/* eslint-disable @next/next/no-img-element -- retain the original product artwork without raster transformations. */
import type { ProjectLocale } from "./projects";
import { blueprintCaseCopy } from "./blueprint-case-copy";
import { BlueprintPreview } from "./blueprint-preview";
import { CaseTaskMotion } from "./case-task-motion";

const productUrl = "https://ai-commercial-blueprint.pipistrello-26.chatgpt.site/";
const artworkRoot = "/case/blueprint/";
const palette = ["#0d0d0e", "#f2f0ea", "#315cff", "#747471"] as const;

function EditorialCopy({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="case-editorial-copy">
      {paragraphs.map((paragraph, index) => (
        <p className={index === 0 ? "case-text-lead" : "case-text-body"} key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function ProductImage({
  file,
  alt,
  width = 1638,
  height = 2048,
}: {
  file: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  return <img src={artworkRoot + file} width={width} height={height} alt={alt} loading="lazy" decoding="async" draggable={false} />;
}

function DeviceCapture({ locale, phone = false }: { locale: ProjectLocale; phone?: boolean }) {
  const isUa = locale === "ua";
  return (
    <figure className={`bp-device-sample ${phone ? "bp-device-phone" : "bp-device-tablet"}`}>
      <div className="bp-device-frame">
        <div className="bp-device-viewport">
          <ProductImage
            file={phone ? "responsive-phone-menu.png" : "responsive-tablet-checklist.jpg"}
            width={phone ? 995 : 882}
            height={phone ? 2048 : 1280}
            alt={phone
              ? isUa ? "Мобільна версія AI Commercial Blueprint: відкрите меню навігації" : "AI Commercial Blueprint on mobile: expanded navigation menu"
              : isUa ? "Планшетна версія AI Commercial Blueprint: обкладинка Production Checklist і форма отримання" : "AI Commercial Blueprint on tablet: Production Checklist cover and request form"}
          />
        </div>
      </div>
      <figcaption className="content-meta">{phone
        ? isUa ? "02 / МОБІЛЬНА НАВІГАЦІЯ" : "02 / MOBILE NAVIGATION"
        : isUa ? "01 / ПЛАНШЕТ · PRODUCTION CHECKLIST" : "01 / TABLET · PRODUCTION CHECKLIST"}</figcaption>
    </figure>
  );
}

function EditionComparison({ locale }: { locale: ProjectLocale }) {
  const isUa = locale === "ua";
  const editions = [
    {
      key: "book",
      number: "01",
      title: ["BOOK"],
      label: "ЦИФРОВА КНИГА",
      description: "Повна книга та вся production-методологія Blueprint.",
      includes: ["Commercial Pipeline / система виробництва", "Brief / Idea / Visual Direction", "Storyboard і Production Board", "Keyframes / Motion / Edit / Sound"],
    },
    {
      key: "production",
      number: "02",
      title: ["PRODUCTION", "EDITION"],
      label: "BOOK + TOOLKIT",
      description: "Усе, що входить до Book: повна книга та вся production-методологія. Додатково — редаговані templates, frameworks, checklists і робочі файли для практичного застосування системи.",
      includes: ["Creative Brief / Visual Direction Templates", "Storyboard Template / Production Board", "Character Card / Editable Prompt Frameworks", "Product Fidelity / Final QC Checklists"],
    },
  ];

  return (
    <figure className="bp-editions-visual">
      <div className="bp-editions-board" lang="uk">
        <div className="bp-editions-heading"><span className="bp-ui-meta">AI COMMERCIAL BLUEPRINT / EDITIONS</span><p>Оберіть формат роботи</p></div>
        <div className="bp-editions-grid">
          {editions.map((edition) => (
            <section className={`bp-edition bp-edition-${edition.key}`} key={edition.key} aria-label={edition.title.join(" ")}>
              <div className="bp-edition-topline"><span>ВИДАННЯ / {edition.number}</span><span>{edition.label}</span></div>
              <div className="bp-edition-heading"><span className="bp-ui-meta">AI COMMERCIAL BLUEPRINT</span><h3>{edition.title.map(line => <span key={line}>{line}</span>)}</h3></div>
              <p className="bp-edition-description">{edition.description}</p>
              <div className="bp-edition-art">
                <div className="bp-edition-cover">
                  <ProductImage file="ai-commercial-blueprint-cover-master.png" alt={isUa ? "Оригінальна обкладинка AI Commercial Blueprint" : "Original AI Commercial Blueprint cover"} />
                  {edition.key === "production" ? <div className="bp-edition-mark"><strong>PRODUCTION<br />EDITION</strong><span>BOOK + TOOLKIT</span></div> : null}
                </div>
              </div>
              <ul className="bp-edition-includes">{edition.includes.map(item => <li key={item}>{item}</li>)}</ul>
            </section>
          ))}
        </div>
        <a className="bp-editions-link" href={`${productUrl}#editions`} target="_blank" rel="noopener noreferrer">{isUa ? "ПОРІВНЯТИ ВИДАННЯ НА САЙТІ" : "COMPARE EDITIONS ON THE WEBSITE"} <span aria-hidden="true">↗</span></a>
      </div>
      <figcaption className="content-meta">{isUa ? "КОМПОНЕНТ ЛЕНДИНГУ / ПОРІВНЯННЯ BOOK І PRODUCTION EDITION" : "LANDING PAGE COMPONENT / BOOK AND PRODUCTION EDITION COMPARISON"}</figcaption>
    </figure>
  );
}

export function BlueprintCaseSection({ index, locale }: { index: number; locale: ProjectLocale }) {
  const content = blueprintCaseCopy[locale];
  const isUa = locale === "ua";

  if (index === 0) {
    return (
      <div className="case-content case-context">
        <EditorialCopy paragraphs={content.context} />
        <figure className="bp-product-visual">
          <div className="bp-product-stage">
            <div className="bp-product-topline"><span>AI COMMERCIAL BLUEPRINT</span><span>MANUAL / 2026</span></div>
            <ProductImage file="ai-commercial-blueprint-hero-stack.webp" width={2048} height={1365} alt={isUa ? "Оригінальна продуктова композиція Blueprint: обкладинка та сторінки про pipeline, ключові кадри й точність продукту" : "Original Blueprint product composition: the cover and pages on the pipeline, keyframes and product fidelity"} />
            <div className="bp-product-baseline"><span>BOOK / SYSTEM / PRACTICE</span><span>by YevAI.dev</span></div>
          </div>
          <figcaption className="content-meta">{isUa ? "КОМПОЗИЦІЯ ПРОДУКТУ / ОБКЛАДИНКА ТА СТОРІНКИ ВИДАННЯ" : "PRODUCT COMPOSITION / THE COVER AND SAMPLE PAGES"}</figcaption>
        </figure>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="case-content case-challenge">
        <p className="case-text-lead">{content.challenge}</p>
        <p className="case-text-body bp-challenge-description">{content.challengeDescription}</p>
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
        <ol className="bp-journey" aria-label={isUa ? "Послідовність знайомства з продуктом" : "The product discovery journey"}>
          {content.journey.map((step, stepIndex) => <li key={step}><span className="content-meta" aria-hidden="true">{String(stepIndex + 1).padStart(2, "0")}</span><p className="content-subheading">{step}</p></li>)}
        </ol>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="case-content case-art-direction">
        <EditorialCopy paragraphs={content.art} />
        <figure className="bp-art-visual">
          <div className="bp-art-sheets">
            <div className="bp-art-sheet"><ProductImage file="ai-commercial-blueprint-cover-master.png" alt={isUa ? "Оригінальна обкладинка AI Commercial Blueprint" : "Original AI Commercial Blueprint cover"} /></div>
            <div className="bp-art-sheet"><ProductImage file="tissot-product-fidelity-preview-1200.webp" width={1200} height={1500} alt={isUa ? "Сторінка Blueprint з розбором точності продукту TISSOT" : "Blueprint sample page analysing TISSOT product fidelity"} /></div>
          </div>
          <figcaption className="content-meta">{content.labels.artCaption}</figcaption>
        </figure>
      </div>
    );
  }

  if (index === 4) {
    return (
      <div className="case-content case-design-system">
        <p className="case-text-lead">{content.system}</p>
        <div className="bp-system-board">
          <div className="bp-type-display"><span className="bp-ui-meta">IBM PLEX SANS CONDENSED / 700</span><p>AI COMMERCIAL<br />BLUEPRINT</p></div>
          <div className="bp-support-type">
            <div><span className="bp-ui-meta">SOURCE SERIF 4 / 400</span><p className="bp-serif-specimen">From brief<br />to delivery.</p></div>
            <div><span className="bp-ui-meta">IBM PLEX SANS / 400</span><p className="bp-sans-specimen">Commercial AI<br />production system.</p></div>
          </div>
          <div className="bp-palette" aria-label={isUa ? "Палітра Blueprint" : "Blueprint color palette"}>{palette.map(color => <div className="bp-swatch" key={color}><span style={{ backgroundColor: color }} aria-hidden="true" /><span className="bp-ui-meta">{color.toUpperCase()}</span></div>)}</div>
          <div className="bp-system-parts">{content.systemParts.map(([title, description]) => <div key={title}><h3 className="content-subheading">{title}</h3><p className="case-text-body">{description}</p></div>)}</div>
        </div>
      </div>
    );
  }

  if (index === 5) {
    return <div className="case-content case-interaction"><EditorialCopy paragraphs={content.motion} /><BlueprintPreview locale={locale} /></div>;
  }

  if (index === 6) {
    return (
      <div className="case-content case-responsive">
        <EditorialCopy paragraphs={content.responsive} />
        <div className="bp-responsive-pair"><DeviceCapture locale={locale} /><DeviceCapture locale={locale} phone /></div>
        <p className="bp-responsive-caption content-meta">{content.labels.responsiveCaption}</p>
      </div>
    );
  }

  if (index === 7) {
    return (
      <div className="case-content case-selected-screens">
        <EditorialCopy paragraphs={content.screens} />
        <div className="bp-gallery-heading"><h3 className="content-subheading">{content.labels.galleryTitle}</h3><p className="case-text-body">{content.labels.galleryIntro}</p></div>
        <EditionComparison locale={locale} />
      </div>
    );
  }

  if (index === 8) {
    return (
      <div className="case-content case-result">
        <EditorialCopy paragraphs={content.result} />
        <div className="bp-result-facts">{content.resultFacts.map(([value, label], factIndex) => <div key={label}><span className="content-meta" aria-hidden="true">{String(factIndex + 1).padStart(2, "0")}</span><strong>{value}</strong><p className="content-meta">{label}</p></div>)}</div>
      </div>
    );
  }

  return null;
}
