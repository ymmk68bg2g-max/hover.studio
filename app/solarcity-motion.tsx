"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";

type Locale = "ua" | "en";
type Words = readonly [string, string];
type ModelKey = "shift" | "arbitrage" | "management";
type Point = { x: number; y: number };
type Phase = readonly [number, Words, Words];
const words = (locale: Locale, value: Words) => value[locale === "en" ? 1 : 0];
const clamp = (value: number) => Math.max(0, Math.min(1, value));

// Paths, scenarios and copy are adapted from the supplied SolarCity source.
const connections = [
  ["pv-bess", "M165 125 L430 125"], ["bess-sub", "M505 150 L665 245"],
  ["sub-grid", "M730 270 L850 330"], ["grid-industry", "M835 385 L610 470"],
  ["sub-industry", "M680 310 L575 440"], ["industry-city", "M505 485 L225 455"],
  ["city-pv", "M165 410 L140 185"],
] as const;
const nodeNames: readonly Words[] = [["Генерація", "Generation"], ["Накопичення", "Storage"], ["Підстанція", "Substation"], ["Мережа", "Grid"], ["Промисловість", "Industry"], ["Споживачі", "Consumers"]];
const nodes = [
  { id: "pv", short: ["СЕС", "PV"], label: ["01 / СОНЯЧНА ГЕНЕРАЦІЯ", "01 / SOLAR GENERATION"], title: ["Генерація перетворює територію на джерело енергії.", "Generation turns a site into a source of energy."], text: ["Параметри майданчика та профіль споживання стають основою архітектури майбутнього активу.", "Site parameters and the consumption profile define the architecture of the future asset."], paths: ["pv-bess", "city-pv"] },
  { id: "bess", short: ["СНЕ", "BESS"], label: ["02 / НАКОПИЧЕННЯ ЕНЕРГІЇ", "02 / ENERGY STORAGE"], title: ["Накопичення керує часом і цінністю енергії.", "Storage manages the timing and value of energy."], text: ["Система накопичення заряджається у періоди нижчої вартості та підтримує систему тоді, коли попит зростає.", "Storage charges when energy costs are lower and supports the system as demand rises."], paths: ["pv-bess", "bess-sub"] },
  { id: "sub", short: ["ПС", "SUB"], label: ["03 / ПІДСТАНЦІЯ", "03 / SUBSTATION"], title: ["Підстанція зводить потоки у керовану точку.", "The substation brings energy flows into one controlled point."], text: ["Вона поєднує генерацію, накопичення, навантаження та мережевий контур об’єкта.", "It connects generation, storage, demand and the facility’s grid infrastructure."], paths: ["bess-sub", "sub-grid", "sub-industry"] },
  { id: "grid", short: ["МЕРЕЖА", "GRID"], label: ["04 / МЕРЕЖА", "04 / GRID"], title: ["Мережа відкриває двосторонній рух енергії.", "The grid enables energy to flow in both directions."], text: ["Інфраструктура взаємодіє з енергосистемою, балансуючи видачу, споживання та доступну потужність.", "The infrastructure interacts with the energy system, balancing output, consumption and available capacity."], paths: ["sub-grid", "grid-industry"] },
  { id: "industry", short: ["ПОПИТ", "LOAD"], label: ["05 / ПРОМИСЛОВІСТЬ", "05 / INDUSTRY"], title: ["Виробництво отримує прогнозований енергетичний контур.", "Industry gains a predictable energy system."], text: ["Генерація та накопичення працюють разом із реальним профілем навантаження підприємства.", "Generation and storage work with the business’s actual load profile."], paths: ["grid-industry", "sub-industry", "industry-city"] },
  { id: "city", short: ["МІСТО", "CITY"], label: ["06 / МІСТО", "06 / CITY"], title: ["Окремі активи формують енергетичне місто.", "Individual assets form an energy city."], text: ["Комерційні об’єкти, виробництво й інфраструктура об’єднуються в одну керовану екосистему.", "Commercial facilities, industry and infrastructure form one managed ecosystem."], paths: ["industry-city", "city-pv"] },
] satisfies { id: string; short: Words; label: Words; title: Words; text: Words; paths: readonly string[] }[];

const models: Record<ModelKey, { path: string; title: Words; description: Words; chargeX: number; sellX: number; chargeLabel: Words; sellLabel: Words; phases: readonly Phase[] }> = {
  shift: {
    path: "M50 250 C170 290 210 305 315 282 C430 255 470 180 565 195 C655 210 700 330 795 255 C870 196 900 95 950 70",
    title: ["Добовий цикл перенесення енергії", "Daily energy shifting cycle"],
    description: ["Система накопичення накопичує енергію в період нижчої вартості та віддає її у години пікового попиту.", "The storage system stores energy when its cost is lower and supplies it during peak demand."],
    chargeX: 270, sellX: 895, chargeLabel: ["ЗАРЯДЖАННЯ СНЕ", "BESS CHARGING"], sellLabel: ["ПІКОВИЙ ПОПИТ", "PEAK DEMAND"],
    phases: [
      [.38, ["НАКОПИЧЕННЯ", "STORAGE"], ["Система накопичення приймає енергію у період нижчої вартості.", "The storage system receives energy when its cost is lower."]],
      [.72, ["БАЛАНСУВАННЯ", "BALANCING"], ["Система узгоджує генерацію, навантаження та доступний резерв.", "The system coordinates generation, demand and available reserves."]],
      [1, ["ВИДАЧА", "DISCHARGE"], ["Накопичена енергія підтримує актив у години пікового попиту.", "Stored energy supports the asset during peak demand."]],
    ],
  },
  arbitrage: {
    path: "M50 225 C145 275 230 326 340 294 C450 262 520 138 620 186 C720 234 742 318 810 244 C875 174 910 104 950 82",
    title: ["Добовий цикл мережевого арбітражу", "Daily grid arbitrage cycle"],
    description: ["Актив реагує на зміну ринкової вартості енергії протягом доби.", "The asset responds to changes in the market value of energy throughout the day."],
    chargeX: 300, sellX: 885, chargeLabel: ["НИЖЧА ВАРТІСТЬ", "LOWER COST"], sellLabel: ["ВИЩА ВАРТІСТЬ", "HIGHER VALUE"],
    phases: [
      [.4, ["НИЖЧА ВАРТІСТЬ", "LOWER COST"], ["Система накопичує енергію у сприятливий період ринку.", "The system stores energy during favorable market conditions."]],
      [.7, ["ОЧІКУВАННЯ", "STANDBY"], ["Актив утримує доступний резерв до зміни ринкового сигналу.", "The asset holds available reserves until the market signal changes."]],
      [1, ["ВИЩА ВАРТІСТЬ", "HIGHER VALUE"], ["Енергія видається у період вищої цінності для системи.", "Energy is supplied when it has greater value for the system."]],
    ],
  },
  management: {
    path: "M50 255 C150 270 235 238 330 250 C430 265 500 214 590 222 C680 230 758 194 838 181 C892 172 925 151 950 142",
    title: ["Керований профіль енергетичного активу", "Managed energy asset profile"],
    description: ["Диспетчеризація та моніторинг згладжують профіль і підтримують керовану роботу активу.", "Dispatch and monitoring smooth the profile and support controlled asset operation."],
    chargeX: 410, sellX: 820, chargeLabel: ["МОНІТОРИНГ", "MONITORING"], sellLabel: ["КЕРУВАННЯ", "CONTROL"],
    phases: [
      [.34, ["МОНІТОРИНГ", "MONITORING"], ["Система збирає дані про генерацію, накопичення та навантаження.", "The system collects data on generation, storage and demand."]],
      [.68, ["ОПТИМІЗАЦІЯ", "OPTIMIZATION"], ["Алгоритм узгоджує роботу компонентів енергетичного активу.", "The algorithm coordinates the energy asset’s components."]],
      [1, ["КЕРУВАННЯ", "CONTROL"], ["Диспетчеризація підтримує цільовий режим і доступність активу.", "Dispatch maintains the target operating mode and asset availability."]],
    ],
  },
};
const modelKeys: readonly ModelKey[] = ["shift", "arbitrage", "management"];

function useMotionState(ref: RefObject<HTMLElement | null>) {
  const [reduced, setReduced] = useState(true);
  const [manualPause, setManualPause] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
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
    if (observer && ref.current) observer.observe(ref.current);
    else setVisible(true);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [ref]);
  const paused = manualPause ?? reduced;
  return { paused, reduced: reduced && manualPause !== false, running: !paused && visible && !hidden, toggle: () => setManualPause(!paused) };
}

function EnergyNetwork({ locale, id }: { locale: Locale; id: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = nodes[activeIndex];
  return <div className="sc-energy-layout">
    <div className="sc-node-copy" aria-live="polite" aria-atomic="true">
      <p className="sc-eyebrow">{words(locale, active.label)}</p>
      <h4>{words(locale, active.title)}</h4><p>{words(locale, active.text)}</p>
    </div>
    <div className="sc-network" role="group" aria-label={locale === "ua" ? "Компоненти енергосистеми" : "Energy system components"}>
      <svg className="sc-network-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id={id + "-network"} x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#3977ff" /><stop offset="1" stopColor="#35d6e4" /></linearGradient></defs>
        {connections.map(([key, path]) => <path key={key} d={path} className={"sc-flow" + (active.paths.includes(key) ? " is-active" : "")} style={active.paths.includes(key) ? { stroke: "url(#" + id + "-network)" } : undefined} />)}
      </svg>
      {nodes.map((node, index) => <button key={node.id} type="button" className={"sc-node sc-node-" + node.id} aria-pressed={activeIndex === index} aria-label={words(locale, node.label)} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)}>
        <small>0{index + 1}</small><strong>{words(locale, node.short)}</strong><span>{words(locale, nodeNames[index])}</span>
      </button>)}
    </div>
  </div>;
}

function pointAtX(path: SVGPathElement, targetX: number): Point {
  let start = 0;
  let end = path.getTotalLength();
  let point = path.getPointAtLength(0);
  for (let index = 0; index < 18; index++) {
    const middle = (start + end) / 2;
    point = path.getPointAtLength(middle);
    if (point.x < targetX) start = middle;
    else end = middle;
  }
  return { x: point.x, y: point.y };
}

function chartTime(ratio: number) {
  const minutes = Math.round(clamp(ratio) * 1440);
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}

function DailyCurve({ locale, id, running }: { locale: Locale; id: string; running: boolean }) {
  const [requested, setRequested] = useState<ModelKey>("shift");
  const [displayed, setDisplayed] = useState<ModelKey>("shift");
  const [ratio, setRatio] = useState(.25);
  const [frame, setFrame] = useState({ width: 1000, height: 350 });
  const [points, setPoints] = useState({ probe: { x: 275, y: 288 }, charge: { x: 270, y: 289 }, sell: { x: 895, y: 130 } });
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  // Pausing settles an in-flight choice before paint; resuming cannot replay
  // the previous curve. This bounded adjustment preserves immediate selection.
  if (!running && requested !== displayed) setDisplayed(requested);
  const switching = running && requested !== displayed;
  const model = models[displayed];
  useEffect(() => {
    if (requested === displayed || !running) return;
    const timer = window.setTimeout(() => setDisplayed(requested), 120);
    return () => window.clearTimeout(timer);
  }, [requested, displayed, running]);
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const rect = svg.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) setFrame(previous => previous.width === rect.width && previous.height === rect.height ? previous : { width: rect.width, height: rect.height });
    };
    measure();
    const observer = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    observer?.observe(svg);
    if (!observer) window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    setPoints({ probe: pointAtX(path, 50 + ratio * 900), charge: pointAtX(path, model.chargeX), sell: pointAtX(path, model.sellX) });
  }, [ratio, model, frame.width, frame.height]);
  const sx = Math.max(1, frame.width - 36) / 900;
  const sy = Math.max(1, frame.height - 30) / 300;
  const tx = 18 - 50 * sx;
  const ty = 15 - 50 * sy;
  const project = (point: Point) => ({ x: point.x * sx + tx, y: point.y * sy + ty });
  const transform = "matrix(" + sx + " 0 0 " + sy + " " + tx + " " + ty + ")";
  const probe = project(points.probe);
  const charge = project(points.charge);
  const sell = project(points.sell);
  const phase = model.phases.find(([limit]) => ratio <= limit) ?? model.phases[model.phases.length - 1];
  const time = chartTime(ratio);
  const fromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 36) setRatio(clamp((event.clientX - rect.left - 18) / (rect.width - 36)));
  };
  const fromKeyboard = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setRatio(value => clamp(value + (event.key === "ArrowRight" ? .04 : -.04)));
  };
  return <div className="sc-curve-layout">
    <div className="sc-curve-board">
      <p className="sc-eyebrow">{words(locale, model.title)}</p>
      <div className="sc-curve-plot" data-switching={switching}>
        <svg className="sc-curve-svg" ref={svgRef} viewBox={"0 0 " + frame.width + " " + frame.height} role="img" aria-label={words(locale, model.title)} onPointerEnter={event => { if (event.pointerType !== "touch") fromPointer(event); }} onPointerDown={fromPointer} onPointerMove={event => { if (event.pointerType !== "touch" || event.buttons === 1) fromPointer(event); }}>
          <defs><linearGradient id={id + "-area"} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#3977ff" stopOpacity=".35" /><stop offset="1" stopColor="#3977ff" stopOpacity="0" /></linearGradient></defs>
          <g transform={transform} className="sc-chart-grid">{[70, 140, 210, 280, 350].map(y => <line key={"h" + y} x1="50" x2="950" y1={y} y2={y} vectorEffect="non-scaling-stroke" />)}{[50, 275, 500, 725, 950].map(x => <line key={"v" + x} x1={x} x2={x} y1="70" y2="350" vectorEffect="non-scaling-stroke" />)}</g>
          <path className="sc-curve-area" transform={transform} d={model.path + " L950 350 L50 350 Z"} style={{ fill: "url(#" + id + "-area)" }} />
          <path className="sc-curve-line" ref={pathRef} transform={transform} d={model.path} />
          {[charge, sell].map((point, index) => <line key={index} className={"sc-marker" + ((index === 0 ? displayed !== "management" : displayed !== "shift") ? " is-emphasized" : "")} x1={point.x} x2={point.x} y1={point.y} y2={project({ x: 50, y: 350 }).y} />)}
          <circle className="sc-curve-point" cx={charge.x} cy={charge.y} r="5" /><circle className="sc-curve-point" cx={sell.x} cy={sell.y} r="5" />
          <g className="sc-probe"><line x1={probe.x} x2={probe.x} y1={project({ x: 50, y: 70 }).y} y2={project({ x: 50, y: 350 }).y} /><circle cx={probe.x} cy={probe.y} r="5" /></g>
        </svg>
      </div>
      <div className="sc-event-labels" aria-hidden="true"><span>{words(locale, model.chargeLabel)}</span><span>{words(locale, model.sellLabel)}</span></div>
      <div className="sc-time-labels" aria-hidden="true">{["00:00", "06:00", "12:00", "18:00", "24:00"].map(label => <span key={label}>{label}</span>)}</div>
      <div className="sc-probe-controls">
        <input id={id + "-time"} type="range" min="0" max="1" step=".01" value={ratio} aria-label={locale === "ua" ? "Час доби: змініть повзунок для огляду кривої" : "Time of day: move the slider to explore the curve"} aria-valuetext={time + " / " + words(locale, phase[1])} onChange={event => setRatio(Number(event.target.value))} onKeyDown={fromKeyboard} />
        <output htmlFor={id + "-time"}>{time}</output>
      </div>
      <p className="sc-curve-note"><strong>{words(locale, phase[1])}</strong><br />{words(locale, phase[2])}</p>
    </div>
    <div className="sc-models" role="group" aria-label={locale === "ua" ? "Сценарій добового циклу" : "Daily cycle scenario"}>
      {modelKeys.map((key, index) => <button type="button" className="sc-model" key={key} aria-pressed={requested === key} onMouseEnter={() => setRequested(key)} onFocus={() => setRequested(key)} onClick={() => setRequested(key)}><small>0{index + 1}</small><strong>{words(locale, models[key].title)}</strong><span>{words(locale, models[key].description)}</span></button>)}
    </div>
  </div>;
}

export function SolarCityMotionShowcase({ locale }: { locale: Locale }) {
  const rootRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tab, setTab] = useState(0);
  const id = "sc-motion-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const motion = useMotionState(rootRef);
  const labels = locale === "ua" ? ["Енергосистема", "Добовий цикл"] : ["Energy system", "Daily cycle"];
  const navigateTabs = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === "ArrowRight" ? (tab + 1) % 2 : event.key === "ArrowLeft" ? (tab + 1) % 2 : event.key === "Home" ? 0 : event.key === "End" ? 1 : null;
    if (next === null) return;
    event.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };
  return <section className="sc-motion" ref={rootRef} data-solarcity-motion data-running={motion.running} data-reduced={motion.reduced} aria-labelledby={id + "-title"}>
    <header className="sc-motion-head">
      <div><h3 id={id + "-title"}>{locale === "ua" ? "Спробуйте взаємодію." : "Explore the interaction."}</h3><p>{locale === "ua" ? "Обирайте компоненти й сценарії. Наведіть на криву або змініть час повзунком." : "Select components and scenarios. Point at the curve or use the time slider."}</p></div>
      <button type="button" className="sc-pause" aria-pressed={motion.paused} aria-label={motion.paused ? (locale === "ua" ? "Відтворити анімацію" : "Play animation") : (locale === "ua" ? "Призупинити анімацію" : "Pause animation")} onClick={motion.toggle}>{motion.paused ? (locale === "ua" ? "ВІДТВОРИТИ РУХ" : "PLAY MOTION") : (locale === "ua" ? "ПРИЗУПИНИТИ" : "PAUSE MOTION")}</button>
    </header>
    <div className="sc-showcase-tabs" role="tablist" aria-label={locale === "ua" ? "Фрагменти інтерфейсу SolarCity" : "SolarCity interface fragments"} onKeyDown={navigateTabs}>
      {labels.map((label, index) => <button type="button" className="sc-tab" id={id + "-tab-" + index} key={index} role="tab" aria-selected={tab === index} aria-controls={id + "-panel-" + index} tabIndex={tab === index ? 0 : -1} ref={element => { tabRefs.current[index] = element; }} onClick={() => setTab(index)}>{label}</button>)}
    </div>
    <div className="sc-panel" id={id + "-panel-0"} role="tabpanel" aria-labelledby={id + "-tab-0"} hidden={tab !== 0} tabIndex={0}><EnergyNetwork locale={locale} id={id} /></div>
    <div className="sc-panel" id={id + "-panel-1"} role="tabpanel" aria-labelledby={id + "-tab-1"} hidden={tab !== 1} tabIndex={0}><DailyCurve locale={locale} id={id} running={motion.running && tab === 1} /></div>
    <p className="sc-study-caption">{locale === "ua" ? "Фрагменти інтерфейсу SolarCity. Добові криві відтворюють ілюстративні сценарії з дизайну проєкту." : "Interface fragments from SolarCity. The daily curves reproduce illustrative scenarios from the project’s design."}</p>
  </section>;
}
