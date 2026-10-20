import { LocaleSync } from "./locale-sync";
import { SiteHeader } from "./site-chrome";
import { privacyPublicationStatus } from "./client-experience-config";
import { contactEmail } from "./contact-settings";

export type PrivacyLocale = "en" | "ua";

type PrivacyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

type PrivacySection = {
  id: string;
  title: string;
  blocks: PrivacyBlock[];
};

type PrivacyCopy = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: PrivacySection[];
};

const privacyCopy: Record<PrivacyLocale, PrivacyCopy> = {
  ua: {
    eyebrow: "ЮРИДИЧНА ІНФОРМАЦІЯ",
    title: "Політика конфіденційності",
    updated: "Актуалізовано 15 жовтня 2026 року.",
    intro:
      "Ця політика пояснює, як обробляються персональні дані, отримані через сайт HOVER та під час обговорення співпраці. Для передавання звернень із контактної форми налаштовано FormSubmit, а для робочої пошти використовується Google/Gmail. Точні країни обробки, місця зберігання, строки зберігання технічних журналів і резервних копій та умови міжнародної передачі ще перевіряються.",
    sections: [
      {
        id: "controller",
        title: "01 / Хто відповідає за обробку",
        blocks: [
          {
            type: "paragraph",
            text: "За обробку персональних даних, отриманих через сайт HOVER та під час обговорення співпраці, відповідає Полосенко Євгеній Володимирович — фізична особа, яка працює під брендом HOVER / HOVER.STUDIO. Основний обраний домен — byhover.studio.",
          },
          {
            type: "paragraph",
            text: `Одержувач заявок і контакт для запитів щодо персональних даних — ${contactEmail}.`,
          },
        ],
      },
      {
        id: "data",
        title: "02 / Які дані отримуються",
        blocks: [
          {
            type: "list",
            items: [
              "Через контактну форму: ім’я, адреса електронної пошти, назва компанії за бажанням, обраний тип проєкту, бюджетний діапазон, текст повідомлення та обрана мовна версія сайту.",
              "Форма не містить поля для номера телефону або завантаження файлів.",
              "Під час листування електронною поштою, у Telegram або Viber обробляються адреса чи ідентифікатор профілю, зміст і час повідомлень та інші відомості, які особа сама надсилає в обраному каналі.",
              "Під час відвідування сайту хостингова й захисна інфраструктура може обробляти технічні відомості, необхідні для передавання та захисту сторінок: зокрема IP-адресу, тип браузера, заголовки запиту, адресу запитаної сторінки, дату й час запиту.",
            ],
          },
        ],
      },
      {
        id: "purposes",
        title: "03 / Для чого використовуються дані",
        blocks: [
          {
            type: "list",
            items: [
              "Щоб відповісти на звернення, уточнити завдання, підготувати пропозицію та обговорити співпрацю.",
              "Щоб вести погоджений проєкт.",
              "Щоб забезпечити роботу й захист контактної форми та запобігати зловживанням.",
              "Щоб виконати конкретний юридичний обов’язок, якщо він виникає.",
            ],
          },
          {
            type: "paragraph",
            text: "Контакти, отримані через звернення, не використовуються для рекламних розсилок або підписки на новини.",
          },
        ],
      },
      {
        id: "legal-bases",
        title: "04 / Правові підстави",
        blocks: [
          {
            type: "paragraph",
            text: "Для відповіді на звернення, уточнення завдання та підготовки пропозиції обробка може бути необхідною для вжиття заходів до укладення правочину на запит особи. Після погодження співпраці дані обробляються настільки, наскільки це потрібно для ведення проєкту.",
          },
          {
            type: "paragraph",
            text: "Для інших ділових звернень або захисту технічної роботи сайту, якщо відповідна обробка фактично здійснюється, підставою може бути законний інтерес за умови, що права та свободи особи не переважають цей інтерес. Дані, які потрібно зберігати за законом, обробляються для виконання відповідного юридичного обов’язку. Конкретна підстава визначається відповідно до мети та законодавства, що застосовується до ситуації; подання форми саме по собі не описується як згода на будь-яку обробку.",
          },
        ],
      },
      {
        id: "participants",
        title: "05 / Хто бере участь в обробці",
        blocks: [
          {
            type: "paragraph",
            text: "Зміст звернень особисто розглядає Полосенко Євгеній Володимирович. Інші співробітники до їх розгляду не залучені.",
          },
          {
            type: "paragraph",
            text: "Цей сайт розміщено на Vercel. FormSubmit бере участь у передаванні звернень із контактної форми, Google/Gmail — у роботі пошти, а Telegram або Viber — у листуванні, коли обрано відповідний канал.",
          },
          {
            type: "paragraph",
            text: `Після серверної перевірки браузер передає дані контактної форми FormSubmit через HTTPS для пересилання на робочу адресу ${contactEmail}.`,
          },
          {
            type: "paragraph",
            text: "FormSubmit обробляє дані звернення для його передавання, а Google/Gmail — для отримання листа та подальшого листування щодо звернення. Точні місця зберігання й строки зберігання технічних журналів та резервних копій у фактичній конфігурації цих сервісів ще не підтверджені.",
          },
        ],
      },
      {
        id: "retention",
        title: "06 / Строки зберігання та видалення",
        blocks: [
          {
            type: "paragraph",
            text: "Листування за зверненнями, які не призвели до замовлення, власник видаляє зі своїх робочих каналів через 14 днів після останнього повідомлення, якщо погоджене обговорення проєкту вже не триває.",
          },
          {
            type: "paragraph",
            text: "За документацією FormSubmit, сервіс зберігає подані через форму звернення протягом 30 днів. Це окремий строк зберігання у FormSubmit; видалення листування власником зі своїх робочих каналів через 14 днів не скорочує його.",
          },
          {
            type: "list",
            items: [
              "Правило 14 днів не поширюється автоматично на листування за чинними проєктами, договори, розрахункові документи або дані, для яких існує окрема обґрунтована потреба чи законодавча вимога зберігання.",
              "Такі дані зберігаються протягом проєкту й після його завершення лише доки це обґрунтовано потрібно для виконання зобов’язань, вирішення питань, захисту законних прав або дотримання вимог закону. Конкретні строки не встановлюються без підтвердженої підстави.",
              "Власник видаляє контрольовані ним копії з робочої пошти та зі свого боку листування у Telegram або Viber. Це не означає одночасного видалення резервних копій, технічних журналів постачальників або копій, які залишилися у співрозмовника. Для них діють правила відповідного сервісу.",
            ],
          },
        ],
      },
      {
        id: "transfers",
        title: "07 / Міжнародна передача",
        blocks: [
          {
            type: "paragraph",
            text: "HOVER працює з клієнтами в Україні та інших країнах. Технічні постачальники й сервіси листування можуть обробляти дані за межами України. Місця обробки залежать від фактичної конфігурації відповідних постачальників.",
          },
          {
            type: "paragraph",
            text: "Точні країни обробки та застосовні механізми захисту ще не підтверджені для FormSubmit, Google/Gmail та фактичної конфігурації хостингу. Якщо до конкретної передачі застосовуються вимоги законодавства про захист даних, вона має здійснюватися на передбаченій ним підставі та із відповідними гарантіями.",
          },
        ],
      },
      {
        id: "technical-data",
        title: "08 / Cookies і технічні дані",
        blocks: [
          {
            type: "list",
            items: [
              "Сайт зберігає вибір мови в cookie hover_locale строком до одного року та в localStorage браузера. Запис у localStorage зберігається, доки його не буде замінено або видалено у браузері.",
              "Позиція прокручування для конкретної адреси тимчасово зберігається в sessionStorage, щоб відновити її після оновлення сторінки.",
              "Шрифти завантажуються з Google Fonts, тому браузер надсилає цьому сервісу окремий технічний запит.",
              "У перевіреному коді не виявлено Google Analytics, рекламних пікселів, маркетингових трекерів або сторонніх вбудованих матеріалів. Google Search Console не є Google Analytics; її можлива конфігурація поза кодом не означає, що їй передається зміст заявок.",
              "Хостингова або захисна платформа може встановлювати суворо необхідні cookies, якщо відповідні функції захисту ввімкнені. Фактичну конфігурацію та строки зберігання таких cookies ще потрібно перевірити.",
            ],
          },
        ],
      },
      {
        id: "rights",
        title: "09 / Права, порядок звернення та контакт",
        blocks: [
          {
            type: "paragraph",
            text: "Залежно від застосовного законодавства особа може отримати інформацію про джерело, місцезнаходження, мету обробки та одержувачів своїх даних; запитати доступ; вимагати виправлення недостовірних даних або видалення даних, які обробляються незаконно; подати мотивоване заперечення; а також скористатися іншими правами, зокрема на обмеження обробки чи перенесення даних, якщо відповідне законодавство та умови передбачають такі права. Якщо конкретна обробка ґрунтується на згоді, згоду можна відкликати без впливу на законність попередньої обробки.",
          },
          {
            type: "paragraph",
            text: `Щоб подати запит, напишіть на ${contactEmail}, зазначте, якого звернення або листування він стосується, та опишіть свою вимогу. За потреби можуть бути запитані додаткові відомості, необхідні для перевірки особи та пошуку відповідних даних. Запит розглядається у строк, установлений застосовним законодавством.`,
          },
          {
            type: "paragraph",
            text: "Особа також може звернутися зі скаргою до Уповноваженого Верховної Ради України з прав людини або до суду, а якщо до ситуації застосовується інше законодавство — до відповідного компетентного органу із захисту даних.",
          },
        ],
      },
    ],
  },
  en: {
    eyebrow: "LEGAL INFORMATION",
    title: "Privacy Policy",
    updated: "Last updated: 15 October 2026.",
    intro:
      "This policy explains how personal data received through the HOVER website and during project discussions is processed. FormSubmit is configured to forward contact-form enquiries, and Google/Gmail is used for working email. Exact processing countries, storage locations, retention of technical logs and backups, and the conditions of any international transfers are still being verified.",
    sections: [
      {
        id: "controller",
        title: "01 / Who is responsible",
        blocks: [
          {
            type: "paragraph",
            text: "Personal data received through the HOVER website and during project discussions is controlled by Полосенко Євгеній Володимирович, a natural person operating under the HOVER / HOVER.STUDIO brand. The primary selected domain is byhover.studio.",
          },
          {
            type: "paragraph",
            text: `The recipient of enquiries and the contact for personal-data requests is ${contactEmail}.`,
          },
        ],
      },
      {
        id: "data",
        title: "02 / Data received",
        blocks: [
          {
            type: "list",
            items: [
              "Through the contact form: name, email address, optional company name, selected project type, selected budget range, message, and selected website language.",
              "The form does not include a telephone-number field or file uploads.",
              "When a conversation continues by email, Telegram, or Viber, the address or profile identifier, message content and time, and other information voluntarily sent through that channel are processed.",
              "When the website is visited, hosting and security infrastructure may process technical information needed to deliver and protect the pages, including the IP address, browser type, request headers, requested page, and request date and time.",
            ],
          },
        ],
      },
      {
        id: "purposes",
        title: "03 / Purposes",
        blocks: [
          {
            type: "list",
            items: [
              "Replying to an enquiry, clarifying the requested work, preparing a proposal, and discussing possible cooperation.",
              "Managing an agreed project.",
              "Operating and protecting the contact form and preventing misuse.",
              "Complying with a specific legal obligation where one arises.",
            ],
          },
          {
            type: "paragraph",
            text: "Contact details received through enquiries are not used for advertising mailings or newsletter subscriptions.",
          },
        ],
      },
      {
        id: "legal-bases",
        title: "04 / Legal bases",
        blocks: [
          {
            type: "paragraph",
            text: "Where applicable, processing used to respond to an enquiry, clarify the requested work, and prepare a proposal may be necessary to take steps at the person’s request before entering into a contract. Once a project is agreed, data is processed as necessary to manage that project.",
          },
          {
            type: "paragraph",
            text: "Other business enquiries and technical website-security processing, where actually carried out, may rely on legitimate interests, subject to balancing those interests against the person’s rights and freedoms. Records required by law are processed to comply with the relevant legal obligation. The particular basis depends on the purpose and the law applicable to the situation; submitting the form is not by itself described as consent to all processing.",
          },
        ],
      },
      {
        id: "participants",
        title: "05 / Participants in processing",
        blocks: [
          {
            type: "paragraph",
            text: "Enquiry content is reviewed personally by Полосенко Євгеній Володимирович. No other staff members are involved in reviewing it.",
          },
          {
            type: "paragraph",
            text: "This website is hosted on Vercel. FormSubmit participates in forwarding contact-form enquiries, Google/Gmail operates the working email service, and Telegram or Viber processes communications when those channels are used.",
          },
          {
            type: "paragraph",
            text: `After server validation, the browser sends contact-form data to FormSubmit over HTTPS for forwarding to the working address ${contactEmail}.`,
          },
          {
            type: "paragraph",
            text: "FormSubmit processes enquiry data to forward it, while Google/Gmail processes it to receive the email and support subsequent correspondence about the enquiry. Exact storage locations and retention periods for technical logs and backups in the actual configuration of these services have not yet been confirmed.",
          },
        ],
      },
      {
        id: "retention",
        title: "06 / Retention and deletion",
        blocks: [
          {
            type: "paragraph",
            text: "Correspondence concerning enquiries that do not result in an order is deleted by the owner from the work channels under his control 14 days after the last message, unless an agreed project discussion is still ongoing.",
          },
          {
            type: "paragraph",
            text: "According to FormSubmit’s documentation, the service retains form submissions for 30 days. This is a separate retention period at FormSubmit; the owner deleting correspondence from his working channels after 14 days does not shorten it.",
          },
          {
            type: "list",
            items: [
              "The 14-day rule does not automatically apply to correspondence for active projects, contracts, payment records, or data retained for a separate justified need or legal requirement.",
              "Those categories are kept during the project and afterwards only for as long as reasonably needed to meet obligations, resolve issues, protect legal rights, or comply with law. No specific period is stated without a confirmed basis.",
              "The owner deletes copies under his control from the working mailbox and his side of Telegram or Viber conversations. This does not mean that provider backups or technical logs, or copies held by the other participant, disappear at the same time. Those copies are governed by the relevant service’s rules.",
            ],
          },
        ],
      },
      {
        id: "transfers",
        title: "07 / International transfers",
        blocks: [
          {
            type: "paragraph",
            text: "HOVER works with clients in Ukraine and other countries. Technical providers and messaging services may process data outside Ukraine. Processing locations depend on the actual configuration of the relevant providers.",
          },
          {
            type: "paragraph",
            text: "The exact processing countries and applicable safeguards have not yet been confirmed for FormSubmit, Google/Gmail, and the actual hosting configuration. Where data-protection law imposes requirements on a particular transfer, it must be made on a basis and with safeguards provided by that law.",
          },
        ],
      },
      {
        id: "technical-data",
        title: "08 / Cookies and technical data",
        blocks: [
          {
            type: "list",
            items: [
              "The website stores the language choice in the hover_locale cookie for up to one year and in the browser’s localStorage. The localStorage entry remains until it is replaced or cleared in the browser.",
              "The scroll position for a specific address is stored temporarily in sessionStorage so it can be restored after a page reload.",
              "Fonts are loaded from Google Fonts, which causes the browser to make a separate technical request to that service.",
              "No Google Analytics, advertising pixels, marketing trackers, or third-party embeds were found in the inspected code. Google Search Console is not Google Analytics; possible configuration outside the source code does not mean that enquiry content is sent to it.",
              "The hosting or security platform may set strictly necessary cookies if the relevant protection features are enabled. The actual configuration and retention of any such cookies still need to be verified.",
            ],
          },
        ],
      },
      {
        id: "rights",
        title: "09 / Rights, request procedure, and contact",
        blocks: [
          {
            type: "paragraph",
            text: "Depending on applicable law, a person may obtain information about the source, location, purpose, and recipients of their data; request access; seek correction of inaccurate data or deletion of data processed unlawfully; make a reasoned objection; and exercise other rights, including restriction or portability, where the relevant law and conditions provide them. Where specific processing relies on consent, consent may be withdrawn without affecting the lawfulness of prior processing.",
          },
          {
            type: "paragraph",
            text: `To make a request, email ${contactEmail}, identify the enquiry or correspondence concerned, and describe the request. Additional information reasonably necessary to verify the requester and locate the relevant data may be requested. The request will be handled within the period required by applicable law.`,
          },
          {
            type: "paragraph",
            text: "A complaint may also be made to the Ukrainian Parliament Commissioner for Human Rights or a court, or, where another law applies, to the relevant competent data-protection authority.",
          },
        ],
      },
    ],
  },
};

export function PrivacyPage({ locale }: { locale: PrivacyLocale }) {
  const t = privacyCopy[locale];
  const otherLocale: PrivacyLocale = locale === "ua" ? "en" : "ua";

  return (
    <div className="privacy-page" data-document-status={privacyPublicationStatus} lang={locale === "ua" ? "uk" : "en"}>
      <LocaleSync locale={locale} />
      <SiteHeader locale={locale} pageKind="default" languageHref={`/${otherLocale}/privacy`} />

      <main id="main">
        <article className="privacy-page__document" id="top">
          <div className="privacy-page__intro" data-scroll-region="privacy-intro">
            <p className="privacy-page__eyebrow">{t.eyebrow}</p>
            <h1 className="content-heading">{t.title}</h1>
            <p className="privacy-page__updated">{t.updated}</p>
            <p className="privacy-page__lead content-lead">{t.intro}</p>
          </div>

          {t.sections.map((section) => {
            const headingId = `privacy-${section.id}`;

            return (
              <section className="privacy-page__section" aria-labelledby={headingId} key={section.id} data-scroll-region={`privacy-${section.id}`}>
                <h2 className="content-subheading" id={headingId}>{section.title}</h2>
                {section.blocks.map((block, blockIndex) =>
                  block.type === "paragraph" ? (
                    <p className="content-body" key={`${section.id}-paragraph-${blockIndex}`}>{block.text}</p>
                  ) : (
                    <ul key={`${section.id}-list-${blockIndex}`}>
                      {block.items.map((item) => (
                        <li className="content-body" key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            );
          })}
        </article>
      </main>

    </div>
  );
}
