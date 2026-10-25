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
    updated: "Актуалізовано 25 жовтня 2026 року.",
    intro:
      "Ця політика пояснює, як обробляються персональні дані, отримані через сайт HOVER та під час обговорення співпраці. Для передавання звернень із контактної форми використовується серверна доставка через Resend, для захисту від автоматичних відправлень — Cloudflare Turnstile, а для робочої пошти — Google/Gmail. На всіх мовних версіях сайту встановлено Google tag для Google Ads з ідентифікатором AW-18530491505 і Meta Pixel з ідентифікатором 1118365304509487 для вимірювання ефективності реклами. Meta Pixel передає подію перегляду сторінки PageView для реклами у Facebook та Instagram. Точні країни обробки, місця зберігання, строки зберігання технічних журналів і резервних копій та умови міжнародної передачі ще перевіряються.",
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
              "Cloudflare Turnstile обробляє технічні відомості про браузер і пристрій та результат перевірки для захисту контактної форми від автоматичних відправлень. Сервер перевіряє одноразовий токен перед доставкою звернення.",
              "Під час завантаження будь-якої мовної версії сайту Google tag може передавати Google URL відвіданої сторінки, IP-адресу, відомості про браузер, пристрій і час запиту, а також ідентифікатори cookies та переходів із реклами. Конкретний склад даних залежить від налаштувань Google, браузера та взаємодії з рекламою.",
              "Meta Pixel передає Meta подію PageView і технічні відомості про відвідування, які можуть включати URL сторінки, IP-адресу, відомості про браузер і пристрій, час події, ідентифікатори cookies та переходів із реклами. У коді сайту не налаштовано окреме передавання полів контактної форми як параметрів зіставлення Meta Pixel; конкретний склад даних також залежить від налаштувань Meta та браузера.",
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
              "Щоб оцінювати ефективність реклами та пов’язувати відвідування сайту в усіх мовних версіях з рекламними переходами за допомогою Google Ads.",
              "Щоб вимірювати перегляди сторінок в усіх мовних версіях та ефективність реклами у Facebook та Instagram за допомогою Meta Pixel.",
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
            text: "Зміст звернень поза Telegram-ботом особисто розглядає Полосенко Євгеній Володимирович. Інші співробітники до їх розгляду не залучені. Порядок роботи операторів Telegram-бота описано в розділі 10.",
          },
          {
            type: "paragraph",
            text: "Цей сайт розміщено на Vercel. Resend бере участь у серверній доставці звернень із контактної форми, Cloudflare Turnstile — у перевірці браузера для захисту форми, Google/Gmail — у роботі пошти, а Telegram або Viber — у листуванні, коли обрано відповідний канал.",
          },
          {
            type: "paragraph",
            text: "Google також отримує технічні дані через Google tag для Google Ads в усіх мовних версіях сайту. Як Google використовує дані сайтів-партнерів, описано на https://policies.google.com/technologies/partner-sites?hl=uk.",
          },
          {
            type: "paragraph",
            text: "Meta отримує дані про перегляди сторінок через Meta Pixel в усіх мовних версіях сайту. Відомості про обробку даних Meta та доступні налаштування наведено в політиці конфіденційності: https://www.facebook.com/privacy/policy/.",
          },
          {
            type: "paragraph",
            text: `Після серверної перевірки даних і токена Cloudflare Turnstile сервер Vercel передає дані контактної форми Resend через HTTPS для доставки на робочу адресу ${contactEmail}.`,
          },
          {
            type: "paragraph",
            text: "Resend обробляє дані звернення для доставки листа, а Google/Gmail — для отримання листа та подальшого листування щодо звернення. До Cloudflare Turnstile не передаються ім’я, email, назва компанії чи текст повідомлення з форми; сервіс обробляє технічні сигнали браузера для перевірки. Точні місця зберігання й строки зберігання технічних журналів та резервних копій у фактичній конфігурації цих сервісів ще не підтверджені.",
          },
        ],
      },
      {
        id: "retention",
        title: "06 / Строки зберігання та видалення",
        blocks: [
          {
            type: "paragraph",
            text: "Листування поза Telegram-ботом за зверненнями, які не призвели до замовлення, власник видаляє зі своїх робочих каналів через 14 днів після останнього повідомлення, якщо погоджене обговорення проєкту вже не триває. Для Telegram-бота діє окремий строк від створення діалогу, описаний у розділі 10.",
          },
          {
            type: "paragraph",
            text: "Строки зберігання копій листів і службових даних у Resend визначаються умовами сервісу та фактичними налаштуваннями облікового запису. Видалення листування власником зі своїх робочих каналів через 14 днів не скорочує окремі строки зберігання постачальників.",
          },
          {
            type: "paragraph",
            text: "Зберігання даних Google залежить від їх виду, мети обробки та налаштувань сервісів і користувача. Точні строки зберігання даних Google Ads і рекламних cookies для фактичної конфігурації сайту ще не підтверджені. Правило 14 днів для листування на них не поширюється.",
          },
          {
            type: "paragraph",
            text: "Строки зберігання даних Meta Pixel і пов’язаних cookies залежать від умов Meta та фактичних налаштувань сервісу й браузера. Точні строки для конфігурації сайту ще не підтверджені; правило 14 днів для листування на них не поширюється.",
          },
          {
            type: "list",
            items: [
              "Це правило 14 днів після останнього повідомлення не поширюється автоматично на листування за чинними проєктами, договори, розрахункові документи або дані, для яких існує окрема обґрунтована потреба чи законодавча вимога зберігання.",
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
            text: "HOVER працює з клієнтами в Україні та інших країнах. Технічні постачальники й сервіси листування можуть обробляти дані за межами України. Місця обробки залежать від фактичної конфігурації відповідних постачальників. Google повідомляє про використання серверів у різних країнах; дані Google Ads також можуть оброблятися за межами України.",
          },
          {
            type: "paragraph",
            text: "Точні країни обробки та застосовні механізми захисту ще не підтверджені для Resend, Cloudflare Turnstile, Google/Gmail, Google Ads, Meta Pixel та фактичної конфігурації хостингу. Дані Meta Pixel також можуть оброблятися за межами України. Якщо до конкретної передачі застосовуються вимоги законодавства про захист даних, вона має здійснюватися на передбаченій ним підставі та із відповідними гарантіями.",
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
              "На всіх мовних версіях сайту встановлено Google tag для Google Ads з ідентифікатором AW-18530491505. Він завантажується під час відкриття сторінок сайту будь-якою мовою і може встановлювати або зчитувати рекламні та вимірювальні cookies, зокрема для пов’язування відвідування з переходом із реклами.",
              "Google може використовувати отримані від сайтів дані для вимірювання ефективності реклами та, залежно від налаштувань, її персоналізації. Керувати cookies можна в налаштуваннях браузера, а параметрами персоналізації реклами — у налаштуваннях Google.",
              "Meta Pixel з ідентифікатором 1118365304509487 завантажується на всіх сторінках UA та EN і передає подію PageView. Він може встановлювати або зчитувати рекламні та вимірювальні cookies. Коли JavaScript вимкнено, запит зображення noscript також передає Meta подію PageView. Керувати cookies можна в налаштуваннях браузера, а рекламними вподобаннями — у налаштуваннях Meta.",
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
      {
        id: "telegram-bot",
        title: "10 / Telegram-бот @hoverstudiobot",
        blocks: [
          {
            type: "paragraph",
            text: "Користування Telegram-ботом @hoverstudiobot є добровільним. Бот використовується, щоб відповісти на звернення, уточнити завдання та обговорити проєкт.",
          },
          {
            type: "paragraph",
            text: "Під час звернення через бота обробляються Telegram ID, доступні відомості профілю, зокрема ім’я та ім’я користувача, зміст повідомлень і надіслані вкладення, обрана мова й послуга, а також необхідні технічні дані: ідентифікатори діалогу, чату та повідомлень, час і статус обробки. Бот не вимагає номера телефону.",
          },
          {
            type: "paragraph",
            text: "Повідомлення та вкладення передаються до закритої операторської групи HOVER.STUDIO, де їх розглядають уповноважені оператори та надсилають відповіді через бота. Вкладення окремо не завантажуються до власного файлового сховища студії.",
          },
          {
            type: "paragraph",
            text: "У роботі бота беруть участь Telegram для обміну повідомленнями, Vercel для виконання бота та Neon для його робочої бази даних. Ці постачальники також обробляють дані відповідно до власних умов і політик.",
          },
          {
            type: "paragraph",
            text: "Для записів діалогу в робочій базі бота та його копії в закритій операторській групі встановлено строк зберігання 14 днів від створення діалогу. Нові повідомлення не подовжують цей строк. Налаштовано автоматичне видалення цих записів і теми діалогу в групі; у разі недоступності сервісів видалення може затриматися та потребувати перевірки оператора. Це окреме правило, яке не відраховується від останнього повідомлення.",
          },
          {
            type: "paragraph",
            text: `Для дострокового видалення скористайтеся командою /delete у боті та підтвердьте запит або напишіть на ${contactEmail}. Видалення з робочих систем бота не гарантує видалення історії у вашому особистому Telegram, незалежних копій у Telegram, резервних копій або інших копій, які перебувають поза контролем HOVER.STUDIO.`,
          },
        ],
      },
    ],
  },
  en: {
    eyebrow: "LEGAL INFORMATION",
    title: "Privacy Policy",
    updated: "Last updated: 25 October 2026.",
    intro:
      "This policy explains how personal data received through the HOVER website and during project discussions is processed. Contact-form enquiries are delivered by the server through Resend, Cloudflare Turnstile protects against automated submissions, and Google/Gmail is used for working email. The Google tag for Google Ads, with the identifier AW-18530491505, and Meta Pixel, with the identifier 1118365304509487, are installed across all language versions of the website to measure advertising effectiveness. Meta Pixel sends the PageView page-view event for Facebook and Instagram advertising. Exact processing countries, storage locations, retention of technical logs and backups, and the conditions of any international transfers are still being verified.",
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
              "Cloudflare Turnstile processes technical browser and device information and verification results to protect the contact form against automated submissions. The server validates a single-use token before delivering the enquiry.",
              "When any language version of the website loads, the Google tag may send Google the URL of the page visited, IP address, browser and device information, request time, and cookie and advertising-click identifiers. The exact data depends on Google settings, the browser, and interaction with advertising.",
              "Meta Pixel sends Meta a PageView event and technical visit information, which may include the page URL, IP address, browser and device information, event time, and cookie and advertising-click identifiers. The website code does not configure explicit sharing of contact-form fields as Meta Pixel matching parameters; the exact data also depends on Meta and browser settings.",
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
              "Measuring advertising effectiveness and associating visits to all language versions of the website with advertising clicks through Google Ads.",
              "Measuring page views across all language versions and the effectiveness of Facebook and Instagram advertising through Meta Pixel.",
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
            text: "Enquiry content outside the Telegram bot is reviewed personally by Полосенко Євгеній Володимирович. No other staff members are involved in reviewing it. The Telegram bot’s operator workflow is described in section 10.",
          },
          {
            type: "paragraph",
            text: "This website is hosted on Vercel. Resend delivers contact-form enquiries from the server, Cloudflare Turnstile checks browsers to protect the form, Google/Gmail operates the working email service, and Telegram or Viber processes communications when those channels are used.",
          },
          {
            type: "paragraph",
            text: "Google also receives technical data through the Google tag for Google Ads across all language versions of the website. How Google uses data from partner websites is described at https://policies.google.com/technologies/partner-sites?hl=en.",
          },
          {
            type: "paragraph",
            text: "Meta receives page-view data through Meta Pixel across all language versions of the website. Information about Meta’s data processing and available settings is provided in its privacy policy: https://www.facebook.com/privacy/policy/.",
          },
          {
            type: "paragraph",
            text: `After validating the form data and Cloudflare Turnstile token, the Vercel server sends contact-form data to Resend over HTTPS for delivery to the working address ${contactEmail}.`,
          },
          {
            type: "paragraph",
            text: "Resend processes enquiry data to deliver the email, while Google/Gmail processes it to receive the email and support subsequent correspondence about the enquiry. The form’s name, email, company and message fields are not sent to Cloudflare Turnstile; it processes technical browser signals for verification. Exact storage locations and retention periods for technical logs and backups in the actual configuration of these services have not yet been confirmed.",
          },
        ],
      },
      {
        id: "retention",
        title: "06 / Retention and deletion",
        blocks: [
          {
            type: "paragraph",
            text: "Correspondence outside the Telegram bot concerning enquiries that do not result in an order is deleted by the owner from the work channels under his control 14 days after the last message, unless an agreed project discussion is still ongoing. The Telegram bot has a separate period measured from the creation of the conversation, as described in section 10.",
          },
          {
            type: "paragraph",
            text: "Retention of email copies and service data at Resend is governed by its terms and the account’s actual settings. The owner deleting correspondence from his working channels after 14 days does not shorten providers’ separate retention periods.",
          },
          {
            type: "paragraph",
            text: "Google data retention depends on the type of data, the processing purpose, and the settings of its services and the user. Exact retention periods for Google Ads data and advertising cookies in the website’s actual configuration have not yet been confirmed. The 14-day rule for correspondence does not apply to them.",
          },
          {
            type: "paragraph",
            text: "Retention of Meta Pixel data and related cookies depends on Meta’s terms and the actual service and browser settings. Exact periods for the website’s configuration have not yet been confirmed; the 14-day rule for correspondence does not apply to them.",
          },
          {
            type: "list",
            items: [
              "This 14-day rule measured from the last message does not automatically apply to correspondence for active projects, contracts, payment records, or data retained for a separate justified need or legal requirement.",
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
            text: "HOVER works with clients in Ukraine and other countries. Technical providers and messaging services may process data outside Ukraine. Processing locations depend on the actual configuration of the relevant providers. Google states that it uses servers in various countries; Google Ads data may also be processed outside Ukraine.",
          },
          {
            type: "paragraph",
            text: "The exact processing countries and applicable safeguards have not yet been confirmed for Resend, Cloudflare Turnstile, Google/Gmail, Google Ads, Meta Pixel, and the actual hosting configuration. Meta Pixel data may also be processed outside Ukraine. Where data-protection law imposes requirements on a particular transfer, it must be made on a basis and with safeguards provided by that law.",
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
              "The Google tag for Google Ads, with the identifier AW-18530491505, is installed across all language versions of the website. It loads when pages are opened in any language and may set or read advertising and measurement cookies, including to associate visits with advertising clicks.",
              "Google may use data received from websites to measure advertising effectiveness and, depending on settings, to personalise advertising. Cookies can be managed in browser settings, and advertising-personalisation preferences can be managed in Google settings.",
              "Meta Pixel, with the identifier 1118365304509487, loads on all UA and EN pages and sends the PageView event. It may set or read advertising and measurement cookies. When JavaScript is disabled, a noscript image request also sends Meta a PageView event. Cookies can be managed in browser settings, and advertising preferences can be managed in Meta settings.",
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
      {
        id: "telegram-bot",
        title: "10 / Telegram bot @hoverstudiobot",
        blocks: [
          {
            type: "paragraph",
            text: "Using the Telegram bot @hoverstudiobot is voluntary. The bot is used to reply to enquiries, clarify the requested work, and discuss a project.",
          },
          {
            type: "paragraph",
            text: "When you contact the bot, it processes your Telegram ID, available profile information such as your name and username, message content and attachments you send, selected language and service, and necessary technical data: conversation, chat, and message identifiers, timestamps, and processing status. The bot does not require a telephone number.",
          },
          {
            type: "paragraph",
            text: "Messages and attachments are relayed to a private HOVER.STUDIO operator group, where authorised operators review them and reply through the bot. Attachments are not separately downloaded to the studio’s own file storage.",
          },
          {
            type: "paragraph",
            text: "The bot uses Telegram for messaging, Vercel to run the bot, and Neon for its working database. These providers also process data under their own terms and policies.",
          },
          {
            type: "paragraph",
            text: "Conversation records in the bot’s working database and the copy in the private operator group have a retention period of 14 days from the creation of the conversation. New messages do not extend this period. Automatic deletion of those records and the group conversation topic is configured; if services are unavailable, deletion may be delayed and require operator review. This is a separate rule that is not measured from the last message.",
          },
          {
            type: "paragraph",
            text: `To request early deletion, use /delete in the bot and confirm the request, or email ${contactEmail}. Deletion from the bot’s working systems does not guarantee removal of history in your personal Telegram, independent copies in Telegram, backups, or other copies outside HOVER.STUDIO’s control.`,
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
