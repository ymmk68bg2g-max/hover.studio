export type ClientLocale = "ua" | "en";

export type ClientLogo = {
  id: string;
  name: string;
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoCrop?: { x: number; y: number; width: number; height: number };
  logoBackground?: string;
  wordmark?: readonly { text: string; color?: string }[];
  caseHref?: string;
};

export type ClientTestimonial = {
  id: string;
  status: "published" | "draft";
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatarSrc?: string;
  avatarCrop?: "portrait" | "framed";
  relatedClientIds: readonly string[];
  caseLinks?: readonly { href: string; label: string }[];
  isTranslation?: boolean;
};

type ClientsContent = {
  clients: readonly ClientLogo[];
  testimonials: readonly ClientTestimonial[];
};

// Oleksandr Kastronov's existing quote, attribution and portrait were explicitly
// confirmed by the owner on 25 October 2026. EN preserves the supplied translation.
// Only publication-approved records belong here. Unconfirmed material stays in
// docs/clients-unpublished.md, outside the page's client dependency graph.
const publishedContent: Record<ClientLocale, ClientsContent> = {
  "ua": {
    "clients": [
      {
        "id": "solarfamily",
        "name": "SOLARFAMILY",
        "logoSrc": "/clients/solarfamily-logo.webp",
        "logoWidth": 356,
        "logoHeight": 91,
        "logoBackground": "#171a18",
        "caseHref": "/ua/work/solarfamily"
      },
      {
        "id": "solarcity",
        "name": "SOLARCITY",
        "logoBackground": "#061120",
        "wordmark": [{ "text": "SOLAR", "color": "#f3f6f8" }, { "text": "CITY", "color": "#35d6e4" }],
        "caseHref": "/ua/work/solarcity"
      },
      {
        "id": "yamamoto-dental-group",
        "name": "Yamamoto Dental Group",
        "logoSrc": "/clients/yamamoto-dental-group.png",
        "logoWidth": 1200,
        "logoHeight": 800,
        "logoCrop": { "x": 101, "y": 355, "width": 997, "height": 90 }
      }
    ],
    "testimonials": [
      {
        "id": "oleksandr-kastronov",
        "status": "published",
        "quote": "У роботі над сайтами SOLARFAMILY та SOLARCITY найбільше цінував гнучкість і швидкість комунікації. Усі зміни обговорювали по суті та оперативно втілювали, а обидва сайти запустили в погоджені строки. Зв’язок 24/7 допомагав швидко вирішувати питання й рухатися без зайвих пауз. Приємно працювати з людьми, які уважні до деталей, розуміють завдання бізнесу й беруть відповідальність за результат.",
        "name": "Олександр Кастронов",
        "role": "Засновник",
        "company": "SOLARFAMILY та SOLARCITY",
        "avatarSrc": "/testimonials/oleksandr-kastronov.jpg",
        "avatarCrop": "portrait",
        "relatedClientIds": [
          "solarfamily",
          "solarcity"
        ],
        "caseLinks": [
          {
            "href": "/ua/work/solarcity",
            "label": "Кейс SOLARCITY"
          },
          {
            "href": "/ua/work/solarfamily",
            "label": "Кейс SOLARFAMILY"
          }
        ]
      }
    ]
  },
  "en": {
    "clients": [
      {
        "id": "solarfamily",
        "name": "SOLARFAMILY",
        "logoSrc": "/clients/solarfamily-logo.webp",
        "logoWidth": 356,
        "logoHeight": 91,
        "logoBackground": "#171a18",
        "caseHref": "/en/work/solarfamily"
      },
      {
        "id": "solarcity",
        "name": "SOLARCITY",
        "logoBackground": "#061120",
        "wordmark": [{ "text": "SOLAR", "color": "#f3f6f8" }, { "text": "CITY", "color": "#35d6e4" }],
        "caseHref": "/en/work/solarcity"
      },
      {
        "id": "yamamoto-dental-group",
        "name": "Yamamoto Dental Group",
        "logoSrc": "/clients/yamamoto-dental-group.png",
        "logoWidth": 1200,
        "logoHeight": 800,
        "logoCrop": { "x": 101, "y": 355, "width": 997, "height": 90 }
      }
    ],
    "testimonials": [
      {
        "id": "oleksandr-kastronov",
        "status": "published",
        "quote": "What I valued most while working on the SOLARFAMILY and SOLARCITY websites was the flexibility and responsive communication. Changes were discussed clearly and implemented promptly, and both websites launched within the agreed timelines. Being able to reach the team 24/7 helped us resolve questions quickly and keep moving. It is a pleasure to work with people who care about the details, understand business needs and take responsibility for the result.",
        "name": "Oleksandr Kastronov",
        "role": "Founder",
        "company": "SOLARFAMILY & SOLARCITY",
        "avatarSrc": "/testimonials/oleksandr-kastronov.jpg",
        "avatarCrop": "portrait",
        "relatedClientIds": [
          "solarfamily",
          "solarcity"
        ],
        "caseLinks": [
          {
            "href": "/en/work/solarcity",
            "label": "SOLARCITY case"
          },
          {
            "href": "/en/work/solarfamily",
            "label": "SOLARFAMILY case"
          }
        ],
        "isTranslation": true
      }
    ]
  }
};

export function getClientsContent(locale: ClientLocale): ClientsContent {
  return publishedContent[locale];
}
