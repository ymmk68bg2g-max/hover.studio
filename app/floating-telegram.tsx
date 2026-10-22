"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { SiteLocale } from "./site-chrome";
import { TELEGRAM_URL, TelegramIcon, telegramCopy } from "./telegram-link";

export function FloatingTelegram({ fallbackLocale }: { fallbackLocale: SiteLocale }) {
  const pathname = usePathname();
  const routeLocale = pathname.split("/")[1];
  const locale = routeLocale === "ua" || routeLocale === "en" ? routeLocale : fallbackLocale;
  const [obscured, setObscured] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dismissTooltip = (event: KeyboardEvent) => {
      if (event.key === "Escape" && linkRef.current?.matches(":hover, :focus-within")) {
        setTooltipDismissed(true);
      }
    };
    document.addEventListener("keydown", dismissTooltip);
    return () => document.removeEventListener("keydown", dismissTooltip);
  }, []);

  useEffect(() => {
    // Contact fields and footer links retain the corner while on screen. A future
    // consent panel can use the same opt-in blocker without coupling components.
    const blockers = document.querySelectorAll(".contact-form-wrap, [data-site-footer], [data-floating-contact-blocker]");
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      setObscured(visible.size > 0);
    });
    blockers.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <a
      ref={linkRef}
      className="telegram-float"
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={telegramCopy[locale].label}
      aria-hidden={obscured || undefined}
      tabIndex={obscured ? -1 : undefined}
      data-floating-telegram
      data-obscured={obscured || undefined}
      data-tooltip-dismissed={tooltipDismissed || undefined}
      onBlur={() => setTooltipDismissed(false)}
      onPointerLeave={() => setTooltipDismissed(false)}
    >
      <TelegramIcon />
      <span className="telegram-float__tooltip" aria-hidden="true">{telegramCopy[locale].tooltip}</span>
    </a>
  );
}
