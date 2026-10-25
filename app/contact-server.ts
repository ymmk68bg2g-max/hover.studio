import type { ContactPayload } from "./contact-schema";
import { getService } from "./services";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";
const CONTACT_HOSTNAMES = new Set(["byhover.studio", "www.byhover.studio"]);
const CONTACT_FROM = "HOVER.STUDIO <notifications@forms.byhover.studio>";
const CONTACT_TO = "byhover.studio@gmail.com";

type ContactServerConfig = { turnstileSecret: string; resendApiKey: string };
type VerificationResult = { ok: true } | {
  ok: false;
  status: 403 | 503;
  code: "BOT_VERIFICATION_FAILED" | "VERIFICATION_UNAVAILABLE";
};
type DeliveryResult = { ok: true } | {
  ok: false;
  status: 503;
  code: "UPSTREAM_REJECTED" | "UPSTREAM_TIMEOUT" | "UPSTREAM_UNAVAILABLE";
};

export function contactServerConfig(): ContactServerConfig | null {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  return turnstileSecret && resendApiKey ? { turnstileSecret, resendApiKey } : null;
}

export function contactSubmissionId(value: unknown): string | null {
  return typeof value === "string" && value.length === 36
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value.toLowerCase()
    : null;
}

export function contactTurnstileToken(value: unknown): string | null {
  return typeof value === "string" && value.length <= 2048 && value.trim()
    ? value.trim()
    : null;
}

export async function verifyContactToken(token: string, config: ContactServerConfig): Promise<VerificationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const upstream = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ secret: config.turnstileSecret, response: token }),
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    if (!upstream.ok) return { ok: false, status: 503, code: "VERIFICATION_UNAVAILABLE" };
    const body: unknown = await upstream.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, status: 503, code: "VERIFICATION_UNAVAILABLE" };
    }
    const result = body as Record<string, unknown>;
    if (result.success !== true || result.action !== "contact"
      || typeof result.hostname !== "string" || !CONTACT_HOSTNAMES.has(result.hostname)) {
      return { ok: false, status: 403, code: "BOT_VERIFICATION_FAILED" };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 503, code: "VERIFICATION_UNAVAILABLE" };
  } finally {
    clearTimeout(timeout);
  }
}

const budgetLabels = {
  ua: { "tier-1": "35–55 ТИС. ГРН", "tier-2": "55–80 ТИС. ГРН", "tier-3": "80–150 ТИС. ГРН", "tier-4": "150 ТИС.+ ГРН", "not-sure": "Ще не визначився" },
  en: { "tier-1": "$850–$1,350", "tier-2": "$1,350–$1,950", "tier-3": "$1,950–$3,650", "tier-4": "$3,650+", "not-sure": "Not sure yet" },
} as const;

export async function sendContactEmail(data: ContactPayload, submissionId: string, config: ContactServerConfig): Promise<DeliveryResult> {
  const service = data.serviceId === "not-sure"
    ? (data.locale === "ua" ? "Потрібна консультація" : "Not sure yet")
    : getService(data.locale, data.serviceId).formLabel;
  // Keep the same payload for an explicit retry; no timestamp or challenge token.
  const text = [
    `Ім’я / Name: ${data.name}`,
    `Email: ${data.email}`,
    `Компанія / Company: ${data.company || "—"}`,
    `Послуга / Service: ${service}`,
    `Бюджет / Budget: ${budgetLabels[data.locale][data.budgetId]}`,
    `Мова / Language: ${data.locale.toUpperCase()}`,
    "",
    "Повідомлення / Message:",
    data.message,
  ].join("\n");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const upstream = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${config.resendApiKey}`,
        "Idempotency-Key": `contact/${submissionId}`,
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: data.email,
        subject: `HOVER.STUDIO — Нова заявка / ${service}`,
        text,
      }),
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    const body: unknown = await upstream.json().catch((error: unknown) => {
      if (error instanceof SyntaxError && !controller.signal.aborted) return null;
      throw error;
    });
    if (!upstream.ok || !body || typeof body !== "object" || Array.isArray(body)
      || typeof (body as Record<string, unknown>).id !== "string"
      || !(body as { id: string }).id.trim()) {
      return { ok: false, status: 503, code: "UPSTREAM_REJECTED" };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 503, code: controller.signal.aborted ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE" };
  } finally {
    clearTimeout(timeout);
  }
}
