import { CapabilityDemoFrame } from "./capability-demo-frame";
import { CapabilityDemoArrow } from "./capability-demo-arrow";

const copy = {
  en: {
    study: "STRATEGY DEMO",
    goalLabel: "BUSINESS GOAL",
    goal: "Get an enquiry",
    home: "Home",
    services: "Services",
    contact: "Contact",
    action: "Discuss a project",
    steps: ["Goal", "Structure", "User route"],
    caption: "Strategy in three steps: the goal ‘Get an enquiry’ becomes a site map with Home, Services and Contact. An orange user route connects these pages to the ‘Discuss a project’ action.",
  },
  ua: {
    study: "ПРИКЛАД СТРАТЕГІЇ",
    goalLabel: "БІЗНЕС-ЦІЛЬ",
    goal: "Отримати звернення",
    home: "Головна",
    services: "Послуги",
    contact: "Контакт",
    action: "Обговорити проєкт",
    steps: ["Ціль", "Структура", "Маршрут"],
    caption: "Стратегія у трьох кроках: ціль «Отримати звернення» стає картою сайту зі сторінками «Головна», «Послуги» та «Контакт». Помаранчевий шлях користувача поєднує ці сторінки з дією «Обговорити проєкт».",
  },
};

/** A business goal becomes a site map, then a clear route to an enquiry. */
export function CapabilityStrategyDemo({ locale }: { locale: "ua" | "en" }) {
  const t = copy[locale];

  return (
    <CapabilityDemoFrame
      locale={locale}
      kind="strategy"
      className="cst-demo"
      title={t.study}
      steps={t.steps}
      caption={t.caption}
    >
      <div className="cst-scene cmd-animated">
        <svg className="cst-connections" viewBox="0 0 300 216" preserveAspectRatio="none" fill="none">
          <path className="cst-map-link cmd-animated" d="M150 58V78H42V116M84 116H108M192 116H216" />
          <path className="cst-action-link cmd-animated" d="M258 136V155H150V175" />
          <path className="cst-route cmd-animated" pathLength="100" d="M150 58V78H42V116H258V155H150V175" />
        </svg>

        <div className="cst-goal cmd-animated">
          <span className="cst-goal-label"><span className="cst-goal-dot" />{t.goalLabel}</span>
          <span className="cst-goal-title">{t.goal}</span>
        </div>

        <div className="cst-map">
          <div className="cst-node cst-node-home cmd-animated">
            <span className="cst-page-number">01</span>
            <span className="cst-page-title">{t.home}</span>
            <span className="cst-node-visited cst-home-visited cmd-animated" />
          </div>
          <div className="cst-node cst-node-services cmd-animated">
            <span className="cst-page-number">02</span>
            <span className="cst-page-title">{t.services}</span>
            <span className="cst-node-visited cst-services-visited cmd-animated" />
          </div>
          <div className="cst-node cst-node-contact cmd-animated">
            <span className="cst-page-number">03</span>
            <span className="cst-page-title">{t.contact}</span>
            <span className="cst-node-visited cst-contact-visited cmd-animated" />
          </div>
        </div>

        <div className="cst-cta cmd-animated">
          <span className="cst-cta-fill cmd-animated" />
          <span className="cst-cta-copy">{t.action}<span><CapabilityDemoArrow /></span></span>
        </div>
      </div>
    </CapabilityDemoFrame>
  );
}
