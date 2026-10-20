"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CapabilityDemoArrow } from "./capability-demo-arrow";

export type CapabilityDemoKind = "strategy" | "design" | "development" | "motion";

type CapabilityDemoFrameProps = {
  locale: "ua" | "en";
  kind: CapabilityDemoKind;
  title: string;
  steps: readonly string[];
  caption: string;
  children: ReactNode;
  className?: string;
};

const controls = {
  en: { pause: "Pause", play: "Play", reduced: "Motion reduced" },
  ua: { pause: "Пауза", play: "Відтворити", reduced: "Рух вимкнено" },
};

/** Shared playback: CSS timelines retain their position while suspended. */
export function CapabilityDemoFrame({ locale, kind, title, steps, caption, children, className }: CapabilityDemoFrameProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const t = controls[locale];

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    const syncVisibility = () => setIsTabVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    media.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);

    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          const entry = entries.find((item) => item.target === element);
          if (entry) setIsVisible(entry.isIntersecting);
        }, { threshold: 0.15 });
    if (observer) observer.observe(element);
    else setIsVisible(true);

    return () => {
      observer?.disconnect();
      media.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const running = isVisible && isTabVisible && !reducedMotion && !manuallyPaused;
  const controlLabel = reducedMotion ? t.reduced : manuallyPaused ? t.play : t.pause;

  return (
    <figure
      ref={rootRef}
      className={`cmd-motion${className ? ` ${className}` : ""}`}
      data-capability-demo={kind}
      data-capability-motion={kind === "motion" ? true : undefined}
      data-running={running}
      data-reduced={reducedMotion}
    >
      <div className="cmd-stage" aria-hidden="true">
        <div className="cmd-stage-meta"><span>{title}</span><span className="cmd-stage-mark">H<CapabilityDemoArrow /></span></div>
        {children}
        <span className="cmd-stage-corner cmd-stage-corner-left" />
        <span className="cmd-stage-corner cmd-stage-corner-right" />
      </div>
      <div className="cmd-footer">
        <div className="cmd-steps" aria-hidden="true">
          {steps.map((step, index) => (
            <div className={`cmd-step cmd-step-${index + 1}`} key={step}>
              <span className="cmd-step-number cmd-animated">{String(index + 1).padStart(2, "0")}</span>
              <span className="cmd-step-label cmd-animated">{step}</span>
              <span className="cmd-step-track"><span className="cmd-step-progress cmd-animated" /></span>
            </div>
          ))}
        </div>
        <button className="cmd-control" type="button" aria-label={`${controlLabel}: ${title}`} aria-pressed={manuallyPaused} disabled={reducedMotion} onClick={() => setManuallyPaused((paused) => !paused)}>
          <span className="cmd-control-icon" aria-hidden="true">
            {manuallyPaused || reducedMotion
              ? <svg viewBox="0 0 16 16"><path d="m5 3 7 5-7 5V3Z" /></svg>
              : <svg viewBox="0 0 16 16"><path d="M5 3v10M11 3v10" /></svg>}
          </span>
          <span>{controlLabel}</span>
        </button>
      </div>
      <figcaption className="cmd-accessible-caption">{caption}</figcaption>
    </figure>
  );
}
