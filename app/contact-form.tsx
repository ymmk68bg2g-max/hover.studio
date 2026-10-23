"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { contactIntegrationStatus, privacyPublicationStatus } from "./client-experience-config";
import { contactEmail } from "./contact-settings";
import { CONTACT_REQUEST_TIMEOUT_MS, submitContactRequest } from "./contact-request";
import {
  budgetIds,
  validateContactPayload,
  type ContactField,
} from "./contact-schema";
import { getServices, type ServiceLocale, type ServiceSlug } from "./services";

type FormStatus = "idle" | "loading" | "success" | "validation" | "server" | "network" | "timeout";

const copy = {
  en: {
    fields: { name: "NAME", email: "EMAIL", company: "COMPANY", serviceId: "PROJECT TYPE", budgetId: "BUDGET", message: "MESSAGE" },
    select: "SELECT",
    notSureService: "Not sure yet",
    budgets: ["$850–$1,350", "$1,350–$1,950", "$1,950–$3,650", "$3,650+", "Not sure yet"],
    send: "SEND",
    sending: "Sending…",
    successThanks: "THANK YOU!",
    successConfirmation: "YOUR ENQUIRY HAS BEEN SENT.",
    successBody: "We’ll review the details and reply to the email address you provided.",
    reset: "NEW ENQUIRY",
    required: "Required",
    validation: "Check the marked fields and try again.",
    server: `Submission is currently unavailable. Your entries remain in the form. You can also email ${contactEmail}.`,
    network: "We couldn’t reach the server. Check your connection and try again.",
    timeout: `We couldn’t confirm that the enquiry was received. Your entries remain in the form. You can contact us at ${contactEmail} to check.`,
    fieldError: "Check this field.",
    emailError: "Enter a valid email address.",
    pendingNotice: "The secure delivery channel is still being configured. The form will never show success unless the server confirms receipt.",
    privacyNotice: "We use the details in this form only to review and reply to your enquiry.",
    privacyLink: "Privacy Policy",
  },
  ua: {
    fields: { name: "ІМ’Я", email: "EMAIL", company: "КОМПАНІЯ", serviceId: "ТИП ПРОЄКТУ", budgetId: "БЮДЖЕТ", message: "ПОВІДОМЛЕННЯ" },
    select: "ОБЕРІТЬ",
    notSureService: "Потрібна консультація",
    budgets: ["35–55 ТИС. ГРН", "55–80 ТИС. ГРН", "80–150 ТИС. ГРН", "150 ТИС.+ ГРН", "Ще не визначився"],
    send: "НАДІСЛАТИ",
    sending: "Надсилаємо…",
    successThanks: "ДЯКУЄМО!",
    successConfirmation: "ЗАПИТ НАДІСЛАНО.",
    successBody: "Переглянемо деталі та відповімо на вказану електронну адресу.",
    reset: "НОВИЙ ЗАПИТ",
    required: "Обов’язкове поле",
    validation: "Перевірте позначені поля й спробуйте ще раз.",
    server: `Надсилання зараз недоступне. Дані залишилися у формі. Ви також можете написати на ${contactEmail}.`,
    network: "Не вдалося зв’язатися із сервером. Перевірте мережу та повторіть спробу.",
    timeout: `Не вдалося підтвердити отримання запиту. Дані залишилися у формі. Для уточнення напишіть на ${contactEmail}.`,
    fieldError: "Перевірте це поле.",
    emailError: "Вкажіть коректну електронну адресу.",
    pendingNotice: "Безпечний канал надсилання ще налаштовується. Форма не покаже успіх без підтвердження сервера.",
    privacyNotice: "Використовуємо дані з форми лише для розгляду звернення та відповіді на нього.",
    privacyLink: "Політика конфіденційності",
  },
} as const;

function Arrow() {
  return (
    <span className="ui-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" focusable="false"><path d="M3.25 12.75 12.75 3.25M6 3.25h6.75V10" /></svg>
    </span>
  );
}

export function ContactForm({ locale, initialService, preselectionKey }: { locale: ServiceLocale; initialService?: ServiceSlug; preselectionKey?: string }) {
  const t = copy[locale];
  const services = getServices(locale);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [selection, setSelection] = useState({ requested: initialService, context: preselectionKey, value: initialService ?? "" });
  // A service CTA may update the shared, already mounted form. Only its service changes.
  if (selection.requested !== initialService || selection.context !== preselectionKey) {
    setSelection({ requested: initialService, context: preselectionKey, value: initialService ?? selection.value });
  }
  const serviceId = selection.value;
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!["success", "server", "network", "timeout"].includes(status)) return;
    const confirmation = statusRef.current;
    if (!confirmation) return;
    if (status !== "success" || !window.matchMedia("(max-width: 760px)").matches) {
      confirmation.focus();
      return;
    }

    // Release the keyboard without letting focus choose the scroll position.
    confirmation.focus({ preventScroll: true });
    const viewport = window.visualViewport;
    let timer = 0;
    let frame = 0;
    let expiry = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      window.clearTimeout(timer);
      window.clearTimeout(expiry);
      window.cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", schedule);
      window.removeEventListener("resize", schedule);
      for (const event of ["pointerdown", "touchstart", "wheel", "keydown"]) {
        window.removeEventListener(event, stop);
      }
    };

    const center = () => {
      if (stopped) return;
      if (!confirmation.isConnected || (viewport && Math.abs(viewport.scale - 1) > 0.01)
        || !window.matchMedia("(max-width: 760px)").matches) {
        stop();
        return;
      }
      const rect = confirmation.getBoundingClientRect();
      const viewportTop = viewport?.offsetTop ?? 0;
      const headerBottom = document.querySelector<HTMLElement>("[data-site-header]")?.getBoundingClientRect().bottom ?? 0;
      const top = Math.max(viewportTop, headerBottom) + 16;
      const bottom = viewportTop + (viewport?.height ?? window.innerHeight) - 16;
      const desiredTop = top + Math.max(0, (bottom - top - rect.height) / 2);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = Math.max(0, Math.min(maxScroll, window.scrollY + rect.top - desiredTop));
      if (Math.abs(target - window.scrollY) > 2) window.scrollTo({ top: target, behavior: "instant" });
    };

    function schedule() {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      timer = window.setTimeout(() => { frame = window.requestAnimationFrame(center); }, 150);
    }

    // Recheck only while the mobile keyboard and browser bars are settling.
    viewport?.addEventListener("resize", schedule);
    window.addEventListener("resize", schedule);
    for (const event of ["pointerdown", "touchstart", "wheel", "keydown"]) {
      window.addEventListener(event, stop, { passive: true });
    }
    timer = window.setTimeout(() => { frame = window.requestAnimationFrame(center); }, 350);
    expiry = window.setTimeout(stop, 1200);
    return stop;
  }, [status]);

  const fieldError = (field: ContactField) => errors[field]
    ? (field === "email" ? t.emailError : t.fieldError)
    : undefined;

  const fieldProps = (field: ContactField) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `contact-${locale}-${field}-error` : undefined,
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const payload = {
      locale,
      name: String(values.get("name") ?? ""),
      email: String(values.get("email") ?? ""),
      company: String(values.get("company") ?? ""),
      serviceId,
      budgetId: String(values.get("budgetId") ?? ""),
      message: String(values.get("message") ?? ""),
      website: String(values.get("website") ?? ""),
    };
    const parsed = validateContactPayload(payload);

    if (!parsed.ok) {
      setErrors(parsed.fieldErrors);
      setStatus("validation");
      const first = Object.keys(parsed.fieldErrors)[0] as ContactField | undefined;
      const element = first ? form.elements.namedItem(first) : null;
      if (element instanceof HTMLElement) requestAnimationFrame(() => element.focus());
      return;
    }

    setErrors({});
    setStatus("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CONTACT_REQUEST_TIMEOUT_MS);

    try {
      const { status: responseStatus, result } = await submitContactRequest(payload, controller.signal);

      if (responseStatus === 422 && result?.code === "VALIDATION_ERROR") {
        const fieldErrors = result.fieldErrors ?? {};
        setErrors(fieldErrors);
        setStatus("validation");
        const first = Object.keys(fieldErrors)[0] as ContactField | undefined;
        const element = first ? form.elements.namedItem(first) : null;
        if (element instanceof HTMLElement) requestAnimationFrame(() => element.focus());
        return;
      }
      if (responseStatus >= 200 && responseStatus < 300 && result?.ok === true) {
        setStatus("success");
        return;
      }
      setStatus(result?.code === "UPSTREAM_TIMEOUT" ? "timeout" : "server");
    } catch (error) {
      setStatus(error instanceof Error && error.name === "AbortError" ? "timeout" : "network");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  if (status === "success") {
    return (
      <div className="form-success" ref={statusRef} role="status" tabIndex={-1}>
        <span>01 / OK</span>
        <h3>{t.successThanks}{" "}<span className="form-success-confirmation">{t.successConfirmation}</span></h3>
        <p>{t.successBody}</p>
        <button type="button" onClick={() => setStatus("idle")}>{t.reset} ↗</button>
      </div>
    );
  }

  const statusMessage = status === "loading" ? t.sending
    : status === "validation" ? t.validation
    : status === "server" ? t.server
    : status === "network" ? t.network
    : status === "timeout" ? t.timeout
    : "";

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <label>
        <span>{t.fields.name} <i aria-hidden="true">*</i></span>
        <input name="name" autoComplete="name" maxLength={120} required {...fieldProps("name")} />
        {fieldError("name") && <small id={`contact-${locale}-name-error`}>{fieldError("name")}</small>}
      </label>
      <label>
        <span>{t.fields.email} <i aria-hidden="true">*</i></span>
        <input name="email" type="email" autoComplete="email" maxLength={254} required {...fieldProps("email")} />
        {fieldError("email") && <small id={`contact-${locale}-email-error`}>{fieldError("email")}</small>}
      </label>
      <label>
        <span>{t.fields.company}</span>
        <input name="company" autoComplete="organization" maxLength={160} {...fieldProps("company")} />
        {fieldError("company") && <small id={`contact-${locale}-company-error`}>{fieldError("company")}</small>}
      </label>
      <label>
        <span>{t.fields.serviceId} <i aria-hidden="true">*</i></span>
        <NativeSelect name="serviceId" required value={serviceId} onChange={(event) => setSelection({ requested: initialService, context: preselectionKey, value: event.target.value })} {...fieldProps("serviceId")}>
          <NativeSelectOption value="" disabled>{t.select}</NativeSelectOption>
          {services.map((service) => <NativeSelectOption value={service.id} key={service.id}>{service.formLabel}</NativeSelectOption>)}
          <NativeSelectOption value="not-sure">{t.notSureService}</NativeSelectOption>
        </NativeSelect>
        {fieldError("serviceId") && <small id={`contact-${locale}-serviceId-error`}>{fieldError("serviceId")}</small>}
      </label>
      <label>
        <span>{t.fields.budgetId} <i aria-hidden="true">*</i></span>
        <NativeSelect name="budgetId" required defaultValue="" {...fieldProps("budgetId")}>
          <NativeSelectOption value="" disabled>{t.select}</NativeSelectOption>
          {budgetIds.map((value, index) => <NativeSelectOption value={value} key={value}>{t.budgets[index]}</NativeSelectOption>)}
        </NativeSelect>
        {fieldError("budgetId") && <small id={`contact-${locale}-budgetId-error`}>{fieldError("budgetId")}</small>}
      </label>
      <label className="full">
        <span>{t.fields.message} <i aria-hidden="true">*</i></span>
        <textarea name="message" rows={3} maxLength={4000} required {...fieldProps("message")} />
        {fieldError("message") && <small id={`contact-${locale}-message-error`}>{fieldError("message")}</small>}
      </label>
      <label className="contact-honeypot" aria-hidden="true">
        <span>Website</span><input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="form-status" aria-live="assertive" aria-atomic="true" ref={statusRef} role="status" tabIndex={-1}>
        {statusMessage}
      </div>
      <button type="submit" className="send-button" disabled={status === "loading"} aria-disabled={status === "loading"}>
        <span>{status === "loading" ? t.sending : t.send}</span><Arrow />
      </button>
      <div className="form-data-notice">
        <p>{contactIntegrationStatus === "pending" ? t.pendingNotice : t.privacyNotice}</p>
        {privacyPublicationStatus !== "hidden" ? <Link href={`/${locale}/privacy`}>{t.privacyLink} ↗</Link> : null}
      </div>
    </form>
  );
}
