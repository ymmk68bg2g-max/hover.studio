import { useEffect, useRef } from "react";
import { placeMobileTechnologyLabels, placeTabletPortraitTechnologyLabels, placeTechnologyLabels, revealEnvelope, type FieldRect } from "./hero-technology-layout";

type TechnologyLabel = {
  name: string;
  mobile?: boolean;
  desktopOnly?: boolean;
  mobileSide?: "left" | "right";
  mobileMiddle?: "left" | "right";
  tabletBand?: "top" | "bottom";
};

// The measured free area determines positions at every viewport size.
const labels: TechnologyLabel[] = [
  { name: "HTML", mobile: true },
  { name: "CSS", mobile: true },
  { name: "React", mobile: true },
  { name: "TypeScript", mobile: true },
  { name: "JavaScript", mobile: true },
  { name: "SVG", mobile: true },
  { name: "Grid", mobile: true },
  { name: "Flexbox", mobile: true },
  { name: "API", mobile: true },
  { name: "UI", mobile: true },
  { name: "UX", mobile: true },
  { name: "SEO", mobile: true },
  { name: "Motion", mobile: true },
  { name: "Forms", mobile: true },
  { name: "Next.js" },
  { name: "Vite" },
  { name: "Tailwind CSS" },
  { name: "Responsive" },
  { name: "Components" },
  { name: "Routing" },
  { name: "Web Fonts" },
  { name: "Accessibility" },
  { name: "Performance" },
  { name: "Design System", desktopOnly: true },
  { name: "Interaction", desktopOnly: true, mobileMiddle: "right" },
  { name: "Animation", desktopOnly: true, mobileMiddle: "left" },
  { name: "Tokens", desktopOnly: true, mobileSide: "right" },
  { name: "Web Standards", desktopOnly: true },
  { name: "CMS", desktopOnly: true, mobileSide: "left" },
  { name: "Semantic HTML", desktopOnly: true },
  { name: "UX Research", desktopOnly: true },
  { name: "Prototyping", desktopOnly: true },
  { name: "Svelte", tabletBand: "top" },
  { name: "Astro", tabletBand: "top" },
  { name: "Figma", tabletBand: "top" },
  { name: "Webflow", tabletBand: "top" },
  { name: "CSS Modules", tabletBand: "top" },
  { name: "Web Components", tabletBand: "top" },
  { name: "GSAP", tabletBand: "bottom" },
  { name: "WordPress", tabletBand: "bottom" },
  { name: "Framer Motion", tabletBand: "bottom" },
  { name: "Headless CMS", tabletBand: "bottom" },
  { name: "Web Animations", tabletBand: "bottom" },
  { name: "Vectors", tabletBand: "bottom" },
];

export function HeroTechnologyField({ locale }: { locale: "ua" | "en" }) {
  const fieldRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const heading = field?.parentElement;
    const hero = heading?.closest(".hero");
    if (!field || !heading || !hero) return;
    let frame = 0;
    let disposed = false;
    let fontsReady = false;
    let geometryKey = "";
    const inkMeasure = document.createElement("canvas").getContext("2d");

    const layout = () => {
      frame = 0;
      if (disposed || !fontsReady) return;
      const fieldRect = field.getBoundingClientRect();
      if (fieldRect.width <= 0 || fieldRect.height <= 0) return;
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const tabletPortrait = window.matchMedia("(min-width: 761px) and (max-width: 1100px) and (orientation: portrait)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const textGap = mobile ? 12 : 20;
      const obstacles: FieldRect[] = [];
      let connector: FieldRect | undefined;

      const revealMotion = (element: Element, style: CSSStyleDeclaration) => {
        if (!element.classList.contains("reveal") || element.classList.contains("responds")) {
          return { x: 0, y: 0, travel: 0 };
        }
        const matrix = style.transform === "none" ? null : new DOMMatrixReadOnly(style.transform);
        return {
          x: matrix?.e ?? 0,
          y: matrix?.f ?? 0,
          travel: reducedMotion ? 0 : (parseFloat(style.getPropertyValue("--reveal-distance")) || 0) * rootFontSize,
        };
      };

      // Mobile ink boxes leave the real connector pockets free. Punctuation
      // keeps its own descender box; unsupported metrics retain the safe Range.
      for (const [wordIndex, word] of Array.from(heading.children).entries()) {
        if (word === field) continue;
        const style = window.getComputedStyle(word);
        const motion = revealMotion(word, style);
        const text = word.firstChild;
        const runs = mobile && text?.nodeType === Node.TEXT_NODE
          ? Array.from((text.textContent ?? "").matchAll(/[^\s,.]+|[,.]/gu))
          : [];
        const ranges = runs.length ? runs.map(run => {
          const range = document.createRange();
          range.setStart(text!, run.index);
          range.setEnd(text!, run.index + run[0].length);
          return { range, value: run[0] };
        }) : [{ range: (() => {
          const range = document.createRange();
          range.selectNodeContents(word);
          return range;
        })(), value: word.textContent ?? "" }];
        if (inkMeasure) inkMeasure.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        for (const { range, value } of ranges) for (const rect of Array.from(range.getClientRects())) {
          if (!rect.width || !rect.height) continue;
          let textRect: FieldRect = rect;
          if (mobile && inkMeasure) {
            const metrics = inkMeasure.measureText(value);
            const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent, actualBoundingBoxAscent: inkAscent, actualBoundingBoxDescent: inkDescent } = metrics;
            if ([ascent, descent, inkAscent, inkDescent].every(Number.isFinite) && Math.abs(rect.height - ascent - descent) <= 2) {
              const baseline = rect.bottom - descent;
              textRect = { left: rect.left, right: rect.right, top: baseline - inkAscent, bottom: baseline + inkDescent };
            }
          }
          const envelope = revealEnvelope(textRect, motion.x, motion.y, motion.travel);
          const motionGap = word.classList.contains("responds")
            ? 5 + rect.width * 0.012 + parseFloat(style.fontSize) * 0.012 * (word.textContent?.length ?? 0)
            : 0;
          const obstacle = {
            left: envelope.left - fieldRect.left - textGap - motionGap,
            right: envelope.right - fieldRect.left + textGap + motionGap,
            top: envelope.top - fieldRect.top - textGap - 3,
            bottom: envelope.bottom - fieldRect.top + textGap + 3,
          };
          obstacles.push(obstacle);
          if (mobile && wordIndex === 1) connector = obstacle;
        }
      }

      const stableBox = (selector: string) => {
        const element = hero.querySelector(selector);
        if (!element) return null;
        const motion = revealMotion(element, getComputedStyle(element));
        return revealEnvelope(element.getBoundingClientRect(), motion.x, motion.y, motion.travel);
      };
      const meta = stableBox(".hero-meta");
      const bottom = stableBox(".hero-bottom");
      const bounds = {
        left: mobile ? 0 : 12,
        right: fieldRect.width - (mobile ? 0 : 12),
        top: Math.max(12, meta ? meta.bottom + textGap - fieldRect.top : 12),
        bottom: Math.min(fieldRect.height - 12, bottom ? bottom.top - textGap - fieldRect.top : fieldRect.height - 12) - (window.matchMedia("(min-width: 1101px)").matches ? 20 : 0),
      };
      const tabletInnerBounds = {
        ...bounds,
        top: Math.max(bounds.top, 12 + 6 * rootFontSize),
        bottom: Math.min(bounds.bottom, fieldRect.height - 12 - 6 * rootFontSize),
      };
      const words = Array.from(field.children) as HTMLSpanElement[];
      const sizes = words.map((word, index) => {
        const rect = word.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          side: labels[index].mobileSide,
          middleSide: labels[index].mobileMiddle,
          band: labels[index].tabletBand,
        };
      });
      // Browser toolbar resizes and unrelated font events can report unchanged
      // geometry. Leave the existing visible words untouched in that case.
      const nextKey = JSON.stringify({ mobile, tabletPortrait, bounds, tabletInnerBounds, obstacles, sizes, connector }, (_, value) => typeof value === "number" ? Math.round(value * 4) / 4 : value);
      if (nextKey === geometryKey) return;
      geometryKey = nextKey;
      const placements = mobile
        ? placeMobileTechnologyLabels(bounds, obstacles, sizes, 12, connector)
        : tabletPortrait
          ? placeTabletPortraitTechnologyLabels(bounds, tabletInnerBounds, obstacles, sizes, 20)
          : placeTechnologyLabels(bounds, obstacles, sizes, 20);

      // Apply writes after all text and label geometry has been read.
      words.forEach((word, index) => {
        const placement = placements[index];
        word.dataset.placed = placement ? "true" : "false";
        word.dataset.zone = placement?.zone ?? "";
        word.dataset.row = placement?.row === undefined ? "" : String(placement.row);
        if (placement) {
          word.style.left = `${placement.x}px`;
          word.style.top = `${placement.y}px`;
        }
      });
    };

    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(layout);
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(heading);
    resizeObserver.observe(field);
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    const fontRequest = (element: Element) => {
      const style = getComputedStyle(element);
      return document.fonts.load(`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, element.textContent ?? "");
    };
    Promise.all([fontRequest(heading), fontRequest(field.firstElementChild!)])
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => { fontsReady = true; schedule(); });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [locale]);

  return (
    <span key={locale} className="hero-technology-field" aria-hidden="true" ref={fieldRef}>
      {labels.map(({ name, mobile, desktopOnly, mobileSide, mobileMiddle, tabletBand }) => (
        <span
          key={name}
          className="hero-technology-label"
          data-density={mobile ? "mobile" : desktopOnly ? "desktop" : "tablet"}
          data-mobile-side={mobileSide}
          data-mobile-middle={mobileMiddle}
          data-tablet-band={tabletBand}
        >
          {name}
        </span>
      ))}
    </span>
  );
}
