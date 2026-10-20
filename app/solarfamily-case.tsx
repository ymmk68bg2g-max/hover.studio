import Image from "next/image";
import type { ProjectLocale } from "./projects";
import { SolarFamilyEnergyFlow } from "./solarfamily-energy-flow";

const copy = {
  ua: {
    context: [
      "SolarFamily створює енергетичну інфраструктуру для бізнесу та приватних клієнтів: сонячні електростанції, системи накопичення й зарядні станції.",
      "Сайт мав показати цілісний інженерний підхід компанії — від аналізу об’єкта та проєктування до реалізації й подальшого сервісу. Ми зібрали ці напрями в одну цифрову презентацію з послідовною структурою, виразним дизайном і зрозумілими переходами до обговорення проєкту.",
    ],
    challenge: "Пояснити складні енергетичні рішення через задачі людей, які ними користуватимуться.",
    tasks: [
      ["ОРІЄНТАЦІЯ", "Розділити сценарії бізнесу, приватного дому, зарядної інфраструктури та промислового накопичення."],
      ["ЗРОЗУМІЛІСТЬ", "Поєднати технічні пояснення, параметри обладнання й приклади об’єктів у читабельну систему."],
      ["ДОВІРА", "Показати інженерну команду, повний цикл робіт і реалізовані проєкти компанії."],
      ["НАСТУПНИЙ КРОК", "Дати користувачеві простий шлях від знайомства з рішенням до звернення щодо свого об’єкта."],
    ],
    structure: [
      "Головна допомагає обрати один із чотирьох напрямів, а далі розкриває його через задачу, підхід і приклади.",
      "Окремі сторінки поглиблюють інформацію про послуги, компанію, партнерів та реалізовані проєкти. Для промислових BESS створено самостійний маршрут: принцип роботи, сценарії, економіка, інтеграція та запит на попередній розрахунок.",
    ],
    structureLabel: "Основні маршрути сайту SolarFamily",
    homepage: "ГОЛОВНА / ОБРАТИ НАПРЯМ",
    innerPages: "ВНУТРІШНІ СТОРІНКИ",
    solutions: "ЕНЕРГЕТИЧНІ НАПРЯМИ",
    directions: [
      ["БІЗНЕС", "Сонячна генерація під споживання підприємства"],
      ["ДІМ", "Власна енергія та резервне живлення"],
      ["ЗАРЯДНІ СТАНЦІЇ", "Інфраструктура для електромобілів"],
      ["ПРОМИСЛОВІ BESS", "Накопичення та керування енергією"],
    ],
    support: ["ПОСЛУГИ", "ПРОЄКТИ", "ПРО КОМПАНІЮ", "ПАРТНЕРИ ТА ОБЛАДНАННЯ"],
    enquiry: "ОБГОВОРИТИ ЕНЕРГЕТИЧНУ ЗАДАЧУ",
    art: [
      "Масштаб інфраструктури став основою візуального напряму.",
      "Великі зображення об’єктів, графітове тло та жовті акценти поєднуються з точною сіткою й виразними заголовками. Візуальні матеріали показують середовище, у якому працюють рішення, а зображення команди додають людський вимір інженерній експертизі. Простір між блоками допомагає читати технічний контент без перевантаження.",
    ],
    system: "Єдина система інтерфейсу поєднує презентаційні сторінки, технічні пояснення та портфоліо об’єктів.",
    typeLabel: "01 / ТИПОГРАФІКА",
    type: "Контраст заголовків, основного тексту та коротких підписів задає порядок читання. Технічні характеристики мають власну ієрархію, щоб значення та одиниці вимірювання легко зіставлялися.",
    colorLabel: "02 / КОЛІР",
    swatches: [
      ["ГРАФІТ", "Текст і контрастні секції"],
      ["ЖОВТИЙ", "Дії та навігаційні акценти"],
      ["ЗЕЛЕНИЙ", "Енергетичні сценарії та активні стани"],
      ["СВІТЛЕ ТЛО", "Контент і читабельність"],
    ],
    gridLabel: "03 / СІТКА ТА КОМПОНЕНТИ",
    grid: "Повторювані лінії, нумерація, картки й кнопки тримають сторінки в одному ритмі. Широкі візуальні блоки чергуються з компактними поясненнями та даними.",
    interaction: [
      "Взаємодія підтримує пояснення та допомагає перейти до конкретного запиту.",
      "На головній інтерактивна схема пояснює зв’язки між генерацією, мережею, накопиченням і споживанням. Перемикання сценарію змінює активний вузол, а анімовані потоки показують напрям руху енергії. На сторінці BESS окремі сценарії розкривають пріоритети підприємства, а демонстраційний інтерфейс моніторингу ілюструє типи показників.",
    ],
    responsive: [
      "На телефоні та планшеті зберігається та сама логіка: обрати напрям, зрозуміти рішення, переглянути досвід компанії та залишити звернення.",
      "Багатоколонкові композиції переходять у вертикальну послідовність. Навігація, зображення, схеми й поля форм пристосовані до доступної ширини. Технічний зміст залишається частиною сторінки, а порядок блоків підтримує читання під час прокручування.",
    ],
    screens: [
      "Портфоліо показує інженерні рішення через конкретні об’єкти, їхні характеристики та обсяг виконаних робіт.",
      "Серед обраних проєктів — Нова пошта, ПУМБ, ФОРА, АТБ / Logistic Union та УКРАВІТ САЙЕНС ПАРК. Ця подача дає технічним параметрам контекст і демонструє різні масштаби застосування рішень SolarFamily.",
    ],
    result: [
      "Дизайн погоджений із клієнтом, а сайт уже опублікований на solarfamily.ua. Проєкт має українську та англійську версії.",
      "Від стратегії та UX/UI до розробки й motion ми сформували цілісну цифрову презентацію SolarFamily. Вона об’єднує напрями роботи, інженерну експертизу, обладнання та реалізовані об’єкти й дає відвідувачеві послідовний шлях до обговорення своєї енергетичної задачі.",
    ],
    resultFacts: [["4", "ОСНОВНІ НАПРЯМИ"], ["BESS", "ОКРЕМИЙ МАРШРУТ"], ["UA / EN", "ДВІ МОВНІ ВЕРСІЇ"], ["LIVE", "ОПУБЛІКОВАНИЙ САЙТ"]],
    phoneAlt: "Мобільна версія головної сторінки SolarFamily",
    tabletAlt: "Планшетна версія головної сторінки SolarFamily",
    phoneCaption: "01 / ТЕЛЕФОН",
    tabletCaption: "02 / ПЛАНШЕТ",
    heroAlt: "Головна сторінка SolarFamily з енергетичними рішеннями для бізнесу, дому та електротранспорту",
    heroCaption: "ГОЛОВНА / ЧОТИРИ НАПРЯМИ ЕНЕРГЕТИЧНИХ РІШЕНЬ",
    artAlt: "Сторінка SolarFamily про професійний клінінг промислових і дахових сонячних електростанцій",
    artCaption: "СЕРВІС / КЛІНІНГ СОНЯЧНИХ СТАНЦІЙ",
    bessAlt: "Форма попереднього розрахунку промислової системи BESS на сайті SolarFamily",
    bessCaption: "ПРОМИСЛОВІ BESS / ПОПЕРЕДНІЙ РОЗРАХУНОК",
    menuAlt: "Розгорнуте меню рішень SolarFamily з енергетичними напрямами та пов’язаними галузями",
    menuCaption: "НАВІГАЦІЯ / МЕНЮ РІШЕНЬ ТА ГАЛУЗЕЙ",
    projectsAlt: "Головний екран сторінки проєктів SolarFamily з інженерною командою на сонячній станції",
    projectsCaption: "ПРОЄКТИ / ІНЖЕНЕРІЯ В МАСШТАБІ ОБ’ЄКТІВ",
  },
  en: {
    context: [
      "SolarFamily develops energy infrastructure for businesses and private clients: solar power plants, energy storage and EV charging stations.",
      "The website needed to present the company’s engineering approach, from assessing a site and designing a solution to implementation and ongoing service. We brought these directions into one digital presentation with a clear structure, distinctive design and a straightforward path towards discussing a project.",
    ],
    challenge: "Explain complex energy solutions through the needs of the people who will use them.",
    tasks: [
      ["ORIENTATION", "Separate the journeys for businesses, private homes, EV charging and industrial storage."],
      ["CLARITY", "Bring technical explanations, equipment specifications and project examples into a readable system."],
      ["TRUST", "Present the engineering team, the full project lifecycle and completed work."],
      ["NEXT STEP", "Give visitors a clear path from understanding a solution to discussing their own project."],
    ],
    structure: [
      "The homepage helps visitors choose one of four directions, then introduces its purpose, approach and examples.",
      "Dedicated pages provide detail about services, the company, partners and completed projects. Industrial BESS has its own journey through operating principles, scenarios, economics and integration, ending with a request for a preliminary calculation.",
    ],
    structureLabel: "SolarFamily primary website journeys",
    homepage: "HOME / CHOOSE A DIRECTION",
    innerPages: "INNER PAGES",
    solutions: "ENERGY SOLUTIONS",
    directions: [
      ["BUSINESS", "Solar generation shaped around business consumption"],
      ["HOME", "Own energy generation and backup power"],
      ["EV CHARGING", "Infrastructure for electric vehicles"],
      ["INDUSTRIAL BESS", "Energy storage and management"],
    ],
    support: ["SERVICES", "PROJECTS", "COMPANY", "PARTNERS & EQUIPMENT"],
    enquiry: "DISCUSS AN ENERGY REQUIREMENT",
    art: [
      "The scale of infrastructure shaped the visual direction.",
      "Large-scale infrastructure imagery, graphite surfaces and yellow accents work with a precise grid and prominent headings. Visuals show the environment in which solutions operate, while team imagery gives engineering expertise a human dimension. Space between sections keeps technical content readable.",
    ],
    system: "One interface system connects presentation pages, technical explanations and the project portfolio.",
    typeLabel: "01 / TYPOGRAPHY",
    type: "The contrast between headings, body copy and short labels establishes a reading order. Technical specifications have their own hierarchy, making values and units easy to compare.",
    colorLabel: "02 / COLOR",
    swatches: [
      ["GRAPHITE", "Text and contrasting sections"],
      ["YELLOW", "Actions and navigation accents"],
      ["GREEN", "Energy scenarios and active states"],
      ["LIGHT", "Content and readable surfaces"],
    ],
    gridLabel: "03 / GRID & COMPONENTS",
    grid: "Recurring rules, numbering, cards and buttons give pages a shared rhythm. Wide visuals alternate with focused explanations and data.",
    interaction: [
      "Interaction supports explanations and helps visitors move towards a specific enquiry.",
      "On the homepage, an interactive diagram explains generation, the grid, storage and consumption. Switching scenarios changes the active node, while animated flows show the direction of energy movement. On the BESS page, dedicated scenarios explain business priorities, and an illustrative monitoring interface shows the types of metrics involved.",
    ],
    responsive: [
      "The mobile and tablet journey follows the same logic: choose a direction, understand the solution, explore the company’s experience and make an enquiry.",
      "Multiple columns become a vertical sequence. Navigation, imagery, diagrams and form fields adapt to the available width. Technical content remains part of the page, with the order of sections supporting reading as visitors scroll.",
    ],
    screens: [
      "The portfolio presents engineering solutions through completed installations, their specifications and the scope of work.",
      "Selected projects include Nova Poshta, PUMB, FORA, ATB / Logistic Union and Ukravit Science Park. This presentation gives technical figures context and shows the different scales at which SolarFamily’s solutions are applied.",
    ],
    result: [
      "The design has been approved by the client, and the website is now live at solarfamily.ua. The project includes Ukrainian and English versions.",
      "From strategy and UX/UI to development and motion, we created a cohesive digital presentation of SolarFamily. It brings together its solutions, engineering expertise, equipment and completed projects, giving visitors a clear route towards discussing their own energy requirements.",
    ],
    resultFacts: [["4", "CORE DIRECTIONS"], ["BESS", "DEDICATED JOURNEY"], ["UA / EN", "TWO LANGUAGE VERSIONS"], ["LIVE", "PUBLISHED WEBSITE"]],
    phoneAlt: "SolarFamily homepage on a phone",
    tabletAlt: "SolarFamily homepage on a tablet",
    phoneCaption: "01 / PHONE",
    tabletCaption: "02 / TABLET",
    heroAlt: "SolarFamily homepage presenting energy solutions for business, home and electric vehicles",
    heroCaption: "HOME / FOUR ENERGY SOLUTION DIRECTIONS",
    artAlt: "SolarFamily service page for professional cleaning of industrial and rooftop solar installations",
    artCaption: "SERVICE / SOLAR PANEL CLEANING",
    bessAlt: "SolarFamily preliminary calculation form for an industrial BESS system",
    bessCaption: "INDUSTRIAL BESS / PRELIMINARY CALCULATION",
    menuAlt: "SolarFamily expanded solutions menu showing energy solutions and related industries",
    menuCaption: "NAVIGATION / SOLUTIONS AND INDUSTRIES MENU",
    projectsAlt: "SolarFamily projects page hero showing the engineering team at a solar installation",
    projectsCaption: "PROJECTS / ENGINEERING / REAL-WORLD PROJECTS",
  },
} as const;

function SolarFamilyScreen({
  src,
  alt,
  caption,
  width = 1333,
  height = 926,
}: {
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="sf-screen">
      <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 760px) 100vw, 72vw" unoptimized />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function EditorialCopy({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="case-editorial-copy">
      {paragraphs.map((paragraph, index) => (
        <p className={index === 0 ? "case-text-lead" : "case-text-body"} key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

export function SolarFamilyCaseSection({ index, locale }: { index: number; locale: ProjectLocale }) {
  const content = copy[locale];

  if (index === 0) {
    return (
      <div className="case-content case-context">
        <EditorialCopy paragraphs={content.context} />
        <SolarFamilyScreen src="/case/solarfamily/hero.webp" alt={content.heroAlt} caption={content.heroCaption} width={2048} height={1136} />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="case-content case-challenge">
        <p className="case-text-lead">{content.challenge}</p>
        <div className="case-task-list">
          {content.tasks.map(([title, description], taskIndex) => (
            <div className="case-task-row" key={title}>
              <span>{String(taskIndex + 1).padStart(2, "0")}</span>
              <h3 className="content-subheading">{title}</h3>
              <p className="case-text-body">{description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="case-content case-structure">
        <EditorialCopy paragraphs={content.structure} />
        <div className="case-sitemap" aria-label={content.structureLabel}>
          <div className="case-sitemap-root"><span>SOLARFAMILY</span></div>
          <div className="case-sitemap-branches">
            <div className="case-sitemap-branch">
              <h3>{content.homepage}</h3>
              <ul>
                <li className="has-children"><span className="case-sitemap-node">{content.solutions}</span>
                  <ul>{content.directions.map(([title]) => <li key={title}><span className="case-sitemap-node">{title}</span></li>)}</ul>
                </li>
                <li><span className="case-sitemap-node">{content.support[2]}</span></li>
                <li><span className="case-sitemap-node">{content.enquiry}</span></li>
              </ul>
            </div>
            <div className="case-sitemap-branch">
              <h3>{content.innerPages}</h3>
              <ul>
                <li><span className="case-sitemap-node">{content.directions[3][0]}</span></li>
                {content.support.map(title => <li key={title}><span className="case-sitemap-node">{title}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="case-content case-art-direction">
        <EditorialCopy paragraphs={content.art} />
        <SolarFamilyScreen src="/case/solarfamily/cleaning.webp" alt={content.artAlt} caption={content.artCaption} width={2048} height={1143} />
      </div>
    );
  }

  if (index === 4) {
    const swatchClasses = ["sf-swatch-graphite", "sf-swatch-yellow", "sf-swatch-green", "sf-swatch-light"];
    return (
      <div className="case-content case-design-system">
        <p className="case-text-lead">{content.system}</p>
        <div className="sf-system-board">
          <section className="sf-system-item"><h3>{content.typeLabel}</h3><p className="sf-board-body">{content.type}</p></section>
          <section className="sf-system-item">
            <h3>{content.colorLabel}</h3>
            <div className="sf-swatches">
              {content.swatches.map(([label, description], swatchIndex) => (
                <div className={`sf-swatch ${swatchClasses[swatchIndex]}`} key={label}><strong>{label}</strong><span>{description}</span></div>
              ))}
            </div>
          </section>
          <section className="sf-system-item"><h3>{content.gridLabel}</h3><p className="sf-board-body">{content.grid}</p></section>
        </div>
      </div>
    );
  }

  if (index === 5) {
    return (
      <div className="case-content case-interaction">
        <EditorialCopy paragraphs={content.interaction} />
        <SolarFamilyEnergyFlow locale={locale} />
        <SolarFamilyScreen src="/case/solarfamily/navigation-menu.webp" alt={content.menuAlt} caption={content.menuCaption} width={2048} height={1129} />
      </div>
    );
  }

  if (index === 6) {
    return (
      <div className="case-content case-responsive">
        <EditorialCopy paragraphs={content.responsive} />
        <div className="sf-responsive-screens">
          <figure className="sf-device sf-device-phone">
            <div className="sf-device-viewport"><Image src="/case/solarfamily/phone.webp" alt={content.phoneAlt} width={1008} height={2048} sizes="(max-width: 760px) 33vw, 24vw" unoptimized /></div>
            <figcaption>{content.phoneCaption}</figcaption>
          </figure>
          <figure className="sf-device sf-device-tablet">
            <div className="sf-device-viewport"><Image src="/case/solarfamily/tablet.webp" alt={content.tabletAlt} width={1595} height={2048} sizes="(max-width: 760px) 55vw, 40vw" unoptimized /></div>
            <figcaption>{content.tabletCaption}</figcaption>
          </figure>
        </div>
      </div>
    );
  }

  if (index === 7) {
    return (
      <div className="case-content case-selected-screens">
        <EditorialCopy paragraphs={content.screens} />
        <div className="sf-screen-gallery">
          <SolarFamilyScreen src="/case/solarfamily/projects-hero.webp" alt={content.projectsAlt} caption={content.projectsCaption} width={2048} height={1132} />
          <SolarFamilyScreen src="/case/solarfamily/bess-calculation.webp" alt={content.bessAlt} caption={content.bessCaption} width={2048} height={1140} />
        </div>
      </div>
    );
  }

  if (index === 8) {
    return (
      <div className="case-content case-result">
        <EditorialCopy paragraphs={content.result} />
        <div className="sf-result-facts">
          {content.resultFacts.map(([value, label], factIndex) => <div key={label}><span>{String(factIndex + 1).padStart(2, "0")}</span><strong>{value}</strong><p>{label}</p></div>)}
        </div>
      </div>
    );
  }

  return null;
}
