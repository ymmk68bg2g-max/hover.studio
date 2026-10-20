"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Faq } from "./faq";
import { HeroTechnologyField } from "./hero-technology-field";
import { FeaturedSolarcity } from "./featured-solarcity";
import { getServices, type ServiceSlug } from "./services";
import { PriceText } from "./price-text";
import { SiteHeader } from "./site-chrome";
import { Testimonials } from "./testimonials";
import { CapabilityMotionDemo } from "./capability-motion-demo";
import { CapabilityStrategyDemo } from "./capability-strategy-demo";
import { CapabilityDesignDemo } from "./capability-design-demo";
import { CapabilityDevelopmentDemo } from "./capability-development-demo";

type Locale = "en" | "ua";

const capabilityDemos = [CapabilityStrategyDemo, CapabilityDesignDemo, CapabilityDevelopmentDemo, CapabilityMotionDemo];

const content = {
  en: {
    hero: {
      label: "INDEPENDENT DIGITAL STUDIO",
      location: "KYIV / WORKING WORLDWIDE",
      lines: ["DESIGN", "THAT", "RESPONDS."],
      body: "We create distinctive websites through strategy, design, development and motion.",
      view: "VIEW WORK",
      start: "START A PROJECT",
      disciplines: ["STRATEGY", "DESIGN", "DEVELOPMENT", "MOTION"],
    },
    work: {
      label: "01 / SELECTED WORK",
      note: "SELECTED DIGITAL WORK / 2026",
      projects: [
        { title: "SOLARCITY", slug: "solarcity", meta: "ENERGY HOLDING / 2026", description: "Corporate digital platform for an energy holding.", scope: "STRATEGY / UX/UI / DEVELOPMENT / MOTION", code: "SC—01", tone: "dark", preview: "/previews/solarcity-corporate.png", mobilePreview: null, live: "https://www.solarcity.ua/" },
        { title: "SOLARFAMILY", slug: "solarfamily", meta: "ENERGY ENGINEERING / 2026", description: "Solar generation, energy storage and EV charging — one engineering platform.", scope: "STRATEGY / UX/UI / DEVELOPMENT / MOTION", code: "SF—02", tone: "warm", preview: "/previews/solarfamily-published.webp", mobilePreview: null, live: "https://solarfamily.ua/" },
        { title: "YEVAI", slug: "yevai", meta: "CREATIVE PLATFORM / 2026", description: "Creative portfolio and AI production platform.", scope: "STRATEGY / ART DIRECTION / UX/UI / DEVELOPMENT", code: "YV—03", tone: "yevai", preview: "/previews/yevai-home.png", mobilePreview: "/previews/yevai-mobile.jpg", live: "https://yevai.dev/" },
        { title: "AI COMMERCIAL BLUEPRINT", slug: "ai-commercial-blueprint", meta: "DIGITAL PRODUCT / 2026", description: "Educational digital product and conversion-focused landing experience.", scope: "STRATEGY / UX/UI / DEVELOPMENT / MOTION", code: "AC—04", tone: "blueprint", preview: "/previews/ai-commercial-blueprint-cover.png", mobilePreview: "/previews/ai-commercial-blueprint-mobile.jpg", live: null },
      ],
      placeholder: "PROJECT MEDIA / READY TO REPLACE",
      view: "VIEW CASE",
      live: "LIVE",
    },
    about: {
      label: "02 / HOVER",
      headline: ["LESS LAYERS.", "MORE INVOLVEMENT."],
      body: "HOVER is an independent digital studio working directly with businesses from first idea to final launch.\n\nWe create landing pages and corporate websites — from structure and art direction to design, development and motion. We build each site to do more than look contemporary: it should clearly communicate the business, its product and the level of quality behind both.\n\nEvery project is approached individually, with real business needs in mind. This lets us move faster than a standard agency process without compromising quality.",
      note: "No unnecessary layers between the client and the person responsible for the work.",
    },
    capabilities: {
      label: "03 / CAPABILITIES",
      hint: "HOVER OR TAP TO EXPLORE",
      mobileHint: "CHOOSE A CAPABILITY",
      items: [
        { title: "STRATEGY", details: ["Business goals", "Website architecture", "Content structure", "User flows"], visual: "GOAL / STRUCTURE / USER JOURNEY" },
        { title: "DESIGN", details: ["Art direction", "UX/UI", "Responsive design", "Design systems"], visual: "WIREFRAME / STYLE / RESPONSIVE" },
        { title: "DEVELOPMENT", details: ["Front-end development", "CMS", "Integrations", "Performance", "SEO foundations"], visual: "CONTENT / PUBLISHING / WEBSITE" },
        { title: "MOTION", details: ["Interaction design", "Micro animation", "Scroll behaviour", "Transitions"], visual: "REVEAL / RESPONSE / TRANSITION" },
      ],
    },
    process: {
      label: "04 / PROCESS",
      headline: ["FROM FIRST QUESTION TO", "FINAL LAUNCH."],
      steps: [
        ["DISCOVER", "Understand the business, audience and real project constraints."],
        ["DEFINE", "Shape the architecture, priorities and content before visual work begins."],
        ["DESIGN", "Build a clear art direction and responsive interface system."],
        ["BUILD", "Turn the approved system into a fast, maintainable website."],
        ["REFINE", "Test behaviour, motion, content and details across devices."],
        ["LAUNCH", "Prepare the final product, handover and a clean path forward."],
      ],
    },
    featured: {
      label: "05 / FEATURED CASE",
      title: "SOLARCITY",
      meta: "ENERGY HOLDING / CORPORATE DIGITAL PLATFORM / 2026",
      intro: "A closer look at how structure, art direction and interaction become one coherent digital product.",
      motionTitle: "MOTION AS A SYSTEM",
      motion: "Modern animation brings transitions, menus, microinteractions and scroll responses into one ecosystem. Consistent timing and a shared rhythm give every part of the website the same character.",
      motionNote: "Movement guides attention, connects sections and clarifies changes in interface state. On touch screens, the same logic continues through taps and scrolling.",
      tags: ["CONTEXT", "CHALLENGE", "STRUCTURE", "ART DIRECTION", "RESPONSIVE", "INTERACTION", "RESULT"],
    },
    founder: {
      label: "06 / FOUNDER",
      name: ["YEVHENIY", "POLOSENKO"],
      role: "FOUNDER / CREATIVE DIRECTOR",
      body: "HOVER was founded as an independent studio built around direct creative involvement — from initial structure and art direction to production and launch.\n\nEach project starts with understanding the business, its audience and real constraints. This helps us set priorities and create a clear foundation for design.\n\nWe connect structure, design and development in one process. We consider visual decisions alongside content, responsive layouts and interface behaviour.\n\nClients speak directly with the person responsible for the result. We explain our decisions, work through the details and keep a shared understanding of the task.",
      placeholder: "FOUNDER PORTRAIT / TO BE ADDED",
    },
    services: {
      label: "07 / SERVICES",
      note: "CLEAR SCOPES.\nDIRECT COLLABORATION.",
      details: "View service ↗",
      disclaimer: "Final scope and estimate are confirmed after a short project discussion. International pricing is quoted separately.",
    },
    care: {
      label: "08 / WEBSITE CARE",
      headline: "LAUNCH IS NOT THE END OF THE WORK.",
      body: "HOVER can continue developing the site after launch — without turning a finished product into a forgotten file.",
      items: ["CONTENT UPDATES", "NEW PAGES", "PERFORMANCE", "ONGOING DEVELOPMENT", "ANALYTICS SUPPORT"],
    },
  },
  ua: {
    hero: {
      label: "НЕЗАЛЕЖНА DIGITAL-СТУДІЯ",
      location: "КИЇВ / ПРАЦЮЄМО ПО ВСЬОМУ СВІТУ",
      lines: ["DESIGN,", "ЩО", "РЕАГУЄ."],
      body: "Створюємо виразні сайти через стратегію, дизайн, розробку та motion.",
      view: "ДИВИТИСЯ ПРОЄКТИ",
      start: "ПОЧАТИ ПРОЄКТ",
      disciplines: ["СТРАТЕГІЯ", "ДИЗАЙН", "РОЗРОБКА", "MOTION"],
    },
    work: {
      label: "01 / ОБРАНІ ПРОЄКТИ",
      note: "ОБРАНІ DIGITAL-ПРОЄКТИ / 2026",
      projects: [
        { title: "SOLARCITY", slug: "solarcity", meta: "ЕНЕРГЕТИЧНИЙ ХОЛДИНГ / 2026", description: "Корпоративна digital-платформа для енергетичного холдингу.", scope: "СТРАТЕГІЯ / UX/UI / РОЗРОБКА / MOTION", code: "SC—01", tone: "dark", preview: "/previews/solarcity-corporate.png", mobilePreview: null, live: "https://www.solarcity.ua/" },
        { title: "SOLARFAMILY", slug: "solarfamily", meta: "ЕНЕРГЕТИЧНА ІНЖЕНЕРІЯ / 2026", description: "Сонячна генерація, накопичення енергії та зарядна інфраструктура — в єдиній інженерній платформі.", scope: "СТРАТЕГІЯ / UX/UI / РОЗРОБКА / MOTION", code: "SF—02", tone: "warm", preview: "/previews/solarfamily-published.webp", mobilePreview: null, live: "https://solarfamily.ua/" },
        { title: "YEVAI", slug: "yevai", meta: "КРЕАТИВНА ПЛАТФОРМА / 2026", description: "Креативне портфоліо та платформа AI-продакшну.", scope: "СТРАТЕГІЯ / АРТДИРЕКШН / UX/UI / РОЗРОБКА", code: "YV—03", tone: "yevai", preview: "/previews/yevai-home.png", mobilePreview: "/previews/yevai-mobile.jpg", live: "https://yevai.dev/" },
        { title: "AI COMMERCIAL BLUEPRINT", slug: "ai-commercial-blueprint", meta: "DIGITAL-ПРОДУКТ / 2026", description: "Освітній digital-продукт і conversion-focused landing experience.", scope: "СТРАТЕГІЯ / UX/UI / РОЗРОБКА / MOTION", code: "AC—04", tone: "blueprint", preview: "/previews/ai-commercial-blueprint-cover.png", mobilePreview: "/previews/ai-commercial-blueprint-mobile.jpg", live: null },
      ],
      placeholder: "МАТЕРІАЛИ ПРОЄКТУ / ГОТОВІ ДО ЗАМІНИ",
      view: "ДИВИТИСЯ КЕЙС",
      live: "LIVE",
    },
    about: {
      label: "02 / HOVER",
      headline: ["МЕНШЕ ШАРІВ.", "БІЛЬШЕ ЗАЛУЧЕННЯ."],
      body: "HOVER — незалежна digital-студія, що напряму працює з бізнесом від першої ідеї до фінального запуску.\n\nСтворюємо лендінги та корпоративні веб-сайти — від структури й артдирекції до дизайну, розробки та motion. Працюємо так, щоб сайт не просто виглядав сучасно, а чітко представляв бізнес, його продукт і рівень.\n\nДля кожного проєкту підбираємо індивідуальний підхід, враховуємо реальні задачі бізнесу й можемо рухатися швидше за стандартний агентський процес без компромісів у якості.",
      note: "Без зайвих рівнів між клієнтом і людиною, яка відповідає за результат.",
    },
    capabilities: {
      label: "03 / МОЖЛИВОСТІ",
      hint: "НАВЕДІТЬ АБО НАТИСНІТЬ",
      mobileHint: "ОБЕРІТЬ НАПРЯМ",
      items: [
        { title: "СТРАТЕГІЯ", details: ["Бізнес-цілі", "Архітектура сайту", "Структура контенту", "Сценарії користувача"], visual: "ЦІЛЬ / СТРУКТУРА / МАРШРУТ" },
        { title: "ДИЗАЙН", details: ["Артдирекшн", "UX/UI", "Адаптивний дизайн", "Дизайн-система"], visual: "ПРОТОТИП / СТИЛЬ / АДАПТИВ" },
        { title: "РОЗРОБКА", details: ["Front-end розробка", "CMS", "Інтеграції", "Швидкодія", "SEO-основа"], visual: "КОНТЕНТ / ОНОВЛЕННЯ / САЙТ" },
        { title: "MOTION", details: ["Дизайн взаємодії", "Мікроанімація", "Поведінка при скролі", "Переходи"], visual: "ПОЯВА / РЕАКЦІЯ / ПЕРЕХІД" },
      ],
    },
    process: {
      label: "04 / ПРОЦЕС",
      headline: ["ВІД ПЕРШОГО ПИТАННЯ ДО", "ФІНАЛЬНОГО ЗАПУСКУ."],
      steps: [
        ["ДОСЛІДЖЕННЯ", "Розбираємося в бізнесі, аудиторії та реальних обмеженнях проєкту."],
        ["СТРУКТУРА", "Визначаємо архітектуру, пріоритети й контент до початку візуальної роботи."],
        ["ДИЗАЙН", "Створюємо чіткий артдирекшн і адаптивну систему інтерфейсу."],
        ["РОЗРОБКА", "Перетворюємо затверджену систему на швидкий і підтримуваний сайт."],
        ["REFINEMENT", "Перевіряємо поведінку, motion, контент і деталі на різних пристроях."],
        ["ЗАПУСК", "Готуємо фінальний продукт, передачу та зрозумілий подальший шлях."],
      ],
    },
    featured: {
      label: "05 / ОБРАНИЙ КЕЙС",
      title: "SOLARCITY",
      meta: "ЕНЕРГЕТИЧНИЙ ХОЛДИНГ / КОРПОРАТИВНА DIGITAL-ПЛАТФОРМА / 2026",
      intro: "Поглиблений погляд на те, як структура, артдирекшн і взаємодія стають одним цілісним digital-продуктом.",
      motionTitle: "MOTION ЯК СИСТЕМА",
      motion: "Сучасна анімація об’єднує переходи, меню, мікровзаємодії та реакції на скрол у єдину екосистему. Узгоджені таймінги й спільний ритм надають усім елементам сайту одного характеру.",
      motionNote: "Рух спрямовує увагу, пов’язує розділи та пояснює зміну станів інтерфейсу. На сенсорних екранах ця ж логіка продовжується через дотики й прокрутку.",
      tags: ["КОНТЕКСТ", "ЗАВДАННЯ", "СТРУКТУРА", "АРТДИРЕКШН", "АДАПТИВ", "ВЗАЄМОДІЯ", "РЕЗУЛЬТАТ"],
    },
    founder: {
      label: "06 / ЗАСНОВНИК",
      name: ["YEVHENIY", "POLOSENKO"],
      role: "ЗАСНОВНИК / КРЕАТИВНИЙ ДИРЕКТОР",
      body: "HOVER заснована як незалежна студія з прямим креативним залученням — від початкової структури й артдирекшну до продакшну та запуску.\n\nКожен проєкт починаємо з розуміння бізнесу, аудиторії та реальних обмежень. Це допомагає визначити пріоритети й закласти зрозумілу основу для дизайну.\n\nСтруктуру, дизайн і розробку пов’язуємо в один процес. Візуальні рішення розглядаємо разом із контентом, адаптивністю та поведінкою інтерфейсу.\n\nКлієнт спілкується напряму з людиною, яка відповідає за результат. Пояснюємо логіку рішень, узгоджуємо деталі й підтримуємо спільне розуміння задачі.",
      placeholder: "ПОРТРЕТ ЗАСНОВНИКА / БУДЕ ДОДАНО",
    },
    services: {
      label: "07 / ПОСЛУГИ",
      note: "ЧІТКИЙ ОБСЯГ.\nПРЯМА СПІВПРАЦЯ.",
      details: "Детальніше ↗",
      disclaimer: "Фінальний обсяг і кошторис підтверджуються після короткого обговорення проєкту. Для міжнародних проєктів ціна розраховується окремо.",
    },
    care: {
      label: "08 / ПІДТРИМКА САЙТУ",
      headline: "ЗАПУСК — НЕ КІНЕЦЬ РОБОТИ.",
      body: "Після запуску HOVER може продовжувати розвиток сайту — щоб готовий продукт не перетворився на забутий файл.",
      items: ["ОНОВЛЕННЯ КОНТЕНТУ", "НОВІ СТОРІНКИ", "ШВИДКОДІЯ", "ПОДАЛЬША РОЗРОБКА", "ПІДТРИМКА АНАЛІТИКИ"],
    },
  },
} as const;

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <span className="ui-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" focusable="false">
        {down ? (
          <path d="M8 2.5v10.25m-4-4L8 12.75l4-4" />
        ) : (
          <path d="M3.25 12.75 12.75 3.25M6 3.25h6.75V10" />
        )}
      </svg>
    </span>
  );
}

function SectionLabel({ children, side }: { children: string; side?: ReactNode }) {
  return (
    <div className="section-label reveal">
      <span>{children}</span>
      {side && <span>{side}</span>}
    </div>
  );
}

export function HoverSite({ locale }: { locale: Locale }) {
  const t = content[locale];
  const services = getServices(locale);
  const otherLocale = locale === "en" ? "ua" : "en";
  const [activeCap, setActiveCap] = useState(0);
  const ActiveCapabilityDemo = capabilityDemos[activeCap];
  const [activeService, setActiveService] = useState<ServiceSlug | null>(null);
  const [heroTap, setHeroTap] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const respondsRef = useRef<HTMLSpanElement>(null);
  const processRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.lang = locale === "ua" ? "uk" : "en";
    document.cookie = `hover_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    try { localStorage.setItem("hover_locale", locale); } catch { /* Storage is optional. */ }

    const mobileProcess = window.matchMedia("(max-width: 760px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const steps = Array.from(processRef.current?.querySelectorAll<HTMLElement>(".process-steps li") ?? []);
    let scrollFrame = 0;
    const updateProcess = () => {
      scrollFrame = 0;
      const section = processRef.current;
      if (section) {
        if (mobileProcess.matches) {
          const viewport = window.innerHeight;
          const progress = steps.map(step => reducedMotion.matches ? 1 : Math.max(0, Math.min(1,
            (viewport * 0.88 - step.getBoundingClientRect().top) / (viewport * 0.56),
          )));
          steps.forEach((step, index) => step.style.setProperty("--step-progress", progress[index].toFixed(4)));
        } else {
          const rect = section.getBoundingClientRect();
          const distance = rect.height - window.innerHeight;
          const progress = Math.max(0, Math.min(1, -rect.top / Math.max(distance, 1)));
          section.style.setProperty("--process-progress", `${progress * 100}%`);
        }
      }
    };
    const onScroll = () => { if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateProcess); };
    updateProcess();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    mobileProcess.addEventListener("change", onScroll);
    reducedMotion.addEventListener("change", onScroll);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.08 },
    );
    document.querySelectorAll("#main .reveal").forEach((node) => observer.observe(node));
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mobileProcess.removeEventListener("change", onScroll);
      reducedMotion.removeEventListener("change", onScroll);
      window.cancelAnimationFrame(scrollFrame);
      observer.disconnect();
    };
  }, [locale]);

  useEffect(() => {
    if (activeService === null) return;

    const clearServiceSelection = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".service-entry")) return;
      setActiveService(null);
    };

    document.addEventListener("pointerdown", clearServiceSelection);
    return () => document.removeEventListener("pointerdown", clearServiceSelection);
  }, [activeService]);

  useEffect(() => {
    if (!heroTap) return;

    const clearHeroTap = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".hero-title .responds")) return;
      setHeroTap(false);
    };

    document.addEventListener("pointerdown", clearHeroTap);
    return () => document.removeEventListener("pointerdown", clearHeroTap);
  }, [heroTap]);

  const moveHero = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || !heroRef.current || !respondsRef.current) return;
    const rect = respondsRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const influence = Math.max(0, 1 - distance / Math.max(rect.width * 0.72, 420));
    const red = Math.round(16 + (255 - 16) * influence);
    const green = Math.round(16 + (74 - 16) * influence);
    const blue = Math.round(16 + (23 - 16) * influence);
    heroRef.current.style.setProperty("--hero-x", `${Math.max(-5, Math.min(5, deltaX * 0.008 * influence))}px`);
    heroRef.current.style.setProperty("--hero-y", `${Math.max(-2.5, Math.min(2.5, deltaY * 0.006 * influence))}px`);
    heroRef.current.style.setProperty("--hero-track", `${influence * 0.012}em`);
    heroRef.current.style.setProperty("--hero-scale", `${1 + influence * 0.012}`);
    heroRef.current.style.setProperty("--response-color", `rgb(${red} ${green} ${blue})`);
  };

  const resetHero = () => {
    heroRef.current?.style.setProperty("--hero-x", "0px");
    heroRef.current?.style.setProperty("--hero-y", "0px");
    heroRef.current?.style.setProperty("--hero-track", "0em");
    heroRef.current?.style.setProperty("--hero-scale", "1");
    heroRef.current?.style.setProperty("--response-color", "var(--ink)");
  };

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} pageKind="home" languageHref={`/${otherLocale}`} />

      <main id="main">
        <section
          id="top"
          data-scroll-region="hero"
          ref={heroRef}
          className="hero"
          data-locale={locale}
          data-tap={heroTap}
        >
          <div className="hero-meta reveal">
            <span>{t.hero.label}</span>
            <span>{t.hero.location}</span>
          </div>
          <h1 className="hero-title" aria-label={t.hero.lines.join(" ")}>
            <span className="reveal">{t.hero.lines[0]}</span>
            <span className="reveal">{t.hero.lines[1]}</span>
            <span
              ref={respondsRef}
              className="responds reveal"
              onPointerMove={moveHero}
              onPointerLeave={resetHero}
              onPointerDown={(event) => event.pointerType === "touch" && setHeroTap((value) => !value)}
            >
              {t.hero.lines[2]}
            </span>
            <HeroTechnologyField locale={locale} />
          </h1>
          <div className="hero-bottom reveal">
            <p>{t.hero.body}</p>
            <div className="hero-links">
              <a href="#work"><span>{t.hero.view}</span><Arrow down /></a>
              <a href="#contact" className="hero-start"><span>{t.hero.start}</span><Arrow /></a>
            </div>
          </div>
          <div className="discipline-ticker" aria-label={t.hero.disciplines.join(", ")}>
            <div>{[...t.hero.disciplines, ...t.hero.disciplines].map((item, index) => <span key={`${item}-${index}`}>{item}<i>+</i></span>)}</div>
          </div>
        </section>

        <section id="work" className="work section-pad" data-scroll-region="work">
          <SectionLabel>{t.work.label}</SectionLabel>
          <div className="project-list">
            {t.work.projects.map((project, index) => (
              <article className={`project reveal${project.slug === "solarfamily" ? " project-solarfamily" : ""}`} key={project.title}>
                <a className={`project-media tone-${project.tone} ${project.preview ? "has-real-preview" : ""}`} href={`/${locale}/work/${project.slug}`} aria-label={`${t.work.view}: ${project.title}`}>
                  {project.preview && (
                    <picture className="project-picture">
                      <Image src={project.preview} alt={`${project.title} website preview`} style={project.slug === "solarfamily" ? { objectFit: "contain" } : undefined} fill sizes="(max-width: 760px) 100vw, 84vw" unoptimized />
                    </picture>
                  )}
                  {!project.preview && <span className="project-placeholder">{t.work.placeholder}</span>}
                  {!project.preview && <span className="project-ghost" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
                  <span className="project-hover-wash" aria-hidden="true" />
                  <span className="project-view">{t.work.view} <Arrow /></span>
                </a>
                <div className="project-copy">
                  <div className="project-main">
                    <a href={`/${locale}/work/${project.slug}`}><h2>{project.title}</h2></a>
                    <p className="section-body project-description">{project.description}</p>
                  </div>
                  <div className="project-meta">
                    <p>{project.meta}</p>
                    <p>{project.scope}</p>
                    <div className="project-actions">
                      <a href={`/${locale}/work/${project.slug}`}>{t.work.view} <Arrow /></a>
                      {project.live ? (
                        <a href={project.live} target="_blank" rel="noreferrer">{t.work.live} <Arrow /></a>
                      ) : (
                        <span role="link" aria-disabled="true" style={{ cursor: "default" }}>{t.work.live} <Arrow /></span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="about section-pad" data-scroll-region="about">
          <SectionLabel>{t.about.label}</SectionLabel>
          <div className="about-grid">
            <h2 className="display-heading reveal"><span>{t.about.headline[0]}</span><span>{t.about.headline[1]}</span></h2>
            <div className="about-copy reveal">
              {t.about.body.split("\n\n").map((paragraph, index) => (
                <p className={index === 0 ? "section-lead about-lead" : "section-body about-body"} key={paragraph}>{paragraph}</p>
              ))}
              <p className="section-body about-note">{t.about.note}</p>
            </div>
          </div>
        </section>

        <section id="capabilities" className="capabilities section-pad" data-scroll-region="capabilities">
          <SectionLabel side={<><span className="cap-hint-pointer">{t.capabilities.hint}</span><span className="cap-hint-touch">{t.capabilities.mobileHint}</span></>}>{t.capabilities.label}</SectionLabel>
          <div className="cap-desktop">
            <div className="cap-rows">
              {t.capabilities.items.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  className={activeCap === index ? "active" : ""}
                  aria-pressed={activeCap === index}
                  onMouseEnter={() => setActiveCap(index)}
                  onFocus={() => setActiveCap(index)}
                  onClick={() => setActiveCap(index)}
                >
                  <span>0{index + 1}</span><strong className="section-heading">{item.title}</strong><Arrow />
                </button>
              ))}
            </div>
            <div className="cap-visual" aria-live="polite">
              <ActiveCapabilityDemo key={activeCap} locale={locale} />
              <div className="cap-visual-meta"><span>{t.capabilities.items[activeCap].visual}</span><span>0{activeCap + 1} / 04</span></div>
              <ul>{t.capabilities.items[activeCap].details.map((detail) => <li className="section-body" key={detail}>{detail}</li>)}</ul>
            </div>
          </div>
          <Accordion className="cap-mobile" type="single" collapsible>
            {t.capabilities.items.map((item, index) => {
              const CapabilityDemo = capabilityDemos[index];
              return (
                <AccordionItem value={`cap-${index}`} key={item.title}>
                  <AccordionTrigger data-language-disclosure={`cap-${index}`}><span>0{index + 1}</span><strong className="section-heading">{item.title}</strong></AccordionTrigger>
                  <AccordionContent><p className="cap-mobile-caption">{item.visual}</p><CapabilityDemo locale={locale} /><ul>{item.details.map((detail) => <li className="section-body" key={detail}>{detail}</li>)}</ul></AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        <section id="process" ref={processRef} className="process section-pad" data-scroll-region="process">
          <SectionLabel>{t.process.label}</SectionLabel>
          <div className="process-grid">
            <div className="process-intro reveal"><h2 className="section-heading home-display-heading">{t.process.headline[0]} <span>{t.process.headline[1]}</span></h2><div className="progress-track"><i /></div></div>
            <ol className="process-steps">
              {t.process.steps.map(([title, description], index) => (
                <li className="reveal" key={title}><span>0{index + 1}</span><h3 className="content-subheading">{title}</h3><p className="section-body">{description}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section id="featured" className="featured section-pad" data-locale={locale} data-scroll-region="featured">
          <SectionLabel>{t.featured.label}</SectionLabel>
          <div className="featured-head reveal"><h2>{t.featured.title}</h2><p>{t.featured.meta}</p></div>
          <FeaturedSolarcity locale={locale} />
          <div className="featured-detail reveal">
            <div className="featured-summary">
              <p className="section-lead">{t.featured.intro}</p>
              <a className="featured-site-link" href="https://www.solarcity.ua/" target="_blank" rel="noopener noreferrer">{locale === "ua" ? "ПЕРЕГЛЯНУТИ САЙТ" : "VIEW WEBSITE"} <Arrow /></a>
            </div>
            <div className="featured-motion">
              <h3 className="content-subheading">{t.featured.motionTitle}</h3>
              <p className="section-body">{t.featured.motion}</p>
              <p className="section-body">{t.featured.motionNote}</p>
            </div>
          </div>
          <ol className="featured-phases">{t.featured.tags.map((tag, index) => (
            <li key={tag}><span className="featured-phase-index" aria-hidden="true">0{index + 1}</span><span className="content-meta">{tag}</span></li>
          ))}</ol>
        </section>

        <section id="founder" className="founder section-pad" data-scroll-region="founder">
          <SectionLabel>{t.founder.label}</SectionLabel>
          <div className="founder-grid">
            <div className="portrait-placeholder has-image reveal">
              <Image
                src="/images/yevheniy-polosenko.webp"
                alt={`${t.founder.name.join(" ")} — ${t.founder.role}`}
                fill
                unoptimized
                sizes="(max-width: 760px) 88vw, 34vw"
              />
            </div>
            <div className="founder-copy reveal">
              <div className="founder-heading">
                <h2><span>{t.founder.name[0]}</span><span>{t.founder.name[1]}</span></h2>
                <p className="founder-role">{t.founder.role}</p>
              </div>
              <div className="founder-body">{t.founder.body.split("\n\n").map(paragraph => <p className="section-body" key={paragraph}>{paragraph}</p>)}</div>
            </div>
          </div>
        </section>

        <section id="services" className="services section-pad" data-scroll-region="services">
          <SectionLabel side={t.services.note}>{t.services.label}</SectionLabel>
          <div className="service-list">
            {services.map((service) => {
              const isOpen = activeService === service.id;
              const triggerId = `service-trigger-${service.id}`;
              const panelId = `service-detail-${service.id}`;

              return (
                <div className="service-entry reveal" key={service.id} data-open={isOpen}>
                  <button
                    className="service-row"
                    id={triggerId}
                    data-language-disclosure={`service-${service.id}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setActiveService((current) => current === service.id ? null : service.id)}
                  >
                    <span>{service.number}</span><h3>{service.name}</h3><p><PriceText value={service.price} /></p><Arrow />
                  </button>
                  <div
                    className="service-detail"
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!isOpen}
                  >
                    <div>
                      <p className="section-body">{service.intro}</p>
                      <a href={`/${locale}/services/${service.slug}`} tabIndex={isOpen ? undefined : -1}>
                        {t.services.details}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="section-body service-disclaimer reveal">{t.services.disclaimer}</p>
        </section>

        <section id="care" className="care section-pad" data-scroll-region="care">
          <SectionLabel>{t.care.label}</SectionLabel>
          <div className="care-grid">
            <h2 className="section-heading home-display-heading reveal">{t.care.headline}</h2>
            <div className="care-copy reveal"><p className="section-lead">{t.care.body}</p><div>{t.care.items.map((item, index) => <span className="content-meta" key={item}>0{index + 1} / {item}</span>)}</div></div>
          </div>
        </section>

        <Testimonials locale={locale} />
        <Faq locale={locale} />

      </main>
    </div>
  );
}
