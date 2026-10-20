import Image from "next/image";
import Link from "next/link";
import { LocaleSync } from "./locale-sync";
import { getNextProject, getProject, type ProjectLocale, type ProjectSlug } from "./projects";
import { SiteHeader } from "./site-chrome";
import { YevaiButtonState } from "./yevai-button-state";
import { SolarFamilyCaseSection } from "./solarfamily-case";
import { SolarCityCaseSection } from "./solarcity-case";
import { CaseTaskMotion } from "./case-task-motion";
import { BlueprintCaseSection } from "./blueprint-case";

const labels = {
  en: {
    kicker: "HOVER / WORK",
    live: "OPEN WEBSITE",
    client: "CLIENT",
    industry: "INDUSTRY",
    siteType: "WEBSITE TYPE",
    services: "SERVICES",
    languages: "WEBSITE LANGUAGES",
    year: "YEAR",
    status: "CASE MATERIAL / EDITABLE PLACEHOLDER",
    placeholder: "APPROVED PROJECT ASSETS / TO BE ADDED",
    sections: ["CONTEXT", "CHALLENGE", "STRUCTURE", "ART DIRECTION", "DESIGN SYSTEM", "INTERACTION", "RESPONSIVE", "SELECTED SCREENS", "RESULT"],
    pending: "Detailed case material will be added after the project is approved for publication.",
    next: "NEXT PROJECT",
    cta: "HAVE A PROJECT IN MIND?",
    start: "START A PROJECT",
  },
  ua: {
    kicker: "РЕАЛІЗОВАНИЙ ПРОЄКТ",
    live: "ВІДКРИТИ САЙТ",
    client: "КЛІЄНТ",
    industry: "СФЕРА",
    siteType: "ТИП САЙТУ",
    services: "ПОСЛУГИ",
    languages: "МОВИ САЙТУ",
    year: "РІК",
    status: "МАТЕРІАЛИ КЕЙСУ / РЕДАГОВАНИЙ PLACEHOLDER",
    placeholder: "ЗАТВЕРДЖЕНІ МАТЕРІАЛИ / БУДУТЬ ДОДАНІ",
    sections: ["КОНТЕКСТ", "ЗАВДАННЯ", "СТРУКТУРА", "АРТДИРЕКШН", "ДИЗАЙН-СИСТЕМА", "ВЗАЄМОДІЯ", "АДАПТИВ", "ОБРАНІ ЕКРАНИ", "РЕЗУЛЬТАТ"],
    pending: "Детальні матеріали кейсу будуть додані після затвердження проєкту для публікації.",
    next: "НАСТУПНИЙ ПРОЄКТ",
    cta: "МАЄТЕ ПРОЄКТ НА ДУМЦІ?",
    start: "ПОЧАТИ ПРОЄКТ",
  },
} as const;

const yevaiContent = {
  en: {
    context: [
      "YevAI.dev was created from the ground up as a standalone digital platform for an AI-focused creative practice.",
      "The website needed to establish a clear online presence and show that the practice is built around structured commercial work with brands, not a series of isolated AI experiments.",
      "The main task was to bring the portfolio into one place, explain the services and their starting prices clearly, and create a straightforward path from discovering the work to discussing a new project.",
    ],
    statementLead: "Turn an independent creative practice into a clear ",
    statementAccent: "digital presence with a clear commercial structure.",
    challengeDescription: "The platform needed to retain a distinctive creative voice while making the offer clear to businesses. The portfolio, services and contact had to form a coherent path from a first impression to a new project.",
    tasks: [
      ["POSITIONING", "Explain what YevAI.dev is and how AI is used within professional creative production."],
      ["PORTFOLIO", "Give the work enough space and present completed projects and case studies rather than isolated fragments."],
      ["SERVICES", "Organise the offer into clear formats and show starting prices openly."],
      ["ENQUIRY", "Create a simple path from viewing the work and services to discussing a new project."],
    ],
    structure: [
      "The structure is organised around three main scenarios: assess the work, understand the collaboration format, and move into a project discussion.",
      "The homepage provides a concise introduction to YevAI.dev, while dedicated service pages give visitors the detail they need when considering a specific form of collaboration.",
    ],
    artDirection: {
      statement: "The interface does not compete with the videos and images; it helps keep attention on the work.",
      supporting: [
        "A dark background, contrasting typography and restrained controls bring different projects together as one coherent portfolio.",
        "The visual approach emphasises the quality of the presentation and clarity of the commercial offer rather than the technology used to create the content.",
      ],
      principles: ["CONTENT FIRST", "HIGH CONTRAST", "EDITORIAL STRUCTURE", "CINEMATIC VISUALS", "RESTRAINED UI"],
    },
    designSystem: "The interface system is neutral enough to support visually different projects while remaining distinctive enough to make YevAI.dev feel like one coherent platform.",
    interaction: {
      statement: "Responses on buttons, links and service rows make interactive elements easy to recognise.",
      supporting: "This section shows real interface states from YevAI.dev.",
    },
    responsive: {
      statement: "On mobile screens, navigation, content placement and spacing are adapted for vertical browsing.",
      supporting: "The work, services and path to contact remain the focus of the page.",
    },
    result: {
      statement: "YevAI.dev was launched as a bilingual website that brings together a portfolio, service pages, starting prices and a way to enquire about a new project.",
      supporting: [
        "The site was created from the ground up, from positioning and structure to design, development and content.",
        "The result is a live, working website.",
      ],
      facts: [["UA + EN", "BILINGUAL WEBSITE"], ["3", "CORE SERVICE DIRECTIONS"], ["PORTFOLIO", "PROJECT-LED PRESENTATION"], ["LIVE", "PUBLISHED WEBSITE"]],
      live: "VISIT YEVAI.DEV",
    },
  },
  ua: {
    context: [
      "YevAI.dev створено з нуля як окрему цифрову платформу для розвитку напряму креативного виробництва з використанням ШІ.",
      "Сайт мав сформувати повноцінну присутність в інтернеті та показати, що це не набір окремих експериментів із ШІ, а системна комерційна робота з брендами.",
      "Основним завданням було зібрати портфоліо в одному середовищі, чітко пояснити послуги та стартові ціни й створити зрозумілий шлях від першого знайомства з роботами до обговорення нового проєкту.",
    ],
    statementLead: "Перетворити окремий творчий напрям на зрозумілу ",
    statementAccent: "цифрову присутність із чіткою комерційною логікою.",
    challengeDescription: "Потрібно було зберегти авторський характер платформи та зробити пропозицію зрозумілою для бізнесу. Портфоліо, послуги й контакт мали працювати як послідовний шлях від першого враження до нового проєкту.",
    tasks: [
      ["ПОЗИЦІОНУВАННЯ", "Пояснити, чим є YevAI.dev і яку роль ШІ відіграє у професійному креативному виробництві."],
      ["ПОРТФОЛІО", "Дати роботам достатньо простору й показати завершені проєкти та кейси, а не окремі фрагменти робіт."],
      ["ПОСЛУГИ", "Розділити пропозицію на зрозумілі формати та відкрито показати стартові ціни."],
      ["ЗВЕРНЕННЯ", "Побудувати простий шлях від перегляду робіт і послуг до обговорення нового проєкту."],
    ],
    structure: [
      "Структура побудована навколо трьох головних сценаріїв: оцінити рівень робіт, зрозуміти формат співпраці та перейти до обговорення проєкту.",
      "Головна сторінка стисло представляє YevAI.dev, а окремі сторінки послуг дають потрібні деталі користувачеві, який уже розглядає конкретний формат співпраці.",
    ],
    artDirection: {
      statement: "Інтерфейс не конкурує з відео та зображеннями, а допомагає зосередитися на роботах.",
      supporting: [
        "Темне тло, контрастна типографіка та стримані елементи керування об’єднують різні проєкти в цілісне портфоліо.",
        "Візуальний підхід підкреслює не технологію створення контенту, а якість подачі робіт і зрозумілість комерційної пропозиції.",
      ],
      principles: ["КОНТЕНТ ПЕРЕДУСІМ", "ВИСОКИЙ КОНТРАСТ", "РЕДАКЦІЙНА СТРУКТУРА", "КІНЕМАТОГРАФІЧНА ПОДАЧА", "СТРИМАНИЙ ІНТЕРФЕЙС"],
    },
    designSystem: "Система інтерфейсу достатньо нейтральна, щоб підтримувати візуально різні проєкти, і водночас достатньо виразна, щоб YevAI.dev сприймався як цілісна платформа.",
    interaction: {
      statement: "Реакції кнопок, посилань і рядків послуг допомагають розпізнавати інтерактивні елементи.",
      supporting: "У цьому розділі показано реальні стани інтерфейсу YevAI.dev.",
    },
    responsive: {
      statement: "На мобільних екранах навігація, розташування контенту та відступи пристосовані до вертикального перегляду.",
      supporting: "Роботи, послуги й перехід до контакту залишаються основою сторінки.",
    },
    result: {
      statement: "YevAI.dev запущено як двомовний сайт, що об’єднує портфоліо, сторінки послуг, стартові ціни та можливість звернутися щодо нового проєкту.",
      supporting: [
        "Сайт створено з нуля: від позиціонування та структури до дизайну, розробки й наповнення.",
        "Результатом є працюючий сайт.",
      ],
      facts: [["UA + EN", "ДВОМОВНИЙ САЙТ"], ["3", "ОСНОВНІ НАПРЯМИ ПОСЛУГ"], ["ПОРТФОЛІО", "ПОДАЧА ЧЕРЕЗ ПРОЄКТИ"], ["LIVE", "ОПУБЛІКОВАНИЙ САЙТ"]],
      live: "ВІДКРИТИ YEVAI.DEV",
    },
  },
} as const;

const homeMap = [
  { label: "HERO" },
  { label: "SELECTED WORK", children: ["PALAMARENKO CLINIC", "ВЕЗЕБУС", "MIRA"] },
  { label: "SERVICES", children: ["AI COMMERCIAL", "VISUAL CAMPAIGN", "CREATIVE DIRECTION"] },
  { label: "ABOUT" },
  { label: "NEW PROJECT" },
] as const;

const serviceMap = ["INTRO", "APPROACH", "WHAT'S INCLUDED", "PROCESS", "WHEN IT FITS", "PRICING", "CONTACT CTA"] as const;

const yevaiLabels = {
  en: {
    sitemap: "YevAI.dev website structure",
    contextAlt: "YevAI.dev homepage — AI creative studio",
    heroAlt: "YevAI.dev homepage hero",
    aboutAlt: "YevAI.dev about section",
    miraAlt: "Mira project presentation on YevAI.dev",
    servicesRestAlt: "YevAI.dev services in their rest state",
    servicesHoverAlt: "The first YevAI.dev service row on hover",
    desktopAlt: "YevAI.dev selected work on desktop",
    mobileAlt: "YevAI.dev mobile homepage",
    mobileMenuAlt: "YevAI.dev fullscreen mobile navigation",
    vezebusAlt: "Vezebus project presentation on YevAI.dev",
    serviceAlt: "YevAI.dev AI Commercial service page with the complete Lacoste storyboard",
    contactAlt: "YevAI.dev new project enquiry section",
    serviceResponse: "01 / SERVICE ROW RESPONSE",
    serviceTiming: "ROW / 250MS · ARROW / 300MS",
    buttonResponse: "02 / BUTTON RESPONSE",
    buttonTiming: "COLOR + MOVE / 420MS · FILL / 600MS",
    rest: "REST",
    hover: "HOVER",
    recreated: "RECREATED COMPONENT",
    pageEdge: "PAGE EDGE",
    gutter: "GUTTER",
    gridCaption: "Schematic overview of layout and spacing.",
    screens: ["01 / PROJECT PRESENTATION", "02 / SERVICE DETAIL", "03 / ABOUT"],
    resultVisual: "LIVE WEBSITE",
  },
  ua: {
    sitemap: "Структура сайту YevAI.dev",
    contextAlt: "Головна сторінка YevAI.dev — ШІ-креативна студія",
    heroAlt: "Головний екран YevAI.dev",
    aboutAlt: "Розділ про автора на YevAI.dev",
    miraAlt: "Презентація проєкту MIRA на YevAI.dev",
    servicesRestAlt: "Список послуг YevAI.dev у звичайному стані",
    servicesHoverAlt: "Перший рядок послуг YevAI.dev під час наведення",
    desktopAlt: "Розділ обраних робіт YevAI.dev на комп’ютері",
    mobileAlt: "Головна сторінка YevAI.dev на мобільному екрані",
    mobileMenuAlt: "Повноекранне мобільне меню YevAI.dev",
    vezebusAlt: "Презентація проєкту ВезеБус на YevAI.dev",
    serviceAlt: "Сторінка послуги AI Commercial на YevAI.dev із повною серією кадрів Lacoste",
    contactAlt: "Розділ звернення щодо нового проєкту на YevAI.dev",
    serviceResponse: "01 / РЕАКЦІЯ РЯДКА ПОСЛУГИ",
    serviceTiming: "РЯДОК / 250МС · СТРІЛКА / 300МС",
    buttonResponse: "02 / РЕАКЦІЯ КНОПКИ",
    buttonTiming: "КОЛІР + РУХ / 420МС · ЗАПОВНЕННЯ / 600МС",
    rest: "ЗВИЧАЙНИЙ СТАН",
    hover: "ПРИ НАВЕДЕННІ",
    recreated: "ВІДТВОРЕНИЙ КОМПОНЕНТ",
    pageEdge: "ЗОВНІШНЄ ПОЛЕ",
    gutter: "ПРОМІЖОК",
    gridCaption: "Схематичне представлення компонування та відступів.",
    screens: ["01 / ПРЕЗЕНТАЦІЯ ПРОЄКТУ", "02 / СТОРІНКА ПОСЛУГИ", "03 / ПРО АВТОРА"],
    resultVisual: "ОПУБЛІКОВАНИЙ САЙТ",
  },
} as const;

function YevaiScreen({
  src,
  alt,
  className = "",
  width = 1348,
  height = 926,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className={`yevai-screen ${className}`.trim()}>
      <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 760px) 100vw, 72vw" unoptimized />
    </figure>
  );
}

function LiveSiteArrow() {
  return (
    <span className="ui-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" focusable="false"><path d="M3.25 12.75 12.75 3.25M6 3.25h6.75V10" /></svg>
    </span>
  );
}

function YevaiCaseSection({ index, locale }: { index: number; locale: ProjectLocale }) {
  const content = yevaiContent[locale];
  const ui = yevaiLabels[locale];

  if (index === 0) {
    return (
      <div className="case-content case-context">
        <div className="case-editorial-copy">
          {content.context.map((paragraph, paragraphIndex) => (
            <p className={paragraphIndex === 0 ? "case-text-lead" : "case-text-body"} key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <YevaiScreen
          src="/case/yevai/hero-clean.webp"
          alt={ui.contextAlt}
          className="case-context-visual"
          width={1300}
          height={926}
        />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="case-content case-challenge">
        <h2 className="case-text-lead">{content.statementLead}<span>{content.statementAccent}</span></h2>
        <p className="case-text-body yevai-challenge-description">{content.challengeDescription}</p>
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
        <div className="case-editorial-copy">
          {content.structure.map((paragraph, paragraphIndex) => (
            <p className={paragraphIndex === 0 ? "case-text-lead" : "case-text-body"} key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="case-sitemap" aria-label={ui.sitemap}>
          <div className="case-sitemap-root"><span>YEVAI.DEV</span></div>
          <div className="case-sitemap-branches">
            <div className="case-sitemap-branch">
              <h3>HOME</h3>
              <ul>
                {homeMap.map((node) => (
                  <li key={node.label} className={"children" in node ? "has-children" : ""}>
                    <span className="case-sitemap-node">{node.label}</span>
                    {"children" in node && (
                      <ul>{node.children.map((child) => <li key={child}><span className="case-sitemap-node">{child}</span></li>)}</ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="case-sitemap-branch">
              <h3>SERVICE PAGE</h3>
              <ul>{serviceMap.map((node) => <li key={node}><span className="case-sitemap-node">{node}</span></li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="case-content case-art-direction">
        <div className="case-section-intro">
          <h2 className="case-text-lead">{content.artDirection.statement}</h2>
          <div>{content.artDirection.supporting.map((paragraph) => <p className="case-text-body" key={paragraph}>{paragraph}</p>)}</div>
        </div>
        <div className="yevai-art-composition">
          <YevaiScreen src="/case/yevai/mira-clean.webp" alt={ui.miraAlt} className="yevai-art-main" width={1300} height={926} />
          <YevaiScreen src="/case/yevai/hero-detail-clean.webp" alt={ui.heroAlt} className="yevai-art-secondary" width={820} height={650} />
          <ul>{content.artDirection.principles.map((principle, principleIndex) => <li key={principle}><span>{String(principleIndex + 1).padStart(2, "0")}</span>{principle}</li>)}</ul>
        </div>
      </div>
    );
  }

  if (index === 4) {
    return (
      <div className="case-content case-design-system">
        <p className="case-system-intro case-text-lead">{content.designSystem}</p>
        <div className="yevai-system-board">
          <section className="yevai-system-type">
            <span>01 / TYPE</span>
            <div className="yevai-type-display">Aa</div>
            <div className="yevai-type-levels">
              <p><strong>DISPLAY</strong><span>800 / −6.5% / .92</span></p>
              <p><strong>BODY</strong><span>400 / 1.65–1.85</span></p>
              <p><strong>UTILITY</strong><span>600–700 / TRACKED</span></p>
            </div>
          </section>
          <section className="yevai-system-color">
            <span>02 / COLOR</span>
            <div className="yevai-swatches">
              <div style={{ background: "#0E1218", color: "#F1E2D0" }}><b>INK</b><small>#0E1218</small></div>
              <div style={{ background: "#F1E2D0", color: "#0E1218" }}><b>CREAM</b><small>#F1E2D0</small></div>
              <div style={{ background: "#B98263", color: "#0E1218" }}><b>COPPER</b><small>#B98263</small></div>
              <div style={{ background: "#121820", color: "#F1E2D0" }}><b>PANEL</b><small>#121820</small></div>
            </div>
          </section>
          <section className="yevai-system-ui">
            <span>03 / UI</span>
            <div className="yevai-ui-samples" aria-hidden="true">
              <div className="yevai-ui-nav">{locale === "ua" ? "КЕЙСИ   ПОСЛУГИ   ПРО МЕНЕ" : "CASES   SERVICES   ABOUT"}</div>
              <div className="yevai-ui-button">{locale === "ua" ? "ОБГОВОРИТИ ПРОЄКТ" : "DISCUSS A PROJECT"} <b>↗</b></div>
              <div className="yevai-ui-link">{locale === "ua" ? "ПЕРЕГЛЯНУТИ КЕЙС" : "VIEW CASE"} <b>↘</b></div>
            </div>
          </section>
          <section className="yevai-system-grid">
            <span>04 / GRID / SPACING</span>
            <div className="yevai-grid-diagram" aria-hidden="true">
              <div className="yevai-grid-spec">
                <span>FLUID PAGE EDGE</span>
                <span>COMPONENT GRIDS</span>
                <span>RESPONSIVE GUTTER</span>
              </div>
              <div className="yevai-layout-rows">
                <div className="yevai-layout-header">
                  <span>HEADER</span>
                  <i /><i /><i />
                  <span className="yevai-spacing-mark yevai-page-edge-mark">{ui.pageEdge}</span>
                  <span className="yevai-spacing-mark yevai-gutter-mark">{ui.gutter}</span>
                </div>
                <div><span>CONTENT</span><i /><i /></div>
                <div><span>MEDIA</span><i /></div>
              </div>
              <div className="yevai-grid-token"><span>PAGE EDGE</span><strong>clamp(22px, 5vw, 76px)</strong></div>
            </div>
            <p className="yevai-grid-caption">{ui.gridCaption}</p>
          </section>
        </div>
      </div>
    );
  }

  if (index === 5) {
    return (
      <div className="case-content case-interaction">
        <div className="case-section-intro compact">
          <h2 className="case-text-lead">{content.interaction.statement}</h2>
          <div><p className="case-text-body">{content.interaction.supporting}</p></div>
        </div>
        <div className="yevai-interaction-example">
          <header><span>{ui.serviceResponse}</span><span>{ui.serviceTiming}</span></header>
          <div className="yevai-state-pair service-pair">
            <div><YevaiScreen src="/case/yevai/services-rest.webp" alt={ui.servicesRestAlt} width={1300} height={926} /><span>{ui.rest}</span></div>
            <div><YevaiScreen src="/case/yevai/services-hover-final.webp" alt={ui.servicesHoverAlt} width={1300} height={926} /><span>{ui.hover}</span></div>
          </div>
        </div>
        <div className="yevai-interaction-example">
          <header><span>{ui.buttonResponse}<small>{ui.recreated}</small></span><span>{ui.buttonTiming}</span></header>
          <div className="yevai-state-pair button-pair">
            <div><YevaiButtonState locale={locale} /><span>{ui.rest}</span></div>
            <div><YevaiButtonState locale={locale} hovered /><span>{ui.hover}</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 6) {
    return (
      <div className="case-content case-responsive">
        <div className="case-section-intro compact">
          <h2 className="case-text-lead">{content.responsive.statement}</h2>
          <div><p className="case-text-body">{content.responsive.supporting}</p></div>
        </div>
        <div className="yevai-responsive-stage">
          <div><span>DESKTOP / PRODUCTION</span><YevaiScreen src="/case/yevai/selected-work-clean.webp" alt={ui.desktopAlt} width={1300} height={926} /></div>
          <div className="yevai-mobile-captures">
            <div>
              <span>MOBILE / HOMEPAGE</span>
              <YevaiScreen src="/case/yevai/mobile-home-clean.webp" alt={ui.mobileAlt} width={944} height={1650} />
            </div>
            <div>
              <span>MOBILE / NAVIGATION</span>
              <YevaiScreen src="/case/yevai/mobile-menu-clean.webp" alt={ui.mobileMenuAlt} width={944} height={1650} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 7) {
    return (
      <div className="case-content case-selected-screens">
        <div className="yevai-screen-gallery">
          <div className="wide"><span>{ui.screens[0]}</span><YevaiScreen src="/case/yevai/selected-vezebus.png" alt={ui.vezebusAlt} width={2048} height={1131} /></div>
          <div className="wide"><span>{ui.screens[1]}</span><YevaiScreen src="/case/yevai/selected-service.png" alt={ui.serviceAlt} width={2048} height={1135} /></div>
          <div className="wide"><span>{ui.screens[2]}</span><YevaiScreen src="/case/yevai/selected-about.png" alt={ui.aboutAlt} width={2048} height={1135} /></div>
        </div>
      </div>
    );
  }

  if (index === 8) {
    return (
      <div className="case-content case-result">
        <div className="case-section-intro result">
          <h2 className="case-text-lead">{content.result.statement}</h2>
          <div>{content.result.supporting.map((paragraph) => <p className="case-text-body" key={paragraph}>{paragraph}</p>)}</div>
        </div>
        <div className="yevai-result-facts">
          {content.result.facts.map(([value, label], factIndex) => <div key={label}><span>{String(factIndex + 1).padStart(2, "0")}</span><strong>{value}</strong><p>{label}</p></div>)}
        </div>
      </div>
    );
  }

  return null;
}

export function CaseStudy({ locale, slug }: { locale: ProjectLocale; slug: ProjectSlug }) {
  const project = getProject(locale, slug);
  const nextSlug = getNextProject(slug);
  const next = getProject(locale, nextSlug);
  const t = labels[locale];
  const otherLocale = locale === "en" ? "ua" : "en";
  const languageHref = `/${otherLocale}/work/${slug}`;
  const isYevai = slug === "yevai";
  const isSolarFamily = slug === "solarfamily";
  const isSolarCity = slug === "solarcity";
  const isBlueprint = slug === "ai-commercial-blueprint";
  const caseSections = isSolarCity
    ? [...t.sections.slice(0, 5), "MOTION / INTERACTION", ...t.sections.slice(6)]
    : t.sections;
  const liveHref = project.live;
  const facts = [
    [t.client, project.client],
    [t.industry, project.industry],
    [t.siteType, project.siteType],
    [t.services, project.services],
    [t.languages, project.languages],
    [t.year, project.year],
  ] as const;

  return (
    <div className={`case-page${isYevai ? " case-page-yevai" : ""}${isSolarFamily ? " case-page-solarfamily" : ""}${isSolarCity ? " case-page-solarcity" : ""}${isBlueprint ? " case-page-blueprint" : ""}`} lang={locale === "ua" ? "uk" : "en"}>
      <LocaleSync locale={locale} />
      <SiteHeader locale={locale} pageKind="project" languageHref={languageHref} />

      <main id="main">
        <section className="case-hero" id="top" data-scroll-region="hero">
          <div className="case-kicker"><span>{isSolarCity && locale === "en" ? "COMPLETED PROJECT" : t.kicker}</span><span>{isSolarCity ? <>{locale === "ua" ? "ФЛАГМАНСЬКИЙ КЕЙС" : "FLAGSHIP CASE"} / <span className="sc-kicker-motion">WEB &amp; MOTION</span></> : project.category}</span></div>
          <h1 className={isYevai ? "case-title-yevai" : undefined}>{project.title}</h1>
          <div className="case-hero-bottom"><p className="case-text-lead">{project.description}</p><span>{project.scope}</span></div>
          <p className="case-live-status"><svg className="case-live-indicator" viewBox="-3 -3 6 6" width="6" height="6" aria-hidden="true" focusable="false"><circle className="case-live-ring" cx="0" cy="0" r="4" /><circle cx="0" cy="0" r="3" fill="#258451" /></svg>{locale === "ua" ? "САЙТ ПРАЦЮЄ" : "WEBSITE LIVE"}</p>
        </section>

        <section className={`case-cover case-tone-${project.tone}${isYevai ? " case-cover-yevai" : ""}${project.preview ? " has-real-preview" : ""}`} data-scroll-region="case-cover">
          {project.preview ? (
            isYevai ? (
              <picture className="case-cover-picture">
                <Image
                  src={project.preview}
                  alt={locale === "ua" ? "Головна сторінка YevAI.dev" : "YevAI.dev homepage"}
                  fill
                  priority
                  sizes="100vw"
                  unoptimized
                />
              </picture>
            ) : (
              <Image
                src={project.preview}
                alt={isSolarCity ? locale === "ua" ? "Головний екран корпоративного сайту SolarCity" : "SolarCity corporate website opening screen" : `${project.title} website preview`}
                style={isSolarFamily || isSolarCity ? { objectFit: "contain" } : undefined}
                fill
                priority
                sizes="100vw"
                unoptimized
              />
            )
          ) : (
            <><span>{t.placeholder}</span><b aria-hidden="true">{slug === "solarcity" ? "SC" : "SF"}</b><i /><i /></>
          )}
        </section>

        <section className="case-facts" data-scroll-region="case-facts">
          {facts.map(([label, value], index) => (
            <div key={label}>
              <div className="case-fact-label"><span className="featured-phase-index" aria-hidden="true">0{index + 1}</span><span className="content-meta">{label}</span></div>
              <p className="content-body">{value}</p>
            </div>
          ))}
        </section>

        <section className="case-sections">
          {caseSections.map((title, index) => (
            <article key={title} data-scroll-region={`case-section-${index}`}>
              <span>{String(index + 1).padStart(2, "0")} / {title}</span>
              {isYevai
                ? <YevaiCaseSection index={index} locale={locale} />
                : isSolarFamily
                  ? <SolarFamilyCaseSection index={index} locale={locale} />
                  : isSolarCity
                    ? <SolarCityCaseSection index={index} locale={locale} />
                    : isBlueprint
                      ? <BlueprintCaseSection index={index} locale={locale} />
                      : <div className="case-placeholder"><p className="case-text-lead">{t.pending}</p><small>{t.status}</small></div>}
            </article>
          ))}
        </section>

        {(liveHref || isBlueprint) && (
          <div className="case-live">
            {liveHref ? (
              <a className="send-button" href={liveHref} target="_blank" rel="noopener noreferrer" data-project-live>
                <span>{t.live}</span><LiveSiteArrow />
              </a>
            ) : (
              <span className="send-button" role="link" aria-disabled="true" style={{ cursor: "default" }} data-project-live>
                <span>{t.live}</span><LiveSiteArrow />
              </span>
            )}
          </div>
        )}

        <section className="next-project" data-scroll-region="case-next">
          <span>{t.next}</span>
          <Link href={`/${locale}/work/${nextSlug}`}><strong>{next.title}</strong><span>→</span></Link>
        </section>

      </main>
    </div>
  );
}
