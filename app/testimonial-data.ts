import type { PublishedTestimonial, TestimonialsLocale } from "./testimonials";

// Feedback supplied or approved for publication by the site owner.
export const publishedTestimonials: Record<TestimonialsLocale, PublishedTestimonial[]> = {
  ua: [
    {
      id: "oleksandr-kastronov",
      approval: "approved",
      avatarCrop: "portrait",
      avatarAlt: "Олександр Кастронов",
      avatarSrc: "/testimonials/oleksandr-kastronov.jpg",
      company: "SOLARFAMILY та SOLARCITY",
      name: "Олександр Кастронов",
      role: "Засновник",
      quote: "У роботі над сайтами SOLARFAMILY та SOLARCITY найбільше цінував гнучкість і швидкість комунікації. Усі зміни обговорювали по суті та оперативно втілювали, а обидва сайти запустили в погоджені строки. Зв’язок 24/7 допомагав швидко вирішувати питання й рухатися без зайвих пауз. Приємно працювати з людьми, які уважні до деталей, розуміють завдання бізнесу й беруть відповідальність за результат.",
    },
    {
      id: "ivan-tokmachov",
      approval: "approved",
      avatarCrop: "framed",
      avatarAlt: "Іван Токмачов",
      avatarSrc: "/testimonials/ivan-tokmachov.jpg",
      name: "Іван Токмачов",
      role: "Приватний підприємець",
      quote: "У нас кілька продуктів, і для кожного потрібна окрема сторінка. Не хотілося отримати ні однакові лендинги зі зміненими заголовками, ні зовсім різні сайти без спільного характеру.\n\nУ роботі з HOVER сподобався саме цей баланс: кожна сторінка побудована навколо конкретної пропозиції, але всі залишаються частиною одного бренду. А під час наступного запуску вже не потрібно заново пояснювати, хто ми і як хочемо виглядати.",
    },
  ],
  en: [
    {
      id: "oleksandr-kastronov",
      approval: "approved",
      avatarCrop: "portrait",
      avatarAlt: "Oleksandr Kastronov",
      avatarSrc: "/testimonials/oleksandr-kastronov.jpg",
      company: "SOLARFAMILY & SOLARCITY",
      name: "Oleksandr Kastronov",
      role: "Founder",
      quote: "What I valued most while working on the SOLARFAMILY and SOLARCITY websites was the flexibility and responsive communication. Changes were discussed clearly and implemented promptly, and both websites launched within the agreed timelines. Being able to reach the team 24/7 helped us resolve questions quickly and keep moving. It is a pleasure to work with people who care about the details, understand business needs and take responsibility for the result.",
    },
    {
      id: "ivan-tokmachov",
      approval: "approved",
      avatarCrop: "framed",
      avatarAlt: "Ivan Tokmachov",
      avatarSrc: "/testimonials/ivan-tokmachov.jpg",
      name: "Ivan Tokmachov",
      role: "Independent entrepreneur",
      quote: "We have several products, and each needs its own page. We didn’t want identical landing pages with different headlines, or completely different websites with no shared identity.\n\nWhat we liked about working with HOVER was precisely that balance: each page is built around a specific offer, while all of them remain part of the same brand. And when the next launch comes around, we no longer need to explain who we are and how we want to present ourselves.",
    },
  ],
};
