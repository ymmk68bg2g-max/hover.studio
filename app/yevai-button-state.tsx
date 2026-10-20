"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectLocale } from "./projects";

export function YevaiButtonState({ hovered = false, locale }: { hovered?: boolean; locale: ProjectLocale }) {
  const [tapActive, setTapActive] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const label = locale === "ua" ? "Більше кейсів" : "More work";
  const state = locale === "ua" ? (hovered ? "при наведенні" : "звичайний стан") : (hovered ? "hover state" : "rest state");

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const replayTap = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setTapActive(false);
    window.requestAnimationFrame(() => {
      setTapActive(true);
      resetTimer.current = setTimeout(() => setTapActive(false), 900);
    });
  };

  return (
    <button
      type="button"
      className={`yevai-button-state${hovered ? " is-hovered" : ""}${tapActive ? " is-tapped" : ""}`}
      aria-label={`${label} — ${state}`}
      onClick={replayTap}
    >
      <span className="yevai-button-state-label">{label}</span>
      <span className="yevai-button-state-action">
        <span>INSTAGRAM</span>
        <span className="yevai-button-state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10" /></svg>
        </span>
      </span>
    </button>
  );
}
