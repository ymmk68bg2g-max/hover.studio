"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

type Locale = "ua" | "en";
type Point = { x: number; y: number };
type Box = Point & { width: number; height: number };
type Signal = { x: number; y: number; point: Point; path: string; visible: boolean };
type Layout = { width: number; height: number; signals: Signal[] };
const signals = [
  { x: .57, y: .33, labelX: .51, labelY: .22, ua: "ГЕНЕРАЦІЯ", en: "GENERATION" },
  { x: .64, y: .67, labelX: .70, labelY: .82, ua: "НАКОПИЧЕННЯ", en: "STORAGE" },
  { x: .80, y: .49, labelX: .81, labelY: .62, ua: "ПІДСТАНЦІЯ", en: "SUBSTATION" },
  { x: .937, y: .32, labelX: .88, labelY: .18, ua: "МЕРЕЖА", en: "GRID" },
  { x: .82, y: .29, labelX: .73, labelY: .37, ua: "СПОЖИВАННЯ", en: "CONSUMPTION" },
] as const;
const copy = {
  ua: { lines: ["Будуємо", "енергетичні", "міста."], kicker: "ХОЛДИНГ ЕНЕРГЕТИЧНОЇ ІНФРАСТРУКТУРИ", country: "УКРАЇНА / 2026", coordinates: "50°27′ пн. ш. / 30°31′ сх. д.", status: "ЕНЕРГОСИСТЕМА ПРАЦЮЄ", scroll: "ПРОКРУТІТЬ ДАЛІ" },
  en: { lines: ["We build", "energy", "cities."], kicker: "ENERGY INFRASTRUCTURE HOLDING", country: "UKRAINE / 2026", coordinates: "50°27′ N / 30°31′ E", status: "ENERGY SYSTEM ONLINE", scroll: "SCROLL TO EXPLORE" },
} as const;
const overlaps = (first: Box, second: Box) => first.x < second.x + second.width && first.x + first.width > second.x
  && first.y < second.y + second.height && first.y + first.height > second.y;

// Flow coordinates exclude the reveal transform, keeping the labels stationary.
function boxWithin(element: HTMLElement, stage: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let current: HTMLElement | null = element;
  while (current && current !== stage) {
    x += current.offsetLeft;
    y += current.offsetTop;
    const parent = current.offsetParent as HTMLElement | null;
    if (parent && parent !== stage) { x += parent.clientLeft; y += parent.clientTop; }
    current = parent;
  }
  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

export function SolarCityHeroShowcase({ locale, caption, note }: { locale: Locale; caption?: string; note?: string }) {
  const stageRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const signalRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [reduced, setReduced] = useState(true);
  const [manualPause, setManualPause] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const id = "solarcity-hero-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const paused = manualPause ?? reduced;
  const t = copy[locale];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => { setReduced(preference.matches); setManualPause(null); };
    const updateVisibility = () => setHidden(document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setRevealed(true);
    }, { threshold: 0 }) : null;
    if (observer && stageRef.current) observer.observe(stageRef.current);
    else { setVisible(true); setRevealed(true); }
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const image = imageRef.current;
    const heading = headingRef.current;
    if (!stage || !image || !heading) return;
    let disposed = false;
    const measure = () => {
      if (disposed || !image.naturalWidth || !image.naturalHeight || !stage.clientWidth || !stage.clientHeight) return;
      const labels = signalRefs.current.filter((label): label is HTMLSpanElement => label !== null);
      if (labels.length !== signals.length) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const [positionX, positionY] = getComputedStyle(image).objectPosition.split(/\s+/).map(value => Number.parseFloat(value) / 100);
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const offsetX = (width - image.naturalWidth * scale) * (Number.isFinite(positionX) ? positionX : .64);
      const offsetY = (height - image.naturalHeight * scale) * (Number.isFinite(positionY) ? positionY : .5);
      const project = (x: number, y: number): Point => ({ x: offsetX + x * image.naturalWidth * scale, y: offsetY + y * image.naturalHeight * scale });
      const title = boxWithin(heading, stage);
      const revealTravel = Math.max(12, Math.min(24, width * .015));
      const occupied: Box[] = [{ x: title.x - 12, y: title.y - 12, width: title.width + 24, height: title.height + 24 + revealTravel }];
      for (const element of [kickerRef.current, footerRef.current]) {
        if (element) {
          const box = boxWithin(element, stage);
          occupied.push({ x: box.x - 6, y: box.y - 6, width: box.width + 12, height: box.height + 12 });
        }
      }
      const placements = signals.map((signal, index): Signal => {
        const point = project(signal.x, signal.y);
        const preferred = project(signal.labelX, signal.labelY);
        const labelWidth = labels[index].offsetWidth;
        const labelHeight = labels[index].offsetHeight;
        if (width <= 480) { preferred.x = point.x - labelWidth / 2; preferred.y = point.y - 56; }
        const clamp = (value: number, extent: number, size: number) => Math.max(16, Math.min(extent - size - 16, value));
        let box: Box = { x: clamp(preferred.x, width, labelWidth), y: clamp(preferred.y, height, labelHeight), width: labelWidth, height: labelHeight };
        for (const dy of [0, -labelHeight - 14, labelHeight + 14, -2 * labelHeight - 28, 2 * labelHeight + 28]) {
          const candidate = { ...box, y: clamp(preferred.y + dy, height, labelHeight) };
          if (!occupied.some(other => overlaps(candidate, other))) { box = candidate; break; }
        }
        const visible = point.x > 10 && point.x < width - 10 && point.y > 10 && point.y < height - 10
          && box.x + labelWidth <= width - 10 && box.y + labelHeight <= height - 10 && !occupied.some(other => overlaps(box, other));
        if (visible) occupied.push({ x: box.x - 5, y: box.y - 5, width: labelWidth + 10, height: labelHeight + 10 });
        const startX = Math.max(box.x, Math.min(box.x + labelWidth, point.x));
        const startY = Math.max(box.y, Math.min(box.y + labelHeight, point.y));
        const midX = (startX + point.x) / 2;
        return { x: box.x, y: box.y, point, visible, path: "M" + startX + " " + startY + " L" + midX + " " + startY + " L" + midX + " " + point.y + " L" + point.x + " " + point.y };
      });
      const next = { width, height, signals: placements };
      setLayout(previous => previous && previous.width === width && previous.height === height
        && previous.signals.every((signal, index) => signal.path === placements[index].path && signal.visible === placements[index].visible) ? previous : next);
    };
    measure();
    image.addEventListener("load", measure);
    const observer = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    observer?.observe(stage);
    observer?.observe(heading);
    if (!observer) window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    document.fonts?.addEventListener("loadingdone", measure);
    return () => {
      disposed = true;
      observer?.disconnect();
      image.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [locale]);

  return <figure className="sc-hero-showcase" data-solarcity-hero data-running={!paused && visible && !hidden} data-reduced={reduced && manualPause !== false}>
    <section className="sh-stage" ref={stageRef} data-ready={layout !== null} data-revealed={revealed} aria-labelledby={id}>
      <div className="sh-media" aria-hidden="true">
        <img className="sh-image" ref={imageRef} src="/case/solarcity/energy-campus.webp" width="1672" height="941" loading="lazy" decoding="async" alt="" />
        <div className="sh-shade" />
        <svg className="sh-network" viewBox={"0 0 " + (layout?.width ?? 1672) + " " + (layout?.height ?? 941)} preserveAspectRatio="none">
          {layout?.signals.map((signal, index) => signal.visible && <g key={index}><path d={signal.path} /><circle cx={signal.point.x} cy={signal.point.y} r="3.5" /></g>)}
        </svg>
        {signals.map((signal, index) => <span className="sh-signal" key={index} ref={element => { signalRefs.current[index] = element; }} data-visible={layout?.signals[index].visible ?? false} style={{ left: layout?.signals[index].x ?? 0, top: layout?.signals[index].y ?? 0 }}>{signal[locale]}</span>)}
      </div>
      <div className="sh-content">
        <div className="sh-kicker sh-reveal" ref={kickerRef}><span>{t.kicker}</span><span>{t.country}</span></div>
        <div className="sh-copy"><h3 className="sh-heading sh-reveal" ref={headingRef} id={id}><span>{t.lines[0]}</span><span>{t.lines[1]}</span><span><em>{t.lines[2]}</em></span></h3></div>
        <div className="sh-footer" ref={footerRef} aria-hidden="true"><span>{t.coordinates}</span><span className="sh-status"><i />{t.status}</span><span>{t.scroll}</span></div>
      </div>
    </section>
    <figcaption className="sh-credit sc-media-credit content-meta">
      <div className="sh-credit-copy sc-media-credit-copy">{caption}{note ? <span className="sh-credit-note sc-media-credit-note">{note}</span> : null}</div>
      <button className="sh-pause sc-media-pause" type="button" aria-pressed={paused} aria-label={paused ? (locale === "ua" ? "Відтворити анімацію HERO" : "Play hero animation") : (locale === "ua" ? "Призупинити анімацію HERO" : "Pause hero animation")} onClick={() => setManualPause(!paused)}>{paused ? (locale === "ua" ? "ВІДТВОРИТИ" : "PLAY") : (locale === "ua" ? "ПАУЗА" : "PAUSE")}</button>
    </figcaption>
  </figure>;
}
