"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function CaseTaskMotion({ children }: { children: ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>(".case-task-row") ?? []);
    const mobile = window.matchMedia("(max-width: 760px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!mobile.matches) {
        rows.forEach(row => row.style.removeProperty("--step-progress"));
        return;
      }
      const viewport = Math.max(window.innerHeight, 1);
      // Match the homepage Process rows, including reverse scrolling and revisits.
      const progress = rows.map(row => reduced.matches ? 1 : Math.max(0, Math.min(1,
        (viewport * 0.88 - row.getBoundingClientRect().top) / (viewport * 0.56),
      )));
      rows.forEach((row, index) => row.style.setProperty("--step-progress", progress[index].toFixed(4)));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (mobile.matches) schedule();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    mobile.addEventListener("change", schedule);
    reduced.addEventListener("change", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      mobile.removeEventListener("change", schedule);
      reduced.removeEventListener("change", schedule);
      rows.forEach(row => row.style.removeProperty("--step-progress"));
    };
  }, [children]);

  return <div className="case-task-list case-task-progress" ref={listRef}>{children}</div>;
}
