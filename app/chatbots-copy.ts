import type { ServiceLocale } from "./services";

type FormatCopy = {
  label: string;
  title: string;
  body: readonly string[];
  flow?: string;
  note?: string;
  options?: readonly { title: string; text: string }[];
};

export type ChatbotsCopy = {
  service: string;
  lead: string;
  intro: string;
  basicPriceNote: string;
  discuss: string;
  seeExample: string;
  formatsLabel: string;
  formatsTitle: string;
  formats: readonly FormatCopy[];
  exampleLabel: string;
  exampleTitle: string;
  exampleBody: string;
  ownSolution: string;
  similarPrice: string;
  replyTitle: string;
  replyBody: string;
  privacyBody: string;
  liveBotTitle: string;
  liveBotBody: string;
  liveBotLink: string;
  scopeLabel: string;
  scopeTitle: string;
  includedTitle: string;
  included: readonly string[];
  separateTitle: string;
  separate: readonly string[];
  pricesLabel: string;
  pricesTitle: string;
  oneOff: string;
  packages: readonly {
    key: "guided" | "manager";
    title: string;
    intro: string;
    items: readonly string[];
    limit: string;
  }[];
  integrationsTitle: string;
  integrationsPrice: string;
  integrationsBody: string;
  budgetNote: string;
  runningTitle: string;
  runningBody: string;
  supportBody: string;
  accessBody: string;
  processLabel: string;
  processTitle: string;
  steps: readonly { title: string; text: string }[];
  timeline: string;
  materialsTitle: string;
  materials: readonly string[];
  materialsNote: string;
  faqLabel: string;
  faqTitle: string;
  faqs: readonly { id: string; question: string; answer: string }[];
  finalLabel: string;
  finalTitle: string;
  finalBody: string;
};

export const chatbotsCopy = {
  ua: {
    service: "ПОСЛУГА / TELEGRAM",
    lead: "Від першого повідомлення — до розмови з менеджером.",
    intro: "Telegram-боти для бізнесу: приймання звернень, відповіді за погодженими сценаріями та спілкування від імені компанії. Допомагаємо обрати потрібний формат, налаштовуємо логіку й підключаємо його до сайту.",
    basicPriceNote: "базовий сценарний бот.",
    discuss: "Обговорити задачу",
    seeExample: "Як це працює у HOVER",
    formatsLabel: "02 / ФОРМАТИ",
    formatsTitle: "Яку задачу має вирішувати бот?",
    formats: [
      {
        label: "СЦЕНАРНИЙ БОТ",
        title: "Пояснити й зібрати звернення.",
        body: ["Клієнт обирає послугу, отримує підготовлені відповіді та залишає інформацію про свою задачу. Менеджер отримує структуроване повідомлення й продовжує спілкування погодженим способом."],
        flow: "Старт → вибір послуги → питання → контакт → повідомлення менеджеру",
        note: "Це меню й погоджена логіка. Бот використовує підготовлені відповіді, а не AI, який самостійно їх вигадує.",
      },
      {
        label: "БОТ ДЛЯ ПЕРЕПИСКИ",
        title: "Спілкуватися з клієнтами від імені компанії.",
        body: ["Клієнт пише офіційному боту компанії. Повідомлення надходить у закритий робочий простір, де звернення розділені за діалогами. Менеджер відповідає, а клієнт отримує повідомлення від бота компанії."],
        flow: "Клієнт → бот → окремий внутрішній діалог → менеджер → клієнт",
        note: "Цей формат є основою власного рішення HOVER, яке показано нижче.",
      },
      {
        label: "ПІДКЛЮЧЕННЯ САЙТУ",
        title: "Пов’язати сайт із робочим каналом.",
        body: [],
        options: [
          { title: "A / Перехід до бота", text: "Кнопка на сайті відкриває діалог із ботом у Telegram. Спілкування відбувається в Telegram, а не всередині браузера." },
          { title: "B / Заявка з форми", text: "Форма сайту передає заявку менеджеру в Telegram, якщо таку інтеграцію погоджено й реалізовано. Сповіщення про заявку саме по собі не створює двосторонню переписку." },
        ],
        note: "Просте посилання та backend-інтеграція форми — різний обсяг робіт. Для наявного сайту перевіряємо доступ до коду / CMS і сумісність із поточними інструментами.",
      },
    ],
    exampleLabel: "03 / ВЛАСНЕ РІШЕННЯ HOVER",
    exampleTitle: "Один бот для клієнта. Окремі діалоги для команди.",
    exampleBody: "Для HOVER ми створили власний канал спілкування через Telegram. Клієнт звертається до бота студії, а робота зі зверненням відбувається у закритому просторі з окремими діалогами. Відповідь менеджера повертається клієнту від імені HOVER.",
    ownSolution: "Це власне рішення студії, а не зовнішній клієнтський проєкт.",
    similarPrice: "Подібне рішення —",
    replyTitle: "Reply — відповідь клієнту. Нотатка — для команди.",
    replyBody: "Менеджер використовує Reply на повідомлення клієнта у відповідному внутрішньому діалозі. Так відповідь надходить клієнту від бота HOVER. Звичайні повідомлення без Reply залишаються внутрішніми нотатками.",
    privacyBody: "Звернення надходять у закриту робочу групу HOVER | CLIENT INBOX. Для кожного клієнта є окремий внутрішній діалог; інші клієнти не приєднуються до цієї групи.",
    liveBotTitle: "Хочете написати студії?",
    liveBotBody: "Відкриється наш робочий бот. Ваше повідомлення надійде студії; відповідь надає людина.",
    liveBotLink: "Написати HOVER у Telegram",
    scopeLabel: "04 / ОБСЯГ РОБІТ",
    scopeTitle: "Від сценарію до робочої точки входу.",
    includedTitle: "Що входить у роботу",
    included: [
      "Обговорення задачі й потрібного формату",
      "Проєктування погодженого сценарію",
      "Меню, повідомлення та логіка переходів",
      "Налаштування отримання звернень",
      "Розробка погоджених функцій",
      "Підключення точки входу із сайту",
      "Перевірка сценаріїв та помилок",
      "Розгортання",
      "Коротка інструкція користування",
    ],
    separateTitle: "Окремо погоджуємо",
    separate: [
      "Додаткові сценарії та мови",
      "Кілька команд / робочих груп і додаткові ролі",
      "Передавання різних типів файлів",
      "CRM або інші зовнішні API",
      "Доопрацювання стороннього сайту",
      "Спеціальні правила зберігання даних",
      "Розширене адміністрування",
      "Подальшу підтримку й нові функції",
    ],
    pricesLabel: "05 / СТАРТОВА ВАРТІСТЬ",
    pricesTitle: "Два формати. Визначений обсяг.",
    oneOff: "ОДНОРАЗОВА РОЗРОБКА",
    packages: [
      {
        key: "guided",
        title: "Сценарний бот",
        intro: "Погоджене базове рішення для пояснення послуг і збору звернень.",
        items: [
          "Один Telegram-бот для одного бізнесу",
          "Одна мова й одне меню",
          "Один основний сценарій збору звернення — до п’яти послідовних кроків",
          "Короткий набір погоджених відповідей / FAQ",
          "Надсилання заявки в один погоджений робочий канал",
          "Одне посилання або кнопка переходу з доступного сайту",
          "Перевірка та запуск",
          "Коротка інструкція",
        ],
        limit: "Двостороння операторська переписка через topics не включена. Складні додаткові гілки й зовнішні інтеграції оцінюємо окремо.",
      },
      {
        key: "manager",
        title: "Переписка з менеджером",
        intro: "Подібний принцип роботи до власного рішення HOVER. Остаточний склад погоджуємо під задачу вашої компанії.",
        items: [
          "Один Telegram-бот та одна мова",
          "Одна закрита робоча група й один відповідальний оператор",
          "Окремі діалоги для клієнтів",
          "Двостороннє передавання текстових повідомлень",
          "Відповідь клієнту від імені бота компанії",
          "Базовий контроль доступу оператора",
          "Перевірка розділення діалогів",
          "Підключення погодженої точки входу із сайту",
          "Розгортання та інструкція для оператора",
        ],
        limit: "Додаткових операторів, мови, медіатипи, статуси, звіти й зовнішні системи погоджуємо окремо.",
      },
    ],
    integrationsTitle: "Додаткові інтеграції",
    integrationsPrice: "За оцінкою",
    integrationsBody: "Обсяг залежить від потрібних систем, їхніх можливостей і доступів. Будь-яка інтеграція не входить автоматично у стартову вартість.",
    budgetNote: "Це стартова вартість розробки в зазначеному обсязі. Остаточну оцінку погоджуємо після обговорення сценаріїв, мов та інтеграцій.",
    runningTitle: "Інфраструктура й супровід після запуску",
    runningBody: "Розробка оплачується окремо. Хостинг, база даних і сторонні сервіси можуть мати регулярну оплату. Фактичну конфігурацію та бюджет погоджуємо до запуску.",
    supportBody: "Підтримка й нові функції не є необмеженою безкоштовною частиною стартової вартості. Їхній обсяг і умови погоджуємо в проєкті.",
    accessBody: "Умови доступів і передачі матеріалів узгоджуємо окремо. Доступи передаємо безпечним способом після погодження роботи.",
    processLabel: "06 / ПРОЦЕС І МАТЕРІАЛИ",
    processTitle: "Спочатку задача. Потім логіка й запуск.",
    steps: [
      { title: "Задача", text: "Визначаємо, що бот має робити та кому передавати звернення." },
      { title: "Сценарій", text: "Погоджуємо меню, тексти, дані й межі автоматизації." },
      { title: "Реалізація та перевірка", text: "Налаштовуємо роботу, перевіряємо типові ситуації та помилки." },
      { title: "Запуск і передача", text: "Підключаємо потрібні точки входу, передаємо інструкцію й погоджуємо супровід." },
    ],
    timeline: "Термін визначаємо після погодження обсягу та отримання необхідних матеріалів.",
    materialsTitle: "Що потрібно від вас",
    materials: [
      "Короткий опис задачі",
      "Послуги й питання, які потрібно охопити",
      "Бажаний канал отримання звернень",
      "Відповідальний за відповіді",
      "Готові бренд-матеріали, якщо є",
      "Інформація про сайт та системи, які потрібно підключити",
    ],
    materialsNote: "У першому зверненні достатньо опису задачі. Не надсилайте паролі, токени або приватні дані через публічну форму.",
    faqLabel: "07 / ПИТАННЯ Й ВІДПОВІДІ",
    faqTitle: "Перед початком роботи.",
    faqs: [
      { id: "ai", question: "Це бот зі штучним інтелектом?", answer: "Ні. У цих форматах використовуються погоджені сценарії та/або відповіді людини. AI-консультації не входять у пропозицію." },
      { id: "where", question: "Клієнт пише на сайті чи в Telegram?", answer: "Кнопка на сайті відкриває Telegram. Форма сайту може передавати заявку менеджеру, якщо це погоджено й реалізовано. Чат усередині браузера — інший обсяг робіт, який тут не включений." },
      { id: "website", question: "Чи потрібен сайт, щоб користуватися ботом?", answer: "Ні. Бот може бути окремим каналом звернень. Сайт є однією з можливих точок входу; посилання на бота також можна використовувати в інших матеріалах компанії." },
      { id: "existing", question: "Чи можна підключити до вже існуючого сайту?", answer: "Так, після перевірки доступів, платформи та потрібного способу інтеграції. Просте посилання й передавання даних із форми потребують різного обсягу робіт; можливості коду або CMS перевіряємо окремо." },
      { id: "answers", question: "Хто відповідає клієнтам?", answer: "У сценарному боті працюють погоджені автоматичні відповіді. У форматі переписки відповідає менеджер вашої компанії, а клієнт отримує повідомлення від бота. Робочий час і порядок відповідей визначає ваша команда; жива відповідь 24/7 не включена." },
      { id: "ongoing", question: "Що оплачується після запуску?", answer: "Інфраструктура, погоджений супровід і нові задачі. Хостинг, база даних і сторонні сервіси можуть мати регулярну оплату. Конфігурацію, бюджет і умови підтримки погоджуємо до запуску." },
      { id: "expansion", question: "Чи можна додати іншу мову або кількох менеджерів?", answer: "Такі розширення можна оцінити окремо. Додаткові мови, оператори та ролі не входять автоматично у стартову ціну; спочатку погоджуємо потрібну логіку й обсяг." },
    ],
    finalLabel: "08 / ОБГОВОРІМО",
    finalTitle: "Яку задачу має вирішити ваш бот?",
    finalBody: "Розкажіть, як зараз надходять звернення, хто на них відповідає та що хочете впорядкувати. Запропонуємо відповідний сценарій і погодимо обсяг роботи.",
  },
  en: {
    service: "SERVICE / TELEGRAM",
    lead: "From the first message to a conversation with your team.",
    intro: "Telegram bots for business enquiries, agreed response flows and conversations on behalf of your company. We help you choose the right format, build the logic and connect it to your website.",
    basicPriceNote: "a basic guided bot.",
    discuss: "Discuss your project",
    seeExample: "See how HOVER uses it",
    formatsLabel: "02 / FORMATS",
    formatsTitle: "What should your bot do?",
    formats: [
      {
        label: "GUIDED BOT",
        title: "Explain your offer and collect enquiries.",
        body: ["A client chooses a service, receives prepared answers and shares the details of their project. Your manager receives a structured enquiry and continues the conversation through the agreed channel."],
        flow: "Start → choose a service → questions → contact details → enquiry to your team",
        note: "This is a menu with agreed logic and prepared answers. It does not use AI to make up responses.",
      },
      {
        label: "BOT FOR TEAM CONVERSATIONS",
        title: "Talk to clients on behalf of your company.",
        body: ["A client messages your company’s official bot. The message reaches a private workspace, where enquiries are separated into conversations. Your manager replies, and the client receives a message from the company’s bot."],
        flow: "Client → bot → separate internal conversation → manager → client",
        note: "This is the format behind HOVER’s own implementation, shown below.",
      },
      {
        label: "WEBSITE CONNECTION",
        title: "Connect your website to your working channel.",
        body: [],
        options: [
          { title: "A / Open the bot", text: "A website button opens a conversation with your bot in Telegram. The conversation takes place in Telegram, rather than inside the browser." },
          { title: "B / Receive form enquiries", text: "A website form sends an enquiry to your manager in Telegram when that integration has been agreed and built. A form notification does not, by itself, create a two-way conversation." },
        ],
        note: "A simple link and a backend form integration have different scopes. For an existing website, we review access to its code / CMS and compatibility with its current tools.",
      },
    ],
    exampleLabel: "03 / HOVER’S OWN IMPLEMENTATION",
    exampleTitle: "One bot for the client. Separate conversations for the team.",
    exampleBody: "We built HOVER’s own communication channel in Telegram. Clients contact the studio’s bot, while the team handles each enquiry in a separate conversation within a private workspace. A manager’s reply reaches the client on behalf of HOVER.",
    ownSolution: "This is the studio’s own implementation, rather than an external client project.",
    similarPrice: "A similar implementation —",
    replyTitle: "Reply reaches the client. Notes stay with the team.",
    replyBody: "The manager uses Reply on a client’s message in the relevant internal conversation. This sends the response to the client through HOVER’s bot. Ordinary messages posted without Reply remain internal notes.",
    privacyBody: "Enquiries arrive in the private HOVER | CLIENT INBOX working group. Each client has a separate internal conversation; other clients do not join this group.",
    liveBotTitle: "Want to contact the studio?",
    liveBotBody: "This opens our working bot. Your message will reach the studio, and a person will reply.",
    liveBotLink: "Message HOVER on Telegram",
    scopeLabel: "04 / SCOPE OF WORK",
    scopeTitle: "From an agreed flow to a working point of entry.",
    includedTitle: "What the work includes",
    included: [
      "Discussing your task and choosing the format",
      "Designing the agreed conversation flow",
      "Menus, messages and navigation logic",
      "Setting up enquiry delivery",
      "Building the agreed functions",
      "Connecting a website entry point",
      "Checking workflows and error cases",
      "Deployment",
      "A short usage guide",
    ],
    separateTitle: "Agreed separately",
    separate: [
      "Additional workflows and languages",
      "Multiple teams / working groups and extra roles",
      "Support for different file types",
      "CRM connections or other external APIs",
      "Changes to a third-party website",
      "Specific data retention requirements",
      "Extended administration",
      "Ongoing support and new functions",
    ],
    pricesLabel: "05 / STARTING PRICES",
    pricesTitle: "Two formats. A defined scope.",
    oneOff: "ONE-TIME DEVELOPMENT",
    packages: [
      {
        key: "guided",
        title: "Guided bot",
        intro: "An agreed basic implementation for explaining services and collecting enquiries.",
        items: [
          "One Telegram bot for one business",
          "One language and one menu",
          "One main enquiry flow with up to five consecutive steps",
          "A short set of agreed answers / FAQs",
          "Enquiries sent to one agreed working channel",
          "One link or button from an accessible website",
          "Checks and launch",
          "A short usage guide",
        ],
        limit: "Two-way operator conversations through topics are not included. Complex extra branches and external integrations are estimated separately.",
      },
      {
        key: "manager",
        title: "Conversations with your team",
        intro: "A similar working principle to HOVER’s own implementation. We agree the final scope around your company’s needs.",
        items: [
          "One Telegram bot and one language",
          "One private working group and one responsible operator",
          "Separate conversations for clients",
          "Two-way text message delivery",
          "Replies to clients on behalf of the company’s bot",
          "Basic operator access control",
          "Checks that conversations remain separate",
          "Connection of the agreed website entry point",
          "Deployment and an operator guide",
        ],
        limit: "Additional operators, languages, media types, statuses, reports and external systems are agreed separately.",
      },
    ],
    integrationsTitle: "Additional integrations",
    integrationsPrice: "Estimated separately",
    integrationsBody: "The scope depends on the systems involved, their capabilities and available access. Integrations are not automatically included in the starting price.",
    budgetNote: "These are starting development prices for the scope shown. The final estimate depends on the agreed workflows, languages and integrations.",
    runningTitle: "Infrastructure and support after launch",
    runningBody: "Development is charged separately. Hosting, a database and third-party services may have recurring costs. We agree the actual configuration and budget before launch.",
    supportBody: "Ongoing support and new functions are not an unlimited free part of the starting price. Their scope and terms are agreed within the project.",
    accessBody: "We also agree access arrangements and the handover of materials. Credentials are shared through a secure process once the work has been agreed.",
    processLabel: "06 / PROCESS & MATERIALS",
    processTitle: "Start with the task. Then shape the flow and launch.",
    steps: [
      { title: "The task", text: "We define what the bot should do and who should receive enquiries." },
      { title: "The flow", text: "We agree menus, copy, data and the limits of automation." },
      { title: "Build and check", text: "We implement the workflow and check typical situations and errors." },
      { title: "Launch and handover", text: "We connect the required entry points, provide a guide and agree ongoing support." },
    ],
    timeline: "Timing is confirmed after the scope is agreed and the necessary materials are available.",
    materialsTitle: "What we need from you",
    materials: [
      "A short description of the task",
      "The services and questions to cover",
      "Your preferred channel for receiving enquiries",
      "The person responsible for replies",
      "Existing brand materials, if available",
      "Details of the website and systems to connect",
    ],
    materialsNote: "A description of the task is enough for the first enquiry. Please do not send passwords, tokens or private data through the public form.",
    faqLabel: "07 / QUESTIONS & ANSWERS",
    faqTitle: "Before we begin.",
    faqs: [
      { id: "ai", question: "Does this bot use artificial intelligence?", answer: "No. These formats use agreed workflows and/or replies written by a person. AI consultation is not part of this offer." },
      { id: "where", question: "Does the client write on the website or in Telegram?", answer: "A website button opens Telegram. A website form can send an enquiry to your manager when that connection has been agreed and built. An in-browser chat has a different scope and is not included here." },
      { id: "website", question: "Do I need a website to use the bot?", answer: "No. The bot can be a separate channel for enquiries. A website is one possible entry point; you can also use the bot’s link in your other company materials." },
      { id: "existing", question: "Can you connect it to an existing website?", answer: "Yes, after reviewing access, the platform and the integration required. A simple link and form data delivery have different scopes. We check what the website’s code or CMS allows before agreeing the work." },
      { id: "answers", question: "Who replies to clients?", answer: "A guided bot uses agreed automatic responses. In the conversation format, your company’s manager replies and the client receives the message from the bot. Your team defines its working hours and response process; round-the-clock human replies are not included." },
      { id: "ongoing", question: "What do I pay for after launch?", answer: "Infrastructure, agreed support and new work. Hosting, a database and third-party services may have recurring costs. We agree the configuration, budget and support terms before launch." },
      { id: "expansion", question: "Can I add another language or several managers?", answer: "These extensions can be estimated separately. Additional languages, operators and roles are not automatically included in the starting price. We first agree the required logic and scope." },
    ],
    finalLabel: "08 / LET’S TALK",
    finalTitle: "What should your bot help you do?",
    finalBody: "Tell us how enquiries reach you today, who replies and what you want to organise. We will suggest a suitable workflow and agree the scope of work.",
  },
} as const satisfies Record<ServiceLocale, ChatbotsCopy>;
