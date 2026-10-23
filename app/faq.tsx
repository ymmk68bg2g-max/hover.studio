"use client";

import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UiArrow } from "./ui-arrow";

export type FaqLocale = "ua" | "en";

type FaqLink = {
  href: string;
  label: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  link?: FaqLink;
};

type FaqCopy = {
  eyebrow: string;
  title: string;
  items: FaqItem[];
};

const faqCopy: Record<FaqLocale, FaqCopy> = {
  ua: {
    eyebrow: "FAQ",
    title: "Поширені запитання",
    items: [
      {
        id: "scope",
        question: "Що входить у створення сайту?",
        answer:
          "Погоджений обсяг може охоплювати структуру, артдирекцію, адаптивний UX/UI, розробку, перевірку та запуск. CMS, інтеграції, motion і робота з контентом входять лише тоді, коли це зафіксовано в обсязі конкретного проєкту.",
      },
      {
        id: "cost",
        question: "Від чого залежить остаточна вартість?",
        answer:
          "На вартість впливають обсяг, кількість унікальних типів сторінок, мови, готовність матеріалів, CMS, інтеграції та складність motion. Регулярні платежі стороннім сервісам погоджуються окремо.",
      },
      {
        id: "timeline",
        question: "Скільки часу займає робота?",
        answer:
          "Строк підтверджуємо після визначення обсягу. Він залежить від складності сайту, готовності матеріалів і швидкості погоджень, тому єдиного строку для всіх форматів немає.",
      },
      {
        id: "materials",
        question: "Які матеріали потрібно підготувати?",
        answer:
          "На старті потрібні інформація про бізнес і цілі, наявні бренд-матеріали, тексти та зображення. Якщо частини матеріалів немає, допомогу з їх підготовкою можна окремо включити до погодженого обсягу.",
      },
      {
        id: "approvals",
        question: "Як проходять погодження, правки та оплата?",
        answer:
          "До початку роботи фіксуємо обсяг, етапи та очікуваний результат кожного з них. Графік оплат і формат ітерацій визначаємо індивідуально та погоджуємо до старту проєкту.",
      },
      {
        id: "updates",
        question: "Чи зможу я самостійно оновлювати сайт?",
        answer:
          "Якщо до реалізації входить CMS, ви зможете оновлювати погоджені типи контенту самостійно. Решта змін виконується в межах Website Care або як окреме завдання.",
      },
      {
        id: "handover",
        question: "Що я отримую після завершення проєкту?",
        answer:
          "Склад реалізації, файлів, доступів та інструкцій визначається погодженим обсягом проєкту. Сторонні шрифти, зображення, сервіси й інші ліцензійні матеріали залишаються предметом умов відповідних правовласників.",
      },
      {
        id: "support",
        question: "Яка підтримка доступна після запуску?",
        answer:
          "Website Care може охоплювати оновлення контенту, нові сторінки, швидкодію, подальшу розробку та підтримку аналітики. Усунення помилок і нові задачі розділяються, а точний обсяг погоджується окремо.",
        link: {
          href: "/ua/services/website-care",
          label: "Детальніше про підтримку сайту",
        },
      },
    ],
  },
  en: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      {
        id: "scope",
        question: "What is included in creating a website?",
        answer:
          "The agreed scope may cover structure, art direction, responsive UX/UI, development, testing and launch. CMS, integrations, motion and content work are included only when they are defined in the scope of the specific project.",
      },
      {
        id: "cost",
        question: "What determines the final cost?",
        answer:
          "Cost depends on scope, the number of unique page types, languages, material readiness, CMS, integrations and motion complexity. Recurring third-party service fees are agreed separately.",
      },
      {
        id: "timeline",
        question: "How long does the work take?",
        answer:
          "We confirm the timeline after defining the scope. It depends on the site's complexity, material readiness and approval pace, so there is no single duration for every service format.",
      },
      {
        id: "materials",
        question: "What materials should I prepare?",
        answer:
          "To begin, we need information about the business and its goals, plus any existing brand assets, copy and images. If something is missing, support with preparing it can be added to the agreed scope separately.",
      },
      {
        id: "approvals",
        question: "How do approvals, revisions and payment work?",
        answer:
          "Before work begins, we define the scope, stages and expected outcome of each stage. The payment schedule and revision process are agreed individually before the project starts.",
      },
      {
        id: "updates",
        question: "Will I be able to update the website myself?",
        answer:
          "If the implementation includes a CMS, you will be able to update the agreed content types yourself. Other changes can be handled through Website Care or as a separate task.",
      },
      {
        id: "handover",
        question: "What do I receive when the project is complete?",
        answer:
          "The implementation, files, access and instructions you receive depend on the agreed project scope. Third-party fonts, images, services and other licensed assets remain subject to their respective owners' terms.",
      },
      {
        id: "support",
        question: "What support is available after launch?",
        answer:
          "Website Care may cover content updates, new pages, performance, ongoing development and analytics support. Bug fixes and new work are treated separately, and the exact scope is agreed for each engagement.",
        link: {
          href: "/en/services/website-care",
          label: "View Website Care",
        },
      },
    ],
  },
};

export function Faq({ locale }: { locale: FaqLocale }) {
  const copy = faqCopy[locale];
  const headingId = `faq-heading-${locale}`;

  return (
    <section className="faq" aria-labelledby={headingId} data-scroll-region="faq">
      <header className="faq-header">
        <p className="faq-eyebrow">{copy.eyebrow}</p>
        <h2 className="faq-title section-heading home-display-heading" id={headingId}>
          {copy.title}
        </h2>
      </header>

      <Accordion className="faq-list" type="single" collapsible>
        {copy.items.map((item, index) => (
          <AccordionItem className="faq-item" key={item.id} value={item.id}>
            <AccordionTrigger className="faq-trigger" data-language-disclosure={`faq-${item.id}`}>
              <span className="faq-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="faq-question content-subheading">{item.question}</span>
            </AccordionTrigger>
            <AccordionContent className="faq-content">
              <p className="section-body">{item.answer}</p>
              {item.link ? (
                <Link className="faq-link" href={item.link.href}>
                  {item.link.label}{" "}<UiArrow />
                </Link>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export { faqCopy };
