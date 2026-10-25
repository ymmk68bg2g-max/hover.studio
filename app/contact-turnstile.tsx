"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ServiceLocale } from "./services";

type WidgetOptions = {
  sitekey: string;
  action: "contact";
  theme: "light";
  size: "flexible" | "compact";
  language: "uk" | "en";
  tabindex: number;
  "response-field": false;
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  "unsupported-callback": () => void;
};
type TurnstileApi = {
  render: (container: HTMLElement, options: WidgetOptions) => string;
  remove: (widgetId: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

const scriptId = "contact-turnstile-script";
let sharedLoader: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (sharedLoader) return sharedLoader;
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  const script = existing ?? document.createElement("script");
  let attemptedApi = window.turnstile;
  const loader = new Promise<TurnstileApi>((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };
    const failed = () => {
      if (settled) return;
      settled = true;
      cleanup();
      script.remove();
      if (attemptedApi && window.turnstile === attemptedApi) window.turnstile = undefined;
      reject(new Error("Verification could not load"));
    };
    const loaded = () => {
      if (settled) return;
      const api = window.turnstile;
      attemptedApi = api;
      if (!api || typeof api.render !== "function") { failed(); return; }
      // The load event follows API initialization; ready() rejects async/defer scripts.
      settled = true;
      cleanup();
      resolve(api);
    };
    const timeout = window.setTimeout(failed, 15_000);
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
    if (attemptedApi) loaded();
    else if (!existing) {
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  sharedLoader = loader;
  void loader.catch(() => { if (sharedLoader === loader) sharedLoader = null; });
  return loader;
}

const copy = {
  ua: {
    label: "Перевірка перед надсиланням",
    loading: "Готуємо перевірку…",
    ready: "Перевірку пройдено.",
    error: "Не вдалося завантажити або завершити перевірку. Спробуйте ще раз.",
    expired: "Термін перевірки минув. Пройдіть її ще раз перед надсиланням.",
    unavailable: "Надсилання тимчасово недоступне. Спробуйте пізніше або напишіть нам на email.",
    retry: "Повторити перевірку",
  },
  en: {
    label: "Verification before sending",
    loading: "Preparing verification…",
    ready: "Verification complete.",
    error: "Verification could not load or finish. Please try again.",
    expired: "Verification has expired. Please complete it again before sending.",
    unavailable: "Sending is temporarily unavailable. Please try again later or email us.",
    retry: "Retry verification",
  },
} as const;

export function ContactTurnstile({ locale, onToken, resetKey }: {
  locale: ServiceLocale;
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const t = copy[locale];
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const [retryKey, setRetryKey] = useState(0);
  const generation = `${locale}:${resetKey}:${retryKey}`;
  const [state, setState] = useState<{ generation: string; phase: "loading" | "ready" | "error" | "expired" }>({ generation, phase: "loading" });
  const phase = state.generation === generation ? state.phase : "loading";

  useEffect(() => { onTokenRef.current = onToken; }, [onToken]);

  useEffect(() => {
    const container = containerRef.current;
    if (!siteKey || !container) return;
    let cancelled = false;
    let api: TurnstileApi | undefined;
    let widgetId: string | undefined;
    let widgetGeneration = 0;
    let currentSize: WidgetOptions["size"] | undefined;
    let observer: ResizeObserver | undefined;
    const publish = (phase: "loading" | "ready" | "error" | "expired", token: string | null = null) => {
      if (cancelled) return;
      onTokenRef.current(token);
      setState({ generation, phase });
    };
    const draw = () => {
      if (cancelled || !api) return;
      const size = container.getBoundingClientRect().width < 300 ? "compact" : "flexible";
      if (size === currentSize) return;
      currentSize = size;
      const activeGeneration = ++widgetGeneration;
      if (widgetId !== undefined) {
        try { api.remove(widgetId); } catch { /* A removed widget must not block recovery. */ }
        widgetId = undefined;
      }
      publish("loading");
      const active = () => !cancelled && activeGeneration === widgetGeneration;
      try {
        widgetId = api.render(container, {
          sitekey: siteKey, action: "contact", theme: "light", size,
          language: locale === "ua" ? "uk" : "en", tabindex: 0, "response-field": false,
          callback: token => { if (active()) publish("ready", token); },
          "error-callback": () => { if (active()) publish("error"); },
          "expired-callback": () => { if (active()) publish("expired"); },
          "timeout-callback": () => { if (active()) publish("expired"); },
          "unsupported-callback": () => { if (active()) publish("error"); },
        });
      } catch { publish("error"); }
    };
    onTokenRef.current(null);
    loadTurnstile().then(loaded => {
      if (cancelled) return;
      api = loaded;
      draw();
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(draw);
        observer.observe(container);
      } else window.addEventListener("resize", draw);
    }).catch(() => publish("error"));
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", draw);
      if (widgetId !== undefined) {
        try { api?.remove(widgetId); } catch { /* The page may have already removed the widget. */ }
      }
      onTokenRef.current(null);
    };
  }, [generation, locale, siteKey]);

  const message = !siteKey ? t.unavailable : t[phase];
  const retryAvailable = Boolean(siteKey) && (phase === "error" || phase === "expired");
  return (
    <div className="contact-verification" role="group" aria-labelledby={`${id}-label`} aria-describedby={`${id}-status`}>
      <p className="contact-verification-label" id={`${id}-label`}>{t.label}</p>
      {siteKey ? <div className="contact-verification-widget" ref={containerRef} /> : null}
      <p className="contact-verification-status" id={`${id}-status`} role="status" aria-live="polite" aria-atomic="true">{message}</p>
      {retryAvailable ? <button className="contact-verification-retry" type="button" onClick={() => setRetryKey(value => value + 1)}>{t.retry}</button> : null}
    </div>
  );
}
