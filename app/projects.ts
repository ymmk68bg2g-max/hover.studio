import { solarCityCaseCopy } from "./solarcity-case-copy";
import { blueprintCaseCopy } from "./blueprint-case-copy";

export const projectSlugs = ["solarcity", "solarfamily", "yevai", "ai-commercial-blueprint"] as const;

export type ProjectSlug = (typeof projectSlugs)[number];
export type ProjectLocale = "en" | "ua";

type ProjectCopy = {
  title: string;
  category: string;
  client: string;
  industry: string;
  siteType: string;
  services: string;
  languages: string;
  scope: string;
  year: string;
  description: string;
  preview: string | null;
  live: string | null;
  tone: string;
};

const shared = {
  solarcity: {
    title: "SOLARCITY",
    client: "SolarCity",
    languages: "UA / EN",
    year: "2026",
    preview: "/previews/solarcity-corporate.png",
    live: "https://www.solarcity.ua/",
    tone: "dark",
  },
  solarfamily: {
    title: "SOLARFAMILY",
    client: "SolarFamily",
    languages: "UA / EN",
    year: "2026",
    preview: "/previews/solarfamily-published.webp",
    live: "https://solarfamily.ua/",
    tone: "warm",
  },
  yevai: {
    title: "YEVAI.DEV",
    client: "YevAI.dev",
    languages: "UA / EN",
    year: "2026",
    preview: "/previews/yevai-real.jpg",
    live: "https://yevai.dev/",
    tone: "yevai",
  },
  "ai-commercial-blueprint": {
    title: "AI COMMERCIAL BLUEPRINT",
    client: "YevAI.dev",
    languages: "UA",
    year: "2026",
    preview: "/previews/ai-commercial-blueprint-cover.png",
    live: null,
    tone: "blueprint",
  },
} as const;

const localized: Record<ProjectLocale, Record<ProjectSlug, Omit<ProjectCopy, keyof (typeof shared)[ProjectSlug]>>> = {
  en: {
    solarcity: {
      category: "CORPORATE DIGITAL PLATFORM",
      industry: "Energy / investment",
      siteType: "Corporate website",
      services: "Strategy / UX/UI / development / motion",
      scope: "STRATEGY / UX/UI / DEVELOPMENT / MOTION",
      description: solarCityCaseCopy.en.description,
    },
    solarfamily: {
      category: "CORPORATE WEBSITE",
      industry: "Energy engineering",
      siteType: "Corporate website",
      services: "Strategy / UX/UI / development / motion",
      scope: "STRATEGY / UX/UI / DEVELOPMENT / MOTION",
      description: "A corporate website bringing together solar generation, energy storage and EV charging infrastructure.",
    },
    yevai: {
      category: "AI CREATIVE STUDIO",
      industry: "AI / creative production",
      siteType: "Portfolio website",
      services: "Strategy / art direction / UX/UI / development / content",
      scope: "STRATEGY / ART DIRECTION / UX/UI / DEVELOPMENT / CONTENT",
      description: "Founder-led AI creative studio and bilingual commercial portfolio platform.",
    },
    "ai-commercial-blueprint": {
      category: "PRODUCT LANDING PAGE",
      industry: "Education / commercial production",
      siteType: "Product landing page",
      services: "Strategy / UX/UI / development / motion",
      scope: "STRATEGY / UX/UI / DEVELOPMENT / MOTION",
      description: blueprintCaseCopy.en.description,
    },
  },
  ua: {
    solarcity: {
      category: "КОРПОРАТИВНА DIGITAL-ПЛАТФОРМА",
      industry: "Енергетика / інвестиції",
      siteType: "Корпоративний сайт",
      services: "Стратегія / UX/UI / розробка / анімація",
      scope: "СТРАТЕГІЯ / UX/UI / РОЗРОБКА / MOTION",
      description: solarCityCaseCopy.ua.description,
    },
    solarfamily: {
      category: "КОРПОРАТИВНИЙ САЙТ",
      industry: "Енергетична інженерія",
      siteType: "Корпоративний сайт",
      services: "Стратегія / UX/UI / розробка / анімація",
      scope: "СТРАТЕГІЯ / UX/UI / РОЗРОБКА / MOTION",
      description: "Корпоративний сайт, що об’єднує сонячну генерацію, накопичення енергії та зарядну інфраструктуру.",
    },
    yevai: {
      category: "AI CREATIVE STUDIO",
      industry: "ШІ / креативне виробництво",
      siteType: "Сайт-портфоліо",
      services: "Стратегія / артдирекшн / UX/UI / розробка / контент",
      scope: "STRATEGY / ART DIRECTION / UX/UI / DEVELOPMENT / CONTENT",
      description: "Авторський проєкт — ШІ-креативна студія та двомовна комерційна платформа-портфоліо.",
    },
    "ai-commercial-blueprint": {
      category: "ПРОДУКТОВИЙ ЛЕНДИНГ",
      industry: "Освіта / комерційне виробництво",
      siteType: "Продуктовий лендинг",
      services: "Стратегія / UX/UI / розробка / анімація",
      scope: "СТРАТЕГІЯ / UX/UI / РОЗРОБКА / MOTION",
      description: blueprintCaseCopy.ua.description,
    },
  },
};

export function getProject(locale: ProjectLocale, slug: ProjectSlug): ProjectCopy {
  return { ...shared[slug], ...localized[locale][slug] } as ProjectCopy;
}

export function getNextProject(slug: ProjectSlug): ProjectSlug {
  const index = projectSlugs.indexOf(slug);
  return projectSlugs[(index + 1) % projectSlugs.length];
}
