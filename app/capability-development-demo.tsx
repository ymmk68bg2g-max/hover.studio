import { CapabilityDemoFrame } from "./capability-demo-frame";
import { CapabilityDemoArrow } from "./capability-demo-arrow";

const copy = {
  ua: {
    study: "ВІД РЕДАКТОРА ДО САЙТУ",
    editor: "Редактор",
    website: "Сайт",
    field: "Заголовок",
    before: "Новий проєкт",
    after: "Ваш проєкт",
    save: "Зберегти",
    saved: "Збережено",
    draft: "Зміни в редакторі",
    published: "Оновлено на сайті",
    project: "ПРОЄКТ / 01",
    note: "Ваша ідея. Живий сайт.",
    steps: ["Редагування", "Оновлення", "Результат"],
    caption: "Розробка у трьох кроках: у редакторі заголовок «Новий проєкт» змінюється на «Ваш проєкт». Кнопка збереження передає оновлення на сайт, і сторінка показує новий заголовок.",
  },
  en: {
    study: "FROM EDITOR TO WEBSITE",
    editor: "Editor",
    website: "Website",
    field: "Title",
    before: "New project",
    after: "Your project",
    save: "Save",
    saved: "Saved",
    draft: "Changes in the editor",
    published: "Updated on the website",
    project: "PROJECT / 01",
    note: "Your idea. A living website.",
    steps: ["Edit", "Publish", "Result"],
    caption: "Development in three steps: the editor title changes from “New project” to “Your project”. The save button sends the update to the website, and the page displays the new title.",
  },
};

/** A title edit reaches the public page only after its save action. */
export function CapabilityDevelopmentDemo({ locale }: { locale: "ua" | "en" }) {
  const t = copy[locale];

  return (
    <CapabilityDemoFrame
      locale={locale}
      kind="development"
      title={t.study}
      steps={t.steps}
      caption={t.caption}
      className="cdev-demo"
    >
      <div className="cdev-workspace cmd-animated">
        <div className="cdev-pane cdev-editor">
          <div className="cdev-pane-header">
            <span className="cdev-pane-name">
              <svg viewBox="0 0 16 16"><path d="M3 3h10v10H3zM3 6h10M6 6v7" /></svg>
              {t.editor}
            </span>
            <span className="cdev-pane-type">CMS</span>
          </div>
          <div className="cdev-editor-body">
            <div className="cdev-field">
              <span className="cdev-field-label">{t.field}</span>
              <div className="cdev-field-value">
                <span className="cdev-editor-before cmd-animated">{t.before}</span>
                <span className="cdev-editor-after cmd-animated">{t.after}<i className="cdev-caret cmd-animated" /></span>
                <span className="cdev-field-focus cmd-animated" />
              </div>
            </div>
            <div className="cdev-editor-footer">
              <span className="cdev-draft-note">{t.draft}</span>
              <div className="cdev-save cmd-animated">
                <span className="cdev-save-before cmd-animated">{t.save}<span><CapabilityDemoArrow /></span></span>
                <span className="cdev-save-after cmd-animated">{t.saved}<svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" /></svg></span>
                <span className="cdev-save-pulse cmd-animated" />
              </div>
            </div>
          </div>
        </div>

        <div className="cdev-transfer">
          <span className="cdev-transfer-line" />
          <span className="cdev-transfer-packet cmd-animated" />
          <svg className="cdev-transfer-arrow" viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
        </div>

        <div className="cdev-pane cdev-website">
          <div className="cdev-pane-header">
            <span className="cdev-pane-name">
              <svg viewBox="0 0 16 16"><path d="M2 3h12v10H2zM2 6h12M4 4.5h1M6 4.5h1" /></svg>
              {t.website}
            </span>
            <span className="cdev-site-mark">H<CapabilityDemoArrow /></span>
          </div>
          <div className="cdev-site-body">
            <div className="cdev-site-art">
              <span className="cdev-art-disc" />
              <span className="cdev-art-line" />
              <span className="cdev-art-number">01</span>
            </div>
            <div className="cdev-site-copy">
              <span className="cdev-site-eyebrow">{t.project}</span>
              <div className="cdev-site-title">
                <span className="cdev-site-before cmd-animated">{t.before}</span>
                <span className="cdev-site-after cmd-animated">{t.after}</span>
              </div>
              <span className="cdev-site-note">{t.note}</span>
            </div>
            <span className="cdev-site-update cmd-animated" />
          </div>
        </div>
        <span className="cdev-published cmd-animated"><span />{t.published}</span>
      </div>
    </CapabilityDemoFrame>
  );
}
