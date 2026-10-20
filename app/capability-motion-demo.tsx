"use client";

import { CapabilityDemoFrame } from "./capability-demo-frame";
import { CapabilityDemoArrow } from "./capability-demo-arrow";

const copy = {
  en: {
    study: "INTERACTION DEMO",
    draft: "DRAFT",
    live: "LIVE",
    project: "PROJECT 01",
    title: "Make it move.",
    note: "A new idea, ready to launch.",
    launch: "Launch project",
    complete: "Project is live.",
    completeNote: "Ready to explore.",
    view: "View project",
    steps: ["Appearance", "Interaction", "New state"],
    caption: "Motion in three steps: a project card appears, its button responds to a click, and the interface transitions to a completed state.",
  },
  ua: {
    study: "ПРИКЛАД ВЗАЄМОДІЇ",
    draft: "ЧЕРНЕТКА",
    live: "ОНЛАЙН",
    project: "ПРОЄКТ 01",
    title: "Ідея в русі.",
    note: "Новий задум, готовий до запуску.",
    launch: "Запустити проєкт",
    complete: "Проєкт онлайн.",
    completeNote: "Готовий до перегляду.",
    view: "Переглянути проєкт",
    steps: ["Поява", "Взаємодія", "Новий стан"],
    caption: "Motion у трьох кроках: з’являється картка проєкту, кнопка реагує на натискання, інтерфейс переходить у завершений стан.",
  },
};

/** A CSS-driven, visibility-aware interaction study. Every track shares a 9s loop. */
export function CapabilityMotionDemo({ locale }: { locale: "ua" | "en" }) {
  const t = copy[locale];
  return (
    <CapabilityDemoFrame locale={locale} kind="motion" title={t.study} steps={t.steps} caption={t.caption}>
      <div className="cmd-card cmd-animated">
        <div className="cmd-card-header">
          <span>{t.project}</span>
          <span className="cmd-status">
            <span className="cmd-status-dot" />
            <span className="cmd-status-copy"><span className="cmd-before cmd-animated">{t.draft}</span><span className="cmd-after cmd-animated">{t.live}</span></span>
          </span>
        </div>

        <div className="cmd-screen">
          <div className="cmd-screen-before cmd-before cmd-animated">
            <div className="cmd-preview">
              <span className="cmd-preview-block" />
              <span className="cmd-preview-line cmd-preview-line-one" />
              <span className="cmd-preview-line cmd-preview-line-two" />
              <span className="cmd-preview-detail">H<CapabilityDemoArrow /></span>
            </div>
            <span className="cmd-title">{t.title}</span>
            <span className="cmd-note">{t.note}</span>
          </div>
          <div className="cmd-screen-after cmd-after cmd-animated">
            <span className="cmd-complete-mark"><svg className="cmd-check cmd-animated" viewBox="0 0 32 32" fill="none"><path d="m8 16 5 5L24 10" /></svg></span>
            <span className="cmd-title">{t.complete}</span>
            <span className="cmd-note">{t.completeNote}</span>
          </div>
        </div>

        <div className="cmd-action cmd-animated">
          <span className="cmd-action-fill cmd-animated" />
          <span className="cmd-action-copy cmd-before cmd-animated">{t.launch}<span><CapabilityDemoArrow /></span></span>
          <span className="cmd-action-copy cmd-after cmd-animated">{t.view}<span><CapabilityDemoArrow /></span></span>
          <span className="cmd-click-ring cmd-animated" />
        </div>
        <svg className="cmd-cursor cmd-animated" viewBox="0 0 24 28" fill="none"><path d="M3 2v21l5.3-5.2 4.1 8.2 4-2-4.2-8.1H20L3 2Z" /></svg>
      </div>
    </CapabilityDemoFrame>
  );
}
