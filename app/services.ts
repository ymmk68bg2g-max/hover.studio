import type { ProjectLocale, ProjectSlug } from "./projects";

export const serviceSlugs = [
  "landing-pages",
  "business-websites",
  "corporate-websites",
  "digital-experience",
  "website-care",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];
export type ServiceLocale = ProjectLocale;

export type LocalizedService = {
  id: ServiceSlug;
  slug: ServiceSlug;
  number: string;
  name: string;
  formLabel: string;
  price: string;
  intro: string;
  whenItFits: string;
  scope: readonly string[];
  separatelyAgreed: readonly string[];
  process: string;
  estimate: string;
  relatedWork: readonly ProjectSlug[];
};

type ServiceCopy = Omit<LocalizedService, "id" | "slug" | "number">;

const servicesByLocale = {
  en: {
    "landing-pages": {
      name: "LANDING PAGE",
      formLabel: "Landing Page",
      price: "FROM $850",
      intro:
        "A focused page for one key message, offer or campaign. We shape a clear presentation and a direct path from the first screen to enquiry.",
      whenItFits:
        "Best suited to launching a specific product, service or campaign when the communication needs one clear focus and one understandable next step.",
      scope: [
        "Page structure and content logic",
        "Content hierarchy and user flow",
        "Art direction and UX/UI design",
        "Responsive design",
        "Front-end development",
        "Quality review and launch preparation",
      ],
      separatelyAgreed: [
        "CMS and editable content fields",
        "Third-party integrations",
        "Expanded motion",
        "Creation of missing copy or visual materials",
      ],
      process:
        "We clarify the offer and the intended action, define the page logic, establish the visual direction, then design, build and review the responsive implementation.",
      estimate:
        "Timing and the final estimate depend on the amount and readiness of content, required functionality, integrations and motion. The exact scope is confirmed before work begins; international pricing is quoted separately.",
      relatedWork: ["ai-commercial-blueprint"],
    },
    "business-websites": {
      name: "BUSINESS WEBSITE",
      formLabel: "Business Website",
      price: "FROM $1,350",
      intro:
        "A compact multi-page presence that introduces the company, explains its services and gives a potential client the information needed for the next step.",
      whenItFits:
        "Suitable for businesses that need a clear, credible website with several connected content areas rather than one campaign-focused page.",
      scope: [
        "Information architecture and content priorities",
        "Key company and service pages",
        "User flows and UX/UI design",
        "Responsive design",
        "Front-end development",
        "Quality review and launch preparation",
      ],
      separatelyAgreed: [
        "CMS and editable content fields",
        "Third-party integrations",
        "Expanded motion",
        "Creation or migration of content",
      ],
      process:
        "We review the business, audience and available materials, shape the architecture, create a coherent interface system, then build and review the agreed pages across devices.",
      estimate:
        "Timing and the final estimate depend on the number of unique page types, languages, material readiness, CMS, integrations and motion. The exact scope is confirmed before work begins; international pricing is quoted separately.",
      relatedWork: ["yevai"],
    },
    "corporate-websites": {
      name: "CORPORATE WEBSITE",
      formLabel: "Corporate Website",
      price: "FROM $1,950",
      intro:
        "A structured digital system for companies with more complex information: business areas, solutions, projects and several distinct audiences.",
      whenItFits:
        "Designed for organisations whose website must organise a broader offer and guide different audiences through connected but distinct journeys.",
      scope: [
        "Information architecture for complex content",
        "Page and template system",
        "Audience-specific user journeys",
        "Art direction and design system",
        "Responsive UX/UI design",
        "Front-end development and launch preparation",
      ],
      separatelyAgreed: [
        "CMS and content workflows",
        "Third-party integrations",
        "Expanded motion",
        "Content migration and additional language versions",
      ],
      process:
        "We map the company structure and audiences, define the architecture and reusable page system, establish the art direction, then design, develop and validate the agreed implementation.",
      estimate:
        "Timing and the final estimate depend on architectural complexity, unique templates, languages, content volume, CMS, integrations and motion. The exact scope is confirmed before work begins; international pricing is quoted separately.",
      relatedWork: ["solarfamily", "solarcity"],
    },
    "digital-experience": {
      name: "DIGITAL EXPERIENCE",
      formLabel: "Digital Experience",
      price: "CUSTOM",
      intro:
        "An expressive digital presentation in which individual art direction, interaction and motion become part of the brand communication.",
      whenItFits:
        "A fit when a standard presentation is not enough and the digital experience needs a distinctive visual language and purposeful interactive behaviour.",
      scope: [
        "Creative strategy and art direction",
        "Experience architecture and UX/UI design",
        "Responsive interface system",
        "Relevant interaction design",
        "Motion direction and implementation",
        "Front-end development and quality review",
      ],
      separatelyAgreed: [
        "CMS and content workflows",
        "Third-party integrations",
        "Additional technical functionality",
        "Creation of copy, imagery or other source materials",
      ],
      process:
        "We define the communication goal and creative direction, test the core interaction ideas, build the responsive interface and refine motion and behaviour in the working implementation.",
      estimate:
        "Timing and budget are estimated individually according to the creative concept, number of unique states, interaction and motion complexity, content readiness and technical requirements.",
      relatedWork: ["solarcity", "ai-commercial-blueprint"],
    },
    "website-care": {
      name: "WEBSITE CARE",
      formLabel: "Website Care",
      price: "FROM $200 / MONTH",
      intro:
        "Support and development for an already launched website, from agreed content updates to new pages and technical improvements.",
      whenItFits:
        "For teams that need a reliable way to keep an existing website current and improve it through clearly prioritised work after launch.",
      scope: [
        "Content updates",
        "New pages",
        "Performance improvements",
        "Ongoing development",
        "Analytics support",
      ],
      separatelyAgreed: [
        "Workload and priorities for each period",
        "New functionality and integrations",
        "Large redesign or restructuring tasks",
        "Third-party services and recurring costs",
      ],
      process:
        "We review the current site, agree the priorities and workload for a defined period, complete the approved tasks and report what changed and what should follow.",
      estimate:
        "The exact workload, collaboration format and estimate are agreed for the relevant period. The starting price is not an unlimited scope and does not include an unconfirmed SLA or 24/7 support.",
      relatedWork: [],
    },
  },
  ua: {
    "landing-pages": {
      name: "ЛЕНДИНГ",
      formLabel: "Лендинг",
      price: "ВІД 35 000 ГРН",
      intro:
        "Сторінка для одного ключового повідомлення, пропозиції або кампанії. Вибудовуємо зрозумілу логіку подачі та шлях від першого екрану до звернення.",
      whenItFits:
        "Підходить для запуску окремого продукту, послуги або кампанії, коли комунікації потрібен один чіткий фокус і зрозумілий наступний крок.",
      scope: [
        "Структура й логіка сторінки",
        "Ієрархія контенту та сценарій користувача",
        "Артдирекшн і UX/UI-дизайн",
        "Адаптивний дизайн",
        "Front-end розробка",
        "Перевірка та підготовка до запуску",
      ],
      separatelyAgreed: [
        "CMS і редаговані поля контенту",
        "Сторонні інтеграції",
        "Розширений motion",
        "Створення відсутніх текстів або візуальних матеріалів",
      ],
      process:
        "Уточнюємо пропозицію та цільову дію, визначаємо логіку сторінки й візуальний напрям, після чого проєктуємо, розробляємо та перевіряємо адаптивну реалізацію.",
      estimate:
        "Строк і фінальна оцінка залежать від обсягу та готовності контенту, потрібної функціональності, інтеграцій і motion. Точний обсяг фіксуємо до початку роботи; для міжнародних проєктів ціну розраховуємо окремо.",
      relatedWork: ["ai-commercial-blueprint"],
    },
    "business-websites": {
      name: "БІЗНЕС-САЙТ",
      formLabel: "Бізнес-сайт",
      price: "ВІД 55 000 ГРН",
      intro:
        "Компактна багатосторінкова присутність, що представляє компанію, її послуги та дає потенційному клієнту потрібну інформацію для наступного кроку.",
      whenItFits:
        "Підходить бізнесам, яким потрібен зрозумілий і переконливий сайт із кількома пов’язаними змістовими напрямами замість однієї кампанійної сторінки.",
      scope: [
        "Інформаційна архітектура та пріоритети контенту",
        "Ключові сторінки компанії та послуг",
        "Сценарії користувача й UX/UI-дизайн",
        "Адаптивний дизайн",
        "Front-end розробка",
        "Перевірка та підготовка до запуску",
      ],
      separatelyAgreed: [
        "CMS і редаговані поля контенту",
        "Сторонні інтеграції",
        "Розширений motion",
        "Створення або перенесення контенту",
      ],
      process:
        "Аналізуємо бізнес, аудиторію та наявні матеріали, формуємо архітектуру й цілісну систему інтерфейсу, після чого розробляємо та перевіряємо погоджені сторінки на різних пристроях.",
      estimate:
        "Строк і фінальна оцінка залежать від кількості унікальних типів сторінок, мов, готовності матеріалів, CMS, інтеграцій і motion. Точний обсяг фіксуємо до початку роботи; для міжнародних проєктів ціну розраховуємо окремо.",
      relatedWork: ["yevai"],
    },
    "corporate-websites": {
      name: "КОРПОРАТИВНИЙ САЙТ",
      formLabel: "Корпоративний сайт",
      price: "ВІД 80 000 ГРН",
      intro:
        "Система для компаній зі складнішою структурою: напрямами діяльності, рішеннями, проєктами та різними аудиторіями.",
      whenItFits:
        "Призначений для організацій, чиєму сайту потрібно впорядкувати ширшу пропозицію та провести різні аудиторії через пов’язані, але відмінні сценарії.",
      scope: [
        "Інформаційна архітектура складного контенту",
        "Система сторінок і шаблонів",
        "Сценарії для різних аудиторій",
        "Артдирекшн і дизайн-система",
        "Адаптивний UX/UI-дизайн",
        "Front-end розробка та підготовка до запуску",
      ],
      separatelyAgreed: [
        "CMS і процеси роботи з контентом",
        "Сторонні інтеграції",
        "Розширений motion",
        "Перенесення контенту та додаткові мовні версії",
      ],
      process:
        "Мапуємо структуру компанії та її аудиторії, визначаємо архітектуру й систему повторно використовуваних шаблонів сторінок, формуємо артдирекшн, а потім проєктуємо, розробляємо та перевіряємо погоджену реалізацію.",
      estimate:
        "Строк і фінальна оцінка залежать від складності архітектури, унікальних шаблонів, мов, обсягу контенту, CMS, інтеграцій і motion. Точний обсяг фіксуємо до початку роботи; для міжнародних проєктів ціну розраховуємо окремо.",
      relatedWork: ["solarfamily", "solarcity"],
    },
    "digital-experience": {
      name: "DIGITAL EXPERIENCE",
      formLabel: "Digital Experience",
      price: "ІНДИВІДУАЛЬНО",
      intro:
        "Виразна цифрова презентація, у якій індивідуальний артдирекшн, взаємодія та motion стають частиною комунікації бренду.",
      whenItFits:
        "Підходить, коли стандартної презентації недостатньо, а цифровому досвіду потрібні власна візуальна мова та доречна інтерактивна поведінка.",
      scope: [
        "Креативна стратегія та артдирекшн",
        "Архітектура досвіду й UX/UI-дизайн",
        "Адаптивна система інтерфейсу",
        "Доречний дизайн взаємодії",
        "Motion-напрям і реалізація",
        "Front-end розробка та перевірка якості",
      ],
      separatelyAgreed: [
        "CMS і процеси роботи з контентом",
        "Сторонні інтеграції",
        "Додаткова технічна функціональність",
        "Створення текстів, зображень або інших вихідних матеріалів",
      ],
      process:
        "Визначаємо комунікаційну ціль і креативний напрям, перевіряємо ключові інтерактивні ідеї, будуємо адаптивний інтерфейс і допрацьовуємо motion та поведінку в робочій реалізації.",
      estimate:
        "Строк і бюджет оцінюємо індивідуально — відповідно до креативної концепції, кількості унікальних станів, складності взаємодії та motion, готовності контенту й технічних вимог.",
      relatedWork: ["solarcity", "ai-commercial-blueprint"],
    },
    "website-care": {
      name: "ПІДТРИМКА САЙТУ",
      formLabel: "Підтримка сайту",
      price: "ВІД 8 000 ГРН / МІСЯЦЬ",
      intro:
        "Підтримка та розвиток уже запущеного сайту: від узгоджених оновлень до нових сторінок і технічних покращень.",
      whenItFits:
        "Для команд, яким потрібен надійний спосіб підтримувати актуальність наявного сайту та розвивати його через чітко пріоритезовані задачі після запуску.",
      scope: [
        "Оновлення контенту",
        "Нові сторінки",
        "Покращення швидкодії",
        "Подальша розробка",
        "Підтримка аналітики",
      ],
      separatelyAgreed: [
        "Обсяг і пріоритети робіт на кожен період",
        "Нова функціональність та інтеграції",
        "Масштабний редизайн або реструктуризація",
        "Сторонні сервіси й регулярні платежі",
      ],
      process:
        "Перевіряємо поточний сайт, погоджуємо пріоритети й обсяг на визначений період, виконуємо затверджені задачі та фіксуємо, що змінилося і що варто робити далі.",
      estimate:
        "Точний обсяг, формат взаємодії та оцінку погоджуємо на відповідний період. Стартова ціна не означає необмеженого обсягу та не включає непідтверджений SLA або підтримку 24/7.",
      relatedWork: [],
    },
  },
} as const satisfies Record<ServiceLocale, Record<ServiceSlug, ServiceCopy>>;

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === "string" && serviceSlugs.includes(value as ServiceSlug);
}

export function getServices(locale: ServiceLocale): readonly LocalizedService[] {
  return serviceSlugs.map((slug, index) => ({
    id: slug,
    slug,
    number: String(index + 1).padStart(2, "0"),
    ...servicesByLocale[locale][slug],
  }));
}

export function getService(locale: ServiceLocale, slug: ServiceSlug): LocalizedService {
  const index = serviceSlugs.indexOf(slug);

  return {
    id: slug,
    slug,
    number: String(index + 1).padStart(2, "0"),
    ...servicesByLocale[locale][slug],
  };
}

export function getServiceHref(locale: ServiceLocale, slug: ServiceSlug): string {
  return "/" + locale + "/services/" + slug;
}

export function getServiceContactHref(locale: ServiceLocale, slug: ServiceSlug): string {
  return "/" + locale + "?service=" + slug + "#contact";
}
