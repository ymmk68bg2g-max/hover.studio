"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ProjectLocale } from "./projects";

const text = {
  ua: {
    label: "Сценарій енергетичної системи",
    modes: ["Генерація", "Накопичення", "Споживання"],
    nodes: [
      ["01 / ДЖЕРЕЛО", "Генерація", "Сонячна енергія"],
      ["02 / ПІДКЛЮЧЕННЯ", "Мережа", "Зовнішнє живлення"],
      ["03 / BESS", "Накопичення", "Керований запас енергії"],
      ["04 / НАВАНТАЖЕННЯ", "Споживання", "Енергетична задача об’єкта"],
    ],
    control: "КЕРУВАННЯ СИСТЕМОЮ",
    caption: "Принципова схема. Не телеметрія.",
    pause: "ПАУЗА",
    play: "ВІДТВОРИТИ",
    pauseLabel: "Призупинити анімацію потоків енергії",
    playLabel: "Відтворити анімацію потоків енергії",
    descriptions: [
      "Сонячна генерація живить споживачів. Доступний надлишок може заряджати систему накопичення.",
      "Система накопичує енергію від генерації або мережі за заданою стратегією керування.",
      "Накопичена енергія може покривати частину навантаження. Резервне живлення залежить від конфігурації, потужності та запасу енергії.",
    ],
  },
  en: {
    label: "Energy system scenario",
    modes: ["Generation", "Storage", "Consumption"],
    nodes: [
      ["01 / SOURCE", "Generation", "Solar energy"],
      ["02 / CONNECTION", "Grid", "External power supply"],
      ["03 / BESS", "Storage", "Managed energy reserve"],
      ["04 / LOAD", "Consumption", "The site's energy requirements"],
    ],
    control: "SYSTEM MANAGEMENT",
    caption: "Schematic illustration. Not telemetry.",
    pause: "PAUSE",
    play: "PLAY",
    pauseLabel: "Pause energy flow animation",
    playLabel: "Play energy flow animation",
    descriptions: [
      "Solar generation supplies consumers. Available surplus can charge the energy storage system.",
      "The system stores energy from generation or the grid according to the configured management strategy.",
      "Stored energy can cover part of the load. Backup power depends on the configuration, power rating and available energy reserve.",
    ],
  },
} as const;

type Point = { x: number; y: number };
type Geometry = { width: number; height: number; points: Point[] };
const modes = ["generation", "storage", "supply"] as const;

export function SolarFamilyEnergyFlow({ locale }: { locale: ProjectLocale }) {
  const content = text[locale];
  const [mode, setMode] = useState(0);
  const [paused, setPaused] = useState(false);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const descriptionId = useId();

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const points = Array.from(element.querySelectorAll<HTMLElement>(".sf-energy-node")).map(node => {
        const rect = node.getBoundingClientRect();
        return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2 };
      });
      setGeometry({ width: bounds.width, height: bounds.height, points });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.querySelectorAll(".sf-energy-node").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [locale]);

  const [generation, grid, storage, load] = geometry?.points ?? [
    { x: 190, y: 116 }, { x: 570, y: 116 }, { x: 190, y: 378 }, { x: 570, y: 378 },
  ];
  const point = (p: Point) => `${p.x} ${p.y}`;
  const stacked = Math.abs(generation.x - grid.x) < 1;
  // In a narrow column, charging routes travel beside the intervening card.
  const generationStorage = stacked
    ? `M${point(generation)}H16V${storage.y}H${storage.x}`
    : `M${point(generation)}L${point(storage)}`;
  const gridStorage = stacked
    ? `M${point(grid)}H${(geometry?.width ?? 760) - 16}V${storage.y}H${storage.x}`
    : `M${point(grid)}L${point(storage)}`;
  const storageLoad = `M${point(storage)}L${point(load)}`;

  return (
    <div className="sf-energy-demo" data-mode={modes[mode]} data-paused={paused}>
      <div className="sf-energy-controls" role="group" aria-label={content.label}>
        {content.modes.map((label, index) => (
          <button type="button" key={label} aria-pressed={mode === index} aria-describedby={descriptionId} onClick={() => setMode(index)}>
            <span>{String(index + 1).padStart(2, "0")} / </span>{label}
          </button>
        ))}
      </div>
      <figure className="sf-energy-scheme">
        <div className="sf-energy-canvas" ref={canvas}>
          <svg className="sf-energy-connections" viewBox={`0 0 ${geometry?.width ?? 760} ${geometry?.height ?? 520}`} preserveAspectRatio="none" aria-hidden="true">
            <path d={`M${point(generation)}L${point(grid)}L${point(load)}`} />
            <path d={`${generationStorage} ${gridStorage} ${storageLoad}`} />
            {mode === 0 && <path className="sf-energy-flow" d={`${generationStorage} ${storageLoad}`} />}
            {mode === 1 && <path className="sf-energy-flow" d={`${generationStorage} ${gridStorage}`} />}
            {mode === 2 && <path className="sf-energy-flow" d={storageLoad} />}
          </svg>
          {content.nodes.map(([label, title, description], index) => (
            <div className={`sf-energy-node${index === [0, 2, 3][mode] ? " is-active" : ""}`} key={label}>
              <span>{label}</span><strong>{title}</strong><small>{description}</small>
            </div>
          ))}
          <div className="sf-energy-management">{content.control}</div>
        </div>
        <figcaption className="sf-energy-caption">
          <span>{content.caption}</span>
          <button
            className="sf-energy-pause"
            type="button"
            aria-pressed={paused}
            aria-label={paused ? content.playLabel : content.pauseLabel}
            onClick={() => setPaused(value => !value)}
          >
            {paused ? content.play : content.pause}
          </button>
        </figcaption>
      </figure>
      <p className="sf-energy-description" id={descriptionId} aria-live="polite">{content.descriptions[mode]}</p>
    </div>
  );
}
