export const blueprintCaseCopy = {
  ua: {
    description:
      "Продуктовий лендинг AI Commercial Blueprint — цифрового посібника з AI-виробництва реклами. Редакційна композиція, схема процесу та справжні сторінки видання пояснюють методологію й допомагають порівняти дві версії продукту.",
    context: [
      "AI Commercial Blueprint — цифровий посібник із виробництва рекламних матеріалів за допомогою AI. Він охоплює шлях від брифу й візуального напряму до ключових кадрів, руху, монтажу, звуку та передачі готового матеріалу.",
      "Лендинг мав пояснити обсяг продукту креаторам, дизайнерам і невеликим студіям. Ми побудували презентацію навколо методології, прикладів сторінок і порівняння видань, щоб відвідувач міг оцінити зміст і вибрати відповідний формат роботи.",
    ],
    challenge:
      "Зробити зміст цифрового продукту зрозумілим до вибору видання.",
    challengeDescription:
      "Методологія, приклади та робочі матеріали потребували різної глибини пояснення. Завданням було зібрати їх у послідовну продуктову історію, показати практичний зміст і чітко розділити те, що входить до кожної з двох версій.",
    tasks: [
      ["МЕТОДОЛОГІЯ", "Представити десять етапів виробництва як послідовність дій із власними точками перевірки."],
      ["ЗМІСТ", "Розкрити шість модулів посібника через теми, робочі задачі та справжні приклади сторінок."],
      ["ВИБІР", "Пояснити спільну основу Book і Production Edition та додаткові матеріали розширеної версії."],
      ["ПЕРШИЙ КРОК", "Дати змогу дослідити матеріал через прев’ю, повні сторінки та окремий запит Production Checklist."],
    ],
    structure: [
      "Сторінка рухається від виробничих задач до системи їх вирішення. Після вступу й типових проблем схема Commercial Pipeline показує десять етапів, а шість змістових модулів розкривають, які питання охоплює кожна частина посібника.",
      "Далі відвідувач переглядає сторінки й розбори MIRA та TISSOT, визначає відповідність продукту своїй роботі та порівнює видання. Production Toolkit, безкоштовний чекліст і FAQ доповнюють цей маршрут конкретними матеріалами та відповідями.",
    ],
    journey: [
      "ПРОДУКТ І ЗАДАЧІ",
      "COMMERCIAL PIPELINE",
      "ШІСТЬ МОДУЛІВ ЗМІСТУ",
      "СТОРІНКИ ТА РОЗБОРИ",
      "BOOK / PRODUCTION EDITION",
      "CHECKLIST І FAQ",
    ],
    art: [
      "Візуальний напрям спирається на мову робочого посібника: паперові поверхні, карбонові секції, насичений синій і точна нумерація. Обкладинка, схеми та сторінки видання стають головними візуальними матеріалами й одразу задають предмет презентації.",
      "Вузькі великі заголовки поєднуються з текстом із засічками та моноширинними позначками. Чергування світлих і темних секцій розділяє смислові частини, а лінії та поля надають довгій сторінці ритм редакційного макета.",
    ],
    system:
      "Дизайн-система пов’язує продуктову розповідь, схему виробництва, галерею сторінок і порівняння видань. Типографіка розділяє головну думку, пояснення та службові позначки, а повторювані компоненти утримують спільну логіку подачі на всьому шляху знайомства з продуктом.",
    systemParts: [
      ["01 / ТИПОГРАФІКА", "IBM Plex Sans Condensed формує заголовки, Source Serif 4 — розгорнуті пояснення, IBM Plex Mono — номери, підписи та технічні позначки."],
      ["02 / КОЛІР", "Паперовий і карбоновий кольори задають контраст секцій. Синій позначає дії, нумерацію й смислові акценти; графітовий підтримує другорядну інформацію та лінії сітки."],
      ["03 / СІТКА ТА КОМПОНЕНТИ", "Модульна сітка поєднує етапи, змістові розділи, картки видань і робочі матеріали. Номери, роздільники та однакова логіка підписів допомагають орієнтуватися в деталях."],
    ],
    motion: [
      "Рух задає порядок появи інформації: заголовок, пояснення, зображення продукту, потім наступні блоки під час прокручування. Короткі переходи кнопок і послідовна поява модулів підтримують читання; системне налаштування зменшення руху враховане в анімації.",
      "Прев’ю MIRA й TISSOT відкривають повну сторінку в окремому вікні перегляду з доступом до оригіналу. FAQ розкриває відповіді на місці, а форма чекліста має окремі стани перевірки адреси, очікування та результату запиту.",
    ],
    responsive: [
      "На планшеті та телефоні продуктова історія зберігає порядок, а композиція пристосовується до ширини. Навігація переходить в окреме меню, видання розташовуються вертикально, а текстові модулі отримують власний простір під заголовками.",
      "На телефоні десять етапів pipeline переходять із таблиці в послідовний список зі збереженням груп, описів і перевірок. Галерея сторінок прокручується горизонтально, а повний перегляд дає змогу дослідити деталі окремо від основного тексту.",
    ],
    screens: [
      "Екран вибору видання поєднує спільну основу продукту та відмінності комплектацій. Book представляє методологію, а Production Edition доповнює її робочими шаблонами, чеклістами й редагованими матеріалами.",
      "Однакова структура карток дає змогу порівняти склад видань у спільному ритмі. Обкладинка утримує зв’язок із посібником, а синій маркер позначає розширену версію.",
    ],
    result: [
      "Готовий продуктовий лендинг представляє AI Commercial Blueprint через методологію, зміст і приклади матеріалів. Він поєднує десять етапів pipeline, шість модулів посібника, порівняння Book і Production Edition та окремий маршрут до Production Checklist.",
      "Ми створили цифрову презентацію, у якій продукт можна послідовно дослідити: прочитати пояснення, переглянути сторінки, відкрити розбори й зіставити комплектації. Структура, адаптивні композиції та стриманий рух підтримують цей шлях від першого екрана до вибору формату.",
    ],
    resultFacts: [
      ["10", "ЕТАПІВ PIPELINE"],
      ["6", "ЗМІСТОВИХ МОДУЛІВ"],
      ["2", "ВЕРСІЇ ПРОДУКТУ"],
    ],
    labels: {
      contextCaption: "ГОЛОВНИЙ ЕКРАН / AI COMMERCIAL BLUEPRINT",
      artCaption: "АРТДИРЕКШН / МОВА РОБОЧОГО ПОСІБНИКА",
      galleryTitle: "ПРОДУКТ У ДЕТАЛЯХ",
      galleryIntro: "Дві версії зі спільною методологією та різною комплектацією.",
      responsiveCaption: "Планшетна й мобільна версії продуктового лендингу AI Commercial Blueprint.",
      resultVisual: "ГОТОВИЙ ПРОДУКТОВИЙ ЛЕНДИНГ",
    },
  },
  en: {
    description:
      "A product landing page for AI Commercial Blueprint, a digital guide to AI advertising production. An editorial layout, process diagram and actual sample pages explain the methodology and help visitors compare two product editions.",
    context: [
      "AI Commercial Blueprint is a digital guide to producing advertising with AI. It covers the journey from the brief and visual direction to keyframes, motion, editing, sound and delivery of the finished material.",
      "The landing page needed to explain the product’s scope to creators, designers and small studios. We built its presentation around the methodology, sample pages and edition comparison so visitors could assess the content and choose a suitable format.",
    ],
    challenge:
      "Make the content of a digital product clear before visitors choose an edition.",
    challengeDescription:
      "The methodology, examples and working materials required different levels of explanation. Our task was to bring them into a coherent product story, show their practical substance and clearly distinguish what each edition includes.",
    tasks: [
      ["METHODOLOGY", "Present ten production stages as a sequence of actions, each with its own quality check."],
      ["CONTENT", "Explain the guide’s six modules through their topics, working tasks and actual sample pages."],
      ["CHOICE", "Clarify the shared foundation of Book and Production Edition and the expanded edition’s additional materials."],
      ["FIRST STEP", "Let visitors explore through previews, full pages and a separate Production Checklist request."],
    ],
    structure: [
      "The page moves from production challenges to the system that addresses them. After the introduction and recurring problems, the Commercial Pipeline presents ten stages, while six content modules explain the scope of each part of the guide.",
      "Visitors then explore sample pages and the MIRA and TISSOT studies, consider how the product fits their work and compare editions. The Production Toolkit, free checklist and FAQ extend this journey with specific materials and answers.",
    ],
    journey: [
      "PRODUCT & TASKS",
      "COMMERCIAL PIPELINE",
      "SIX CONTENT MODULES",
      "PAGES & STUDIES",
      "BOOK / PRODUCTION EDITION",
      "CHECKLIST & FAQ",
    ],
    art: [
      "The visual direction draws on the language of a working manual: paper surfaces, carbon sections, saturated blue and precise numbering. The cover, diagrams and sample pages become the main visual material and immediately establish the subject.",
      "Large condensed headings work with serif explanations and monospaced labels. Alternating light and dark sections distinguish the main chapters, while rules and margins give the long page the rhythm of an editorial layout.",
    ],
    system:
      "The design system connects the product narrative, production diagram, page gallery and edition comparison. Typography distinguishes the main idea, explanations and reference labels, while recurring components maintain a consistent presentation throughout the product journey.",
    systemParts: [
      ["01 / TYPOGRAPHY", "IBM Plex Sans Condensed shapes the headings, Source Serif 4 carries detailed explanations, and IBM Plex Mono identifies numbers, captions and technical labels."],
      ["02 / COLOR", "Paper and carbon establish contrasting sections. Blue identifies actions, numbering and key points; graphite supports secondary information and the rules of the grid."],
      ["03 / GRID & COMPONENTS", "A modular grid connects stages, content sections, edition cards and working materials. Numbers, dividers and consistent caption structures help visitors navigate the detail."],
    ],
    motion: [
      "Motion establishes the order in which information appears: the heading, explanation, product image and subsequent sections during scrolling. Short button transitions and sequential module reveals support reading, with animation accounting for reduced-motion preferences.",
      "MIRA and TISSOT previews open a full page in a dedicated viewer with access to the original. The FAQ expands answers in place, while the checklist form distinguishes address validation, loading and request result states.",
    ],
    responsive: [
      "On tablets and phones, the product story retains its sequence while the composition adapts to the available width. Navigation opens in a dedicated menu, editions stack vertically, and text modules receive their own space below headings.",
      "On phones, the ten pipeline stages become a sequential list that retains their groups, descriptions and quality checks. The page gallery scrolls horizontally, while the full-page viewer lets visitors examine details separately from the main narrative.",
    ],
    screens: [
      "The edition-selection screen connects the product’s shared foundation with the differences between its packages. Book presents the methodology, while Production Edition adds working templates, checklists and editable materials.",
      "A consistent card structure lets visitors compare the editions in the same visual rhythm. The cover maintains the link to the guide, while the blue marker identifies the expanded edition.",
    ],
    result: [
      "The completed product landing page presents AI Commercial Blueprint through its methodology, content and sample materials. It brings together ten pipeline stages, six guide modules, the Book and Production Edition comparison and a dedicated route to the Production Checklist.",
      "We created a digital presentation visitors can explore in sequence: read explanations, inspect pages, open studies and compare editions. The structure, responsive compositions and restrained motion support that journey from the opening screen to choosing a format.",
    ],
    resultFacts: [
      ["10", "PIPELINE STAGES"],
      ["6", "CONTENT MODULES"],
      ["2", "PRODUCT EDITIONS"],
    ],
    labels: {
      contextCaption: "OPENING SCREEN / AI COMMERCIAL BLUEPRINT",
      artCaption: "ART DIRECTION / THE LANGUAGE OF A WORKING MANUAL",
      galleryTitle: "THE PRODUCT IN DETAIL",
      galleryIntro: "Two editions with a shared methodology and different sets of materials.",
      responsiveCaption: "Tablet and mobile versions of the AI Commercial Blueprint product landing page.",
      resultVisual: "COMPLETED PRODUCT LANDING PAGE",
    },
  },
} as const;
