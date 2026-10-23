"use client";

import { useId, useState } from "react";
import { TelegramIcon } from "./telegram-link";
import { UiArrow } from "./ui-arrow";
import "./chatbots-showcase.css";

const showcaseCopy = {
  ua: {
    caption: "Ілюстрація сценарію. Демонстраційні повідомлення.",
    controls: "Кроки демонстрації роботи бота",
    steps: ["Повідомлення клієнта", "Звернення у робочій групі", "Відповідь від HOVER"],
    explanations: [
      "Клієнт пише офіційному боту HOVER у Telegram. Для нього це один звичайний діалог зі студією.",
      "Звернення надходить у закриту робочу групу HOVER | CLIENT INBOX — в окремий внутрішній діалог цього клієнта.",
      "Менеджер використовує Reply на повідомлення клієнта. Відповідь повертається клієнту від імені HOVER.",
    ],
    clientView: "Що бачить клієнт",
    operatorView: "Як працює менеджер",
    clientDetail: "Один діалог із ботом студії",
    operatorDetail: "Окремий внутрішній діалог клієнта",
    bot: "бот студії",
    privateGroup: "закрита робоча група",
    client: "Клієнт",
    fromClient: "Повідомлення клієнта",
    fromHover: "Відповідь від HOVER",
    clientMessage: "Добрий день. Потрібен лендинг для нового продукту. Можемо обговорити задачу?",
    managerMessage: "Вітаю! Так. Напишіть, будь ласка, що це за продукт і що відвідувач має зробити на сторінці.",
    replyQuote: "Добрий день. Потрібен лендинг…",
    replyAction: "Reply → відповідь клієнту",
    internal: "Внутрішня нотатка",
    internalAudience: "Лише для команди",
    internalNote: "Уточнити продукт і ціль сторінки.",
    noteExplanation: "Звичайна внутрішня нотатка не є відповіддю клієнту.",
    flowLabel: "Напрямок повідомлень",
    flow: ["Клієнт", "Бот HOVER", "Робочий діалог", "Reply менеджера", "Клієнт"],
    privacy: "Клієнти не приєднуються до робочої групи. Команда працює з кожним зверненням в окремому діалозі.",
    demo: "ІЛЮСТРАЦІЯ",
  },
  en: {
    caption: "Workflow illustration. Sample messages.",
    controls: "Bot workflow demonstration steps",
    steps: ["Client message", "Enquiry in the working group", "Reply from HOVER"],
    explanations: [
      "A client messages HOVER’s official bot on Telegram. They see a single, ordinary conversation with the studio.",
      "The enquiry reaches the private HOVER | CLIENT INBOX working group, in a separate internal conversation for this client.",
      "The manager uses Reply on the client’s message. The response reaches the client from HOVER.",
    ],
    clientView: "What the client sees",
    operatorView: "How the manager works",
    clientDetail: "One conversation with the studio’s bot",
    operatorDetail: "A separate internal conversation for the client",
    bot: "studio bot",
    privateGroup: "private working group",
    client: "Client",
    fromClient: "Client message",
    fromHover: "Reply from HOVER",
    clientMessage: "Hello. We need a landing page for a new product. Could we discuss the project?",
    managerMessage: "Hello! Of course. Please tell us about the product and what you want visitors to do on the page.",
    replyQuote: "Hello. We need a landing page…",
    replyAction: "Reply → response to the client",
    internal: "Internal note",
    internalAudience: "Team only",
    internalNote: "Clarify the product and the page’s goal.",
    noteExplanation: "An ordinary internal note is not a response to the client.",
    flowLabel: "Message direction",
    flow: ["Client", "HOVER bot", "Working conversation", "Manager’s Reply", "Client"],
    privacy: "Clients do not join the working group. The team handles each enquiry in a separate conversation.",
    demo: "ILLUSTRATION",
  },
} as const;

function ReplyMark() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m8 5-5 5 5 5M3 10h8c3 0 5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatbotsShowcase({ locale }: { locale: "ua" | "en" }) {
  const copy = showcaseCopy[locale];
  const [step, setStep] = useState(0);
  const instanceId = useId();
  const sceneId = `${instanceId}-scene`;
  const explanationId = `${instanceId}-explanation`;

  return (
    <figure className="chatbots-showcase" data-step={step + 1}>
      <figcaption className="chatbots-showcase__caption">
        <span className="chatbots-showcase__caption-dot" aria-hidden="true" />
        {copy.caption}
      </figcaption>

      <div className="chatbots-showcase__controls" role="group" aria-label={copy.controls}>
        {copy.steps.map((title, index) => (
          <button
            className="chatbots-showcase__step"
            type="button"
            key={title}
            aria-pressed={step === index}
            aria-controls={`${sceneId} ${explanationId}`}
            onClick={() => setStep(index)}
          >
            <span className="chatbots-showcase__step-index" aria-hidden="true">0{index + 1}</span>
            <span>{title}</span>
            <UiArrow className="chatbots-showcase__step-arrow" />
          </button>
        ))}
      </div>

      <div className="chatbots-showcase__explanation" id={explanationId} aria-live="polite" aria-atomic="true">
        <span aria-hidden="true">0{step + 1} /</span>
        <p>{copy.explanations[step]}</p>
      </div>

      <div className="chatbots-showcase__scenes" id={sceneId}>
        <section className="chatbots-showcase__view chatbots-showcase__view--client" aria-labelledby={`${instanceId}-client-title`}>
          <div className="chatbots-showcase__view-heading">
            <h3 id={`${instanceId}-client-title`}>{copy.clientView}</h3>
            <p>{copy.clientDetail}</p>
          </div>
          <div className="chatbots-showcase__screen chatbots-showcase__screen--client" data-highlighted={step === 0 || step === 2}>
            <div className="chatbots-showcase__app-header">
              <span className="chatbots-showcase__avatar"><TelegramIcon /></span>
              <div><strong>HOVER</strong><span>{copy.bot}</span></div>
              <span className="chatbots-showcase__demo-tag">{copy.demo}</span>
            </div>
            <div className="chatbots-showcase__messages chatbots-showcase__messages--client">
              <div className="chatbots-showcase__bubble chatbots-showcase__bubble--outgoing" data-emphasized={step === 0}>
                <span className="chatbots-showcase__message-label">{copy.fromClient}</span>
                <p>{copy.clientMessage}</p>
              </div>
              <div className="chatbots-showcase__bubble chatbots-showcase__bubble--incoming" data-emphasized={step === 2}>
                <span className="chatbots-showcase__message-label">HOVER</span>
                <p>{copy.managerMessage}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="chatbots-showcase__view chatbots-showcase__view--operator" aria-labelledby={`${instanceId}-operator-title`}>
          <div className="chatbots-showcase__view-heading">
            <h3 id={`${instanceId}-operator-title`}>{copy.operatorView}</h3>
            <p>{copy.operatorDetail}</p>
          </div>
          <div className="chatbots-showcase__screen chatbots-showcase__screen--operator" data-highlighted={step === 1 || step === 2}>
            <div className="chatbots-showcase__app-header">
              <span className="chatbots-showcase__avatar chatbots-showcase__avatar--group" aria-hidden="true">H</span>
              <div><strong>HOVER | CLIENT INBOX</strong><span>{copy.privateGroup}</span></div>
              <span className="chatbots-showcase__demo-tag">{copy.demo}</span>
            </div>
            <div className="chatbots-showcase__thread-heading">
              <span className="chatbots-showcase__topic-icon" aria-hidden="true">#</span>
              <span>{copy.operatorDetail}</span>
              <span className="chatbots-showcase__thread-lock" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none"><rect x="4" y="7" width="8" height="6" rx="1" stroke="currentColor" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" /></svg>
              </span>
            </div>
            <div className="chatbots-showcase__messages chatbots-showcase__messages--operator">
              <div className="chatbots-showcase__bubble chatbots-showcase__bubble--incoming" data-emphasized={step === 1}>
                <span className="chatbots-showcase__message-label">{copy.fromClient}</span>
                <p>{copy.clientMessage}</p>
              </div>
              <div className="chatbots-showcase__reply" data-emphasized={step === 2}>
                <span className="chatbots-showcase__reply-action"><ReplyMark />{copy.replyAction}</span>
                <div className="chatbots-showcase__bubble chatbots-showcase__bubble--outgoing">
                  <div className="chatbots-showcase__quote"><strong>{copy.client}</strong><span>{copy.replyQuote}</span></div>
                  <p>{copy.managerMessage}</p>
                </div>
              </div>
              <aside className="chatbots-showcase__internal-note" aria-label={`${copy.internal}. ${copy.internalAudience}`}>
                <div><strong>{copy.internal}</strong><span>{copy.internalAudience}</span></div>
                <p>{copy.internalNote}</p>
                <span className="chatbots-showcase__internal-explainer">{copy.noteExplanation}</span>
              </aside>
            </div>
          </div>
        </section>
      </div>

      <div className="chatbots-showcase__flow">
        <span className="chatbots-showcase__flow-label">{copy.flowLabel}</span>
        <ol aria-label={copy.flowLabel}>
          {copy.flow.map((label, index) => (
            <li key={`${index}-${label}`} data-active={(step === 0 && index < 2) || (step === 1 && index === 2) || (step === 2 && index > 2)}>
              <span>{label}</span>
              {index < copy.flow.length - 1 && <UiArrow className="chatbots-showcase__flow-arrow" direction="right" />}
            </li>
          ))}
        </ol>
      </div>
      <p className="chatbots-showcase__privacy">{copy.privacy}</p>
    </figure>
  );
}
