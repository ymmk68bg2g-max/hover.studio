import { CapabilityDemoFrame } from "./capability-demo-frame";
import { CapabilityDemoArrow } from "./capability-demo-arrow";

const copy = {
  en: {
    study: "DESIGN DEMO",
    nav: "Projects",
    titleLead: "Your next",
    titleEnd: "project",
    note: "From idea to launch.",
    action: "View project",
    steps: ["Wireframe", "Style", "Responsive"],
    caption: "Design in three steps: a gray page wireframe gains HOVER colors and an orange mineral illustration, then the same heading, image, and button adapt to a mobile layout.",
  },
  ua: {
    study: "ПРИКЛАД ДИЗАЙНУ",
    nav: "Проєкти",
    titleLead: "Ваш новий",
    titleEnd: "проєкт",
    note: "Від ідеї до запуску.",
    action: "Переглянути",
    steps: ["Прототип", "Стиль", "Адаптив"],
    caption: "Дизайн у трьох кроках: сірий прототип сторінки набуває кольорів HOVER та помаранчевої ілюстрації мінералу, а ті самі заголовок, зображення й кнопка адаптуються до мобільного екрана.",
  },
};

type DesignCopy = (typeof copy)["en"];

/** All three layouts use the same content and artwork throughout the study. */
function DesignPage({ t }: { t: DesignCopy }) {
  return (
    <div className="cds-page">
      <div className="cds-site-header">
        <span className="cds-wordmark">HOVER</span>
        <span className="cds-nav">{t.nav}<span><CapabilityDemoArrow /></span></span>
      </div>
      <div className="cds-page-body">
        <div className="cds-copy">
          <span className="cds-title"><span>{t.titleLead}</span>{" "}<span>{t.titleEnd}</span></span>
          <span className="cds-note">{t.note}</span>
        </div>
        <div className="cds-artwork">
          <svg className="cds-art" viewBox="0 0 180 120" fill="none">
            <path className="cds-art-orbit" d="M15 93h150M90 14v91" />
            <path className="cds-mineral-shadow" d="m26 94 55-12 72 10-55 14-72-12Z" />
            <path className="cds-mineral-main" d="m35 76 20-48 49-10 42 51-30 26-57-2-24-17Z" />
            <path className="cds-mineral-light" d="m55 28 49-10-18 41-51 17 20-48Z" />
            <path className="cds-mineral-dark" d="m86 59 18-41 42 51-30 26-30-36Z" />
            <path className="cds-mineral-warm" d="m35 76 51-17 30 36-57-2-24-17Z" />
            <path className="cds-mineral-edge" d="m55 28 31 31 30 36M86 59l60 10" />
            <path className="cds-mineral-chip" d="m142 36 13-5 9 13-13 10-9-18ZM19 94l9-4 7 8-9 6-7-10Z" />
          </svg>
        </div>
        <span className="cds-action">{t.action}<span><CapabilityDemoArrow /></span></span>
      </div>
    </div>
  );
}

export function CapabilityDesignDemo({ locale }: { locale: "ua" | "en" }) {
  const t = copy[locale];

  return (
    <CapabilityDemoFrame locale={locale} kind="design" title={t.study} steps={t.steps} caption={t.caption} className="cds-demo">
      <div className="cds-scene">
        <div className="cds-device cds-wireframe cmd-animated"><DesignPage t={t} /></div>
        <div className="cds-device cds-styled cmd-animated"><DesignPage t={t} /></div>
        <div className="cds-device cds-responsive cmd-animated"><DesignPage t={t} /></div>
        <span className="cds-size-guide cds-guide-wide cmd-animated"><span /><span /></span>
        <span className="cds-size-guide cds-guide-mobile cmd-animated"><span /><span /></span>
      </div>
    </CapabilityDemoFrame>
  );
}
