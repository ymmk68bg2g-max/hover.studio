"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Locale = "ua" | "en";
type Words = readonly [string, string];
type Point = { x: number; y: number };
type Box = Point & { width: number; height: number };
type Placement = Box & { point: Point; path: string; visible: boolean };
type Layout = { width: number; height: number; markers: Placement[] };
const text = (locale: Locale, value: Words) => value[locale === "en" ? 1 : 0];

// Original normalized coordinates, labels and descriptions from SolarCity.
const markers = [
  { x: .56, y: .37, labelX: .49, labelY: .25, label: ["СОНЯЧНІ ПАНЕЛІ", "SOLAR PANELS"], index: ["01 / СОНЯЧНІ ПАНЕЛІ", "01 / SOLAR PANELS"], copy: ["Сонячна генерація формує базовий потік енергії для гібридної моделі.", "Solar generation provides the baseline energy flow for the hybrid model."] },
  { x: .36, y: .665, labelX: .22, labelY: .60, label: ["НАКОПИЧЕННЯ", "STORAGE"], index: ["02 / НАКОПИЧЕННЯ ЕНЕРГІЇ", "02 / ENERGY STORAGE"], copy: ["Система накопичення переносить енергію між різними періодами попиту та вартості.", "The storage system shifts energy between periods of different demand and value."] },
  { x: .42, y: .70, labelX: .46, labelY: .76, label: ["ПІДСТАНЦІЯ", "SUBSTATION"], index: ["03 / ПІДСТАНЦІЯ", "03 / SUBSTATION"], copy: ["Підстанція збирає потоки активу та готує їх до мережевої інтеграції.", "The substation collects the asset’s energy flows and prepares them for grid integration."] },
  { x: .849, y: .655, labelX: .74, labelY: .46, label: ["МЕРЕЖЕВЕ ПРИЄДНАННЯ", "GRID CONNECTION"], index: ["04 / МЕРЕЖЕВЕ ПРИЄДНАННЯ", "04 / GRID CONNECTION"], copy: ["Точка приєднання поєднує комплекс з енергосистемою та ринковою моделлю.", "The connection point links the complex to the energy system and its market model."] },
] satisfies { x: number; y: number; labelX: number; labelY: number; label: Words; index: Words; copy: Words }[];

function overlaps(first: Box, second: Box) {
  return first.x < second.x + second.width && first.x + first.width > second.x
    && first.y < second.y + second.height && first.y + first.height > second.y;
}

function placeMarkers(width: number, height: number, image: HTMLImageElement, buttons: readonly HTMLButtonElement[]): Layout {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const offsetX = (width - image.naturalWidth * scale) / 2;
  const offsetY = (height - image.naturalHeight * scale) / 2;
  const project = (x: number, y: number): Point => ({ x: offsetX + x * image.naturalWidth * scale, y: offsetY + y * image.naturalHeight * scale });
  const occupied: Box[] = [];
  const placements = markers.map((marker, index): Placement => {
    const point = project(marker.x, marker.y);
    const preferred = project(marker.labelX, marker.labelY);
    const boxWidth = buttons[index].offsetWidth;
    const boxHeight = buttons[index].offsetHeight;
    const clamp = (value: number, extent: number, size: number) => Math.max(16, Math.min(extent - size - 16, value));
    let box: Box = { x: clamp(preferred.x, width, boxWidth), y: clamp(preferred.y, height, boxHeight), width: boxWidth, height: boxHeight };
    // Preserve the source's ordered vertical alternatives and label clearance.
    for (const dy of [0, -boxHeight - 14, boxHeight + 14, -2 * boxHeight - 28, 2 * boxHeight + 28]) {
      const candidate = { ...box, y: clamp(preferred.y + dy, height, boxHeight) };
      if (!occupied.some(other => overlaps(candidate, other))) { box = candidate; break; }
    }
    const visible = point.x > 10 && point.x < width - 10 && point.y > 10 && point.y < height - 10
      && box.x + boxWidth <= width - 10 && box.y + boxHeight <= height - 10
      && !occupied.some(other => overlaps(box, other));
    if (visible) occupied.push({ x: box.x - 5, y: box.y - 5, width: boxWidth + 10, height: boxHeight + 10 });
    const startX = Math.max(box.x, Math.min(box.x + boxWidth, point.x));
    const startY = Math.max(box.y, Math.min(box.y + boxHeight, point.y));
    const midX = (startX + point.x) / 2;
    return { ...box, point, visible, path: "M" + startX + " " + startY + " L" + midX + " " + startY + " L" + midX + " " + point.y + " L" + point.x + " " + point.y };
  });
  return { width, height, markers: placements };
}

export function SolarCityContext({ locale, alt, caption, note }: { locale: Locale; alt?: string; caption?: string; note?: string }) {
  const figureRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [reduced, setReduced] = useState(true);
  const [manualPause, setManualPause] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const paused = manualPause ?? reduced;
  const running = !paused && visible && !hidden;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => { setReduced(preference.matches); setManualPause(null); };
    const updateVisibility = () => setHidden(document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 })
      : null;
    if (observer && figureRef.current) observer.observe(figureRef.current);
    else setVisible(true);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    const map = mapRef.current;
    const image = imageRef.current;
    if (!map || !image) return;
    let disposed = false;
    const measure = () => {
      if (disposed || !image.naturalWidth || !image.naturalHeight || !map.clientWidth || !map.clientHeight) return;
      const buttons = buttonsRef.current.filter((button): button is HTMLButtonElement => button !== null);
      if (buttons.length !== markers.length) return;
      const next = placeMarkers(map.clientWidth, map.clientHeight, image, buttons);
      setLayout(previous => previous && previous.width === next.width && previous.height === next.height
        && previous.markers.every((marker, index) => marker.path === next.markers[index].path && marker.visible === next.markers[index].visible)
        ? previous : next);
    };
    measure();
    image.addEventListener("load", measure);
    const observer = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    observer?.observe(map);
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

  const selected = markers[active];
  const fallback = layout?.markers.flatMap((marker, index) => marker.visible ? [] : [index]) ?? [];
  return <figure className="sch-context" ref={figureRef} data-solarcity-context data-running={running} data-reduced={reduced && manualPause !== false}>
    <div className="sch-stage">
      <div className="sch-map" ref={mapRef} data-ready={layout !== null}>
        <img className="sch-image" ref={imageRef} src="/case/solarcity/hybrid-complex.webp" width="2200" height="1529" loading="lazy" decoding="async" alt={alt ?? (locale === "ua" ? "Візуалізація гібридного енергетичного комплексу SolarCity" : "SolarCity hybrid energy complex visualisation")} />
        <div className="sch-shade" aria-hidden="true" />
        <svg className="sch-leaders" viewBox={"0 0 " + (layout?.width ?? 2200) + " " + (layout?.height ?? 1529)} preserveAspectRatio="none" aria-hidden="true">
          {layout?.markers.map((marker, index) => marker.visible && <g key={index} data-active={active === index}><path d={marker.path} /><circle cx={marker.point.x} cy={marker.point.y} r="3.5" /></g>)}
        </svg>
        {markers.map((marker, index) => <button className="sch-marker" key={index} type="button" ref={element => { buttonsRef.current[index] = element; }} data-visible={layout?.markers[index].visible ?? false} aria-pressed={active === index} aria-label={text(locale, marker.index)} tabIndex={layout?.markers[index].visible ? 0 : -1} style={{ left: layout?.markers[index].x ?? 0, top: layout?.markers[index].y ?? 0 }} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}><span>0{index + 1}</span><span className="sch-marker-label">{text(locale, marker.label)}</span></button>)}
        <div className="sch-scan" aria-hidden="true" />
      </div>
      <div className="sch-caption">
        <div className="sch-caption-top">
          <span className="sch-index">{text(locale, selected.index)}</span>
        </div>
        <p className="sch-caption-copy" aria-live="polite" aria-atomic="true">{text(locale, selected.copy)}</p>
        {fallback.length > 0 && <div className="sch-fallback" role="group" aria-label={locale === "ua" ? "Компоненти комплексу" : "Complex components"}>{fallback.map(index => <button className="sch-fallback-button" key={index} type="button" aria-pressed={active === index} onFocus={() => setActive(index)} onClick={() => setActive(index)}>{text(locale, markers[index].index)}</button>)}</div>}
      </div>
    </div>
    <figcaption className="sch-credit sc-media-credit content-meta">
      {caption || note ? <div className="sch-credit-copy sc-media-credit-copy">{caption}{note ? <span className="sch-credit-note sc-media-credit-note">{note}</span> : null}</div> : null}
      <button className="sch-pause sc-media-pause" type="button" aria-pressed={paused} aria-label={paused ? (locale === "ua" ? "Відтворити сканування" : "Play scan animation") : (locale === "ua" ? "Призупинити сканування" : "Pause scan animation")} onClick={() => setManualPause(!paused)}>{paused ? (locale === "ua" ? "ВІДТВОРИТИ" : "PLAY") : (locale === "ua" ? "ПАУЗА" : "PAUSE")}</button>
    </figcaption>
  </figure>;
}
