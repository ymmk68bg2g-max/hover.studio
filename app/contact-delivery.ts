import type { ContactPayload } from "./contact-schema";
import { getService } from "./services";

const budgetLabels = {
  ua: {
    "tier-1": "35–55 ТИС. ГРН",
    "tier-2": "55–80 ТИС. ГРН",
    "tier-3": "80–150 ТИС. ГРН",
    "tier-4": "150 ТИС.+ ГРН",
    "not-sure": "Ще не визначився",
  },
  en: {
    "tier-1": "$850–$1,350",
    "tier-2": "$1,350–$1,950",
    "tier-3": "$1,950–$3,650",
    "tier-4": "$3,650+",
    "not-sure": "Not sure yet",
  },
} as const;

export function isFormSubmitEndpoint(endpoint: URL) {
  return endpoint.origin === "https://formsubmit.co"
    && !endpoint.username && !endpoint.password
    && /^\/ajax\/[^/]+\/?$/.test(endpoint.pathname);
}

export function formSubmitPayload(data: ContactPayload, formUrl: string) {
  const service = data.serviceId === "not-sure"
    ? (data.locale === "ua" ? "Потрібна консультація" : "Not sure yet")
    : getService(data.locale, data.serviceId).formLabel;

  return {
    _subject: `HOVER.STUDIO — Нова заявка / ${service}`,
    _template: "table",
    _captcha: "false",
    _url: formUrl,
    _replyto: data.email,
    name: data.name,
    email: data.email,
    "Компанія / Company": data.company || "—",
    "Послуга / Service": service,
    "Бюджет / Budget": budgetLabels[data.locale][data.budgetId],
    "Мова / Language": data.locale.toUpperCase(),
    "Повідомлення / Message": data.message,
  };
}

export function isFormSubmitAccepted(body: { success?: unknown } | null) {
  return body?.success === true || body?.success === "true";
}

export function needsFormSubmitActivation(body: { message?: unknown } | null) {
  return typeof body?.message === "string" && /needs activation|activate (?:the |your )?form/i.test(body.message);
}
