import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const kinds = ["strategy", "design", "development", "motion"];
const componentNames = {
  strategy: "CapabilityStrategyDemo", design: "CapabilityDesignDemo",
  development: "CapabilityDevelopmentDemo", motion: "CapabilityMotionDemo",
};
const compiled = new Map();
function source(name) {
  if (!compiled.has(name)) compiled.set(name, ts.transpileModule(
    readFileSync(new URL(`../app/${name}.tsx`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText);
  return compiled.get(name);
}

function walk(node, predicate, result = []) {
  if (Array.isArray(node)) node.forEach(child => walk(child, predicate, result));
  else if (node && typeof node === "object") {
    if (predicate(node)) result.push(node);
    walk(node.props?.children, predicate, result);
  }
  return result;
}
const text = node => Array.isArray(node) ? node.map(text).join("")
  : node && typeof node === "object" ? text(node.props?.children) : String(node ?? "");
const hasClass = name => node => node.props?.className?.split(" ").includes(name);
const byClass = (tree, name) => walk(tree, hasClass(name));

// Resolve the real scene and shared frame component, rather than treating the
// frame as a UI stub. Each fixture contains one hook-owning frame instance.
function resolve(node) {
  if (Array.isArray(node)) return node.map(resolve);
  if (!node || typeof node !== "object") return node;
  if (typeof node.type === "function") return resolve(node.type(node.props));
  return { ...node, props: { ...node.props, children: resolve(node.props?.children) } };
}

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    dispatch(type, values = {}) {
      const event = { type, target: this, currentTarget: this, ...values };
      [...(listeners.get(type) ?? [])].forEach(listener => listener(event));
    },
    count(type) { return listeners.get(type)?.size ?? 0; },
  };
}

// Exercise the component's real hooks and callbacks with deterministic browser
// signals. Rendering settles state updates from effects just as React would.
function fixture({ kind = "motion", locale = "en", reduced = false, hidden = false } = {}) {
  const slots = [];
  const media = Object.assign(eventTarget(), { matches: reduced });
  const document = Object.assign(eventTarget(), { hidden, visibilityState: hidden ? "hidden" : "visible" });
  const intersections = [];
  const element = { getBoundingClientRect: () => ({ top: 0, bottom: 240, width: 500, height: 240 }) };
  let index = 0;
  let dirty = false;
  let tree;
  let effects = [];
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.targets = new Set(); intersections.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); this.disconnected = true; }
  }
  const window = {
    IntersectionObserver,
    innerHeight: 900,
    matchMedia(query) {
      assert.equal(query, "(prefers-reduced-motion: reduce)");
      return media;
    },
  };
  const hooks = {
    useState(initial) {
      const slot = slots[index++] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slot.value, next => {
        const value = typeof next === "function" ? next(slot.value) : next;
        if (!Object.is(value, slot.value)) { slot.value = value; dirty = true; }
      }];
    },
    useRef(initial) { return slots[index++] ??= { current: initial }; },
    useId() { return (slots[index++] ??= { value: ":capability-motion-test:" }).value; },
    useEffect(callback, deps) {
      const slot = slots[index++] ??= {};
      if (!deps || !slot.deps || deps.length !== slot.deps.length || deps.some((value, i) => !Object.is(value, slot.deps[i]))) {
        slot.deps = deps;
        effects.push({ slot, callback });
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const modules = new Map();
  function load(name) {
    if (modules.has(name)) return modules.get(name);
    const exports = {};
    modules.set(name, exports);
    vm.runInNewContext(source(name), {
      exports, window, document, IntersectionObserver,
      require(importName) {
        if (importName === "react") return hooks;
        if (importName === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
        if (importName.startsWith("./capability-")) return load(importName.slice(2));
        throw new Error(`Unexpected import: ${importName}`);
      },
    });
    return exports;
  }
  const Component = load(`capability-${kind}-demo`)[componentNames[kind]];
  const result = {
    kind, locale, intersections, media, document, element,
    render() {
      let iterations = 0;
      do {
        assert.ok(++iterations < 20, "Effects must settle without an update loop");
        index = 0;
        dirty = false;
        tree = resolve(Component({ locale }));
        walk(tree, node => node.props?.ref).forEach(node => {
          if (typeof node.props.ref === "function") node.props.ref(element);
          else node.props.ref.current = element;
        });
        const pending = effects;
        effects = [];
        pending.forEach(({ slot, callback }) => { slot.cleanup?.(); slot.cleanup = callback(); });
      } while (dirty);
      return tree;
    },
    get root() { return walk(tree, node => node.props?.["data-capability-demo"] === kind)[0]; },
    get control() { return byClass(tree, "cmd-control")[0]; },
    get running() { return result.root.props["data-running"]; },
    get reduced() { return result.root.props["data-reduced"]; },
    show(visible) {
      const observer = intersections.at(-1);
      assert.ok(observer, "The component observes its viewport visibility");
      observer.callback([{ target: element, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]);
      result.render();
    },
    hidden(value) {
      document.hidden = value;
      document.visibilityState = value ? "hidden" : "visible";
      document.dispatch("visibilitychange");
      result.render();
    },
    preference(value) {
      media.matches = value;
      media.dispatch("change", { matches: value, media: "(prefers-reduced-motion: reduce)" });
      result.render();
    },
    toggle() { result.control.props.onClick(); result.render(); },
    unmount() { slots.forEach(slot => { slot.cleanup?.(); slot.cleanup = undefined; }); },
  };
  result.render();
  return result;
}

function eachKind(t, options, check) {
  for (const kind of kinds) {
    const p = fixture({ ...options, kind });
    t.after(() => p.unmount());
    check(p, kind);
  }
}

// Read the authored CSS relationships without a browser or fixed timeline
// snapshots. The scene uses ordinary rules and percentage keyframe blocks.
function cssBlocks(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = [];
  let cursor = 0;
  while (cursor < clean.length) {
    const opening = clean.indexOf("{", cursor);
    if (opening === -1) break;
    let depth = 1;
    let end = opening + 1;
    while (depth && end < clean.length) {
      if (clean[end] === "{") depth++;
      if (clean[end] === "}") depth--;
      end++;
    }
    assert.equal(depth, 0, "CSS blocks have matching braces");
    blocks.push({ selector: clean.slice(cursor, opening).trim(), body: clean.slice(opening + 1, end - 1) });
    cursor = end;
  }
  return blocks;
}

function declarations(body) {
  return Object.fromEntries(body.split(";").filter(value => value.includes(":")).map(value => {
    const colon = value.indexOf(":");
    return [value.slice(0, colon).trim(), value.slice(colon + 1).trim()];
  }));
}

function cssRule(css, selector) {
  return Object.assign({}, ...cssBlocks(css)
    .filter(block => block.selector.split(",").some(value => value.trim() === selector))
    .map(block => declarations(block.body)));
}

function keyframesFor(css, selector) {
  const name = cssRule(css, selector)["animation-name"];
  assert.ok(name, `${selector} identifies its animation`);
  const block = cssBlocks(css).find(value => value.selector === `@keyframes ${name}`);
  assert.ok(block, `${name} has keyframes`);
  return cssBlocks(block.body).flatMap(frame => frame.selector.split(",").map(offset => ({
    at: offset.trim() === "from" ? 0 : offset.trim() === "to" ? 100 : Number(offset.replace("%", "")),
    values: declarations(frame.body),
  }))).sort((a, b) => a.at - b.at);
}

function numericTrack(frames, property, read = Number) {
  return frames.filter(frame => frame.values[property] !== undefined).map(frame => {
    const value = read(frame.values[property]);
    assert.ok(Number.isFinite(value), `${property} is numeric at ${frame.at}%`);
    return { at: frame.at, value };
  });
}

function trackValue(track, at) {
  const left = track.findLast(frame => frame.at <= at) ?? track[0];
  const right = track.find(frame => frame.at > at) ?? left;
  return left === right ? left.value : left.value + (right.value - left.value) * (at - left.at) / (right.at - left.at);
}

function opaqueUntil(track, after) {
  assert.equal(trackValue(track, after), 1, "The completed route is fully visible");
  const fade = track.find((frame, i) => frame.at >= after && frame.value === 1 && track[i + 1]?.value < 1);
  assert.ok(fade, "The animation holds its opaque result before fading");
  return fade.at;
}

function orthogonalEndpoint(path) {
  const tokens = path.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+/g);
  const point = { x: 0, y: 0 };
  let command;
  while (tokens.length) {
    if (/^[a-z]$/i.test(tokens[0])) command = tokens.shift();
    assert.match(command, /^[MLHV]$/i, "The site map route uses straight orthogonal segments");
    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();
    if (upper !== "V") point.x = (relative ? point.x : 0) + Number(tokens.shift());
    if (upper !== "H") point.y = (relative ? point.y : 0) + Number(tokens.shift());
  }
  return point;
}

function pixels(value, basis) {
  const number = Number.parseFloat(value);
  assert.ok(Number.isFinite(number), `A CSS length is available: ${value}`);
  assert.match(value, /(?:px|%)$/, "Geometry uses pixels or relative percentages");
  return value.endsWith("%") ? number * basis / 100 : number;
}

test("UA and EN expose a localized native Pause / Play control with an accurate pressed state", t => {
  for (const locale of ["ua", "en"]) {
    eachKind(t, { locale }, (p, kind) => {
      p.show(true);
      assert.equal(p.running, true, kind);
      assert.equal(p.root.type, "figure");
      assert.equal(p.root.props["data-capability-motion"], kind === "motion" ? true : undefined);
      assert.equal(p.control.type, "button");
      assert.equal(p.control.props.type, "button");
      assert.equal(p.control.props["aria-pressed"], false);
      assert.equal(text(p.control), locale === "ua" ? "Пауза" : "Pause");
      assert.match(p.control.props["aria-label"] ?? text(p.control), locale === "ua" ? /Пауза|Призупинити/iu : /Pause/iu);

      p.toggle();
      assert.equal(p.running, false);
      assert.equal(p.control.props["aria-pressed"], true);
      assert.equal(text(p.control), locale === "ua" ? "Відтворити" : "Play");
      assert.match(p.control.props["aria-label"] ?? text(p.control), locale === "ua" ? /Відтворити/iu : /Play/iu);
      p.toggle();
      assert.equal(p.running, true);
      assert.equal(p.control.props["aria-pressed"], false);
    });
  }
});

test("the demonstration waits for visibility, suspends offscreen and resumes on reentry", t => {
  eachKind(t, {}, p => {
    assert.equal(p.running, false, "The first render does not animate an unobserved preview");
    assert.equal(p.intersections.length, 1);
    assert.ok(p.intersections[0].targets.has(p.element), "The observer is attached to the preview root");
    p.show(true);
    assert.equal(p.running, true);
    p.show(false);
    assert.equal(p.running, false);
    p.show(true);
    assert.equal(p.running, true);
  });
});

test("manual Pause survives viewport and document visibility changes until explicit Play", t => {
  eachKind(t, {}, p => {
    p.show(true);
    p.toggle();
    p.show(false);
    p.hidden(true);
    p.show(true);
    p.hidden(false);
    assert.equal(p.running, false);
    assert.equal(p.control.props["aria-pressed"], true);
    p.toggle();
    assert.equal(p.running, true);
  });
});

test("a hidden document suspends motion and showing it resumes only a visible preview", t => {
  eachKind(t, { hidden: true }, p => {
    p.show(true);
    assert.equal(p.running, false, "Initial document visibility is read on mount");
    p.hidden(false);
    assert.equal(p.running, true);
    p.hidden(true);
    assert.equal(p.running, false);
    p.hidden(false);
    assert.equal(p.running, true);
    p.show(false);
    p.hidden(true);
    p.hidden(false);
    assert.equal(p.running, false, "A visible tab does not restart an offscreen preview");
  });
});

test("Play while offscreen preserves the visibility gate until reentry", t => {
  eachKind(t, {}, p => {
    p.show(true);
    p.toggle();
    p.show(false);
    p.toggle();
    assert.equal(p.control.props["aria-pressed"], false);
    assert.equal(p.running, false);
    p.show(true);
    assert.equal(p.running, true);
  });
});

test("reduced motion keeps a localized static preview and responds to live preference changes", t => {
  for (const locale of ["ua", "en"]) {
    eachKind(t, { locale, reduced: true }, p => {
      p.show(true);
      assert.equal(p.reduced, true);
      assert.equal(p.running, false);
      assert.equal(p.control.props.disabled, true);
      assert.equal(text(p.control), locale === "ua" ? "Рух вимкнено" : "Motion reduced");
      p.preference(false);
      assert.equal(p.reduced, false);
      assert.equal(p.control.props.disabled, false);
      assert.equal(p.running, true);
      p.preference(true);
      assert.equal(p.reduced, true);
      assert.equal(p.running, false);
    });
  }
});

test("changing reduced motion preferences preserves a reader's manual pause", t => {
  eachKind(t, {}, p => {
    p.show(true);
    p.toggle();
    p.preference(true);
    p.preference(false);
    assert.equal(p.reduced, false);
    assert.equal(p.running, false);
    assert.equal(p.control.props["aria-pressed"], true);
    p.toggle();
    assert.equal(p.running, true);
  });
});

test("unmount disconnects the observer and removes document and media listeners", () => {
  for (const kind of kinds) {
    const p = fixture({ kind });
    assert.equal(p.document.count("visibilitychange"), 1);
    assert.equal(p.media.count("change"), 1);
    p.show(true);
    p.unmount();
    assert.ok(p.intersections.every(observer => observer.disconnected));
    assert.equal(p.document.count("visibilitychange"), 0);
    assert.equal(p.media.count("change"), 0);
  }
});

test("each scene has three localized steps, an accessible explanation and a context-specific playback name", t => {
  const labels = {
    en: { strategy: ["Goal", "Structure", "User route"], design: ["Wireframe", "Style", "Responsive"], development: ["Edit", "Publish", "Result"], motion: ["Appearance", "Interaction", "New state"] },
    ua: { strategy: ["Ціль", "Структура", "Маршрут"], design: ["Прототип", "Стиль", "Адаптив"], development: ["Редагування", "Оновлення", "Результат"], motion: ["Поява", "Взаємодія", "Новий стан"] },
  };
  for (const locale of ["ua", "en"]) {
    const names = new Set();
    eachKind(t, { locale, reduced: true }, (p, kind) => {
      const stage = byClass(p.root, "cmd-stage")[0];
      const captions = walk(p.root, node => node.type === "figcaption");
      assert.equal(stage.props["aria-hidden"], "true");
      assert.deepEqual(byClass(p.root, "cmd-step-label").map(text), labels[locale][kind]);
      assert.deepEqual(byClass(p.root, "cmd-step-number").map(text), ["01", "02", "03"]);
      assert.equal(captions.length, 1);
      assert.ok(text(captions[0]).length > 80, `${kind} explains its visual sequence`);
      assert.equal(walk(stage, node => node.type === "figcaption" || node === p.control).length, 0);
      assert.equal(walk(stage, node => node.type === "button" || node.type === "input" || node.type === "a").length, 0, "Decorative controls do not create hidden keyboard stops");
      const title = text(byClass(stage, "cmd-stage-meta")[0].props.children[0]);
      assert.ok(p.control.props["aria-label"].includes(title));
      names.add(p.control.props["aria-label"]);
    });
    assert.equal(names.size, 4, "Playback controls are distinguishable when all mobile demos are mounted");
  }
});

test("Strategy connects a localized business goal, three real pages and a project enquiry action", t => {
  for (const locale of ["ua", "en"]) {
    const p = fixture({ kind: "strategy", locale });
    t.after(() => p.unmount());
    const goal = locale === "ua" ? "Отримати звернення" : "Get an enquiry";
    const pages = locale === "ua" ? ["Головна", "Послуги", "Контакт"] : ["Home", "Services", "Contact"];
    const action = locale === "ua" ? "Обговорити проєкт" : "Discuss a project";
    assert.equal(text(byClass(p.root, "cst-goal-title")[0]), goal);
    assert.deepEqual(byClass(p.root, "cst-page-title").map(text), pages);
    assert.equal(text(byClass(p.root, "cst-cta-copy")[0]).replace("↗", ""), action);
    const route = byClass(p.root, "cst-route")[0];
    assert.equal(route.type, "path");
    assert.ok(route.props.d.length > 0);
    const caption = text(walk(p.root, node => node.type === "figcaption")[0]);
    for (const label of [goal, ...pages, action]) assert.ok(caption.includes(label), `Caption includes ${label}`);
  }
});

test("Strategy finishes its visible route before filling the CTA and holds the completed route before fading", () => {
  const css = readFileSync(new URL("../app/capability-strategy-demo.css", import.meta.url), "utf8");
  const common = readFileSync(new URL("../app/capability-motion-demo.css", import.meta.url), "utf8");
  const routeFrames = keyframesFor(css, ".cst-demo .cst-route");
  const routeOpacity = numericTrack(routeFrames, "opacity");
  const dash = numericTrack(routeFrames, "stroke-dashoffset");
  const completion = dash.find(frame => frame.value === 0 && trackValue(routeOpacity, frame.at) === 1)?.at;
  assert.ok(Number.isFinite(completion), "The drawn route reaches a visible zero dash offset");

  const fillFrames = keyframesFor(css, ".cst-demo .cst-cta-fill");
  const fill = numericTrack(fillFrames, "transform", value => Number(value.match(/scaleX\(([-\d.]+)\)/)?.[1]));
  const fillStart = fill.find((frame, i) => frame.value === 0 && fill[i + 1]?.value > 0)?.at;
  assert.ok(Number.isFinite(fillStart), "CTA fill begins after its initial empty hold");
  assert.ok(fillStart > completion, `CTA fill starts at ${fillStart}%, after the route completes at ${completion}%`);
  assert.equal(trackValue(dash, fillStart), 0, "The route is fully drawn when the CTA starts filling");

  const sceneOpacity = numericTrack(keyframesFor(css, ".cst-demo .cst-scene"), "opacity");
  const ctaFrames = keyframesFor(css, ".cst-demo .cst-cta");
  const ctaOpacity = numericTrack(ctaFrames, "opacity");
  const visibleUntil = Math.min(opaqueUntil(sceneOpacity, completion), opaqueUntil(routeOpacity, completion), opaqueUntil(ctaOpacity, completion));
  const seconds = Number(cssRule(common, ".cmd-motion")["--cmd-loop"].replace("s", ""));
  const holdSeconds = (visibleUntil - completion) / 100 * seconds;
  assert.ok(holdSeconds >= 0.5, `The completed route remains fully visible for ${holdSeconds.toFixed(2)} seconds before fading`);
  for (const frame of ctaFrames) {
    const scales = [...(frame.values.transform ?? "").matchAll(/\bscale(?:X|Y)?\(([^)]+)\)/g)].flatMap(match => match[1].split(/[\s,]+/).map(Number));
    assert.ok(scales.every(value => value === 1), "The outer CTA does not simulate a press during the route sequence");
  }
});

test("Strategy's normalized SVG route ends inside the CTA and scales its dash with the responsive diagram", t => {
  const p = fixture({ kind: "strategy" });
  t.after(() => p.unmount());
  const css = readFileSync(new URL("../app/capability-strategy-demo.css", import.meta.url), "utf8");
  const svg = byClass(p.root, "cst-connections")[0];
  const route = byClass(p.root, "cst-route")[0];
  const endpoint = orthogonalEndpoint(route.props.d);
  const [originX, originY, width, height] = svg.props.viewBox.split(/\s+/).map(Number);
  const sceneHeight = pixels(cssRule(css, ".cst-demo .cst-scene").height, height);
  const cta = cssRule(css, ".cst-demo .cst-cta");
  const left = pixels(cta.left, width);
  const right = left + pixels(cta.width, width);
  const top = pixels(cta.top, sceneHeight);
  const bottom = top + pixels(cta.height, sceneHeight);
  const x = endpoint.x - originX;
  const y = (endpoint.y - originY) / height * sceneHeight;
  assert.ok(x > left && x < right && y > top && y < bottom, `Route endpoint (${x}, ${y}) enters the CTA interior (${left}, ${top})–(${right}, ${bottom})`);

  assert.equal(Number(route.props.pathLength), 100, "Dash lengths are normalized to the complete route");
  assert.equal(svg.props.preserveAspectRatio, "none", "The SVG follows the scene's responsive dimensions");
  const routeStyle = cssRule(css, ".cst-demo .cst-route");
  const vectorEffect = routeStyle["vector-effect"] ?? route.props.vectorEffect ?? "none";
  assert.notEqual(vectorEffect, "non-scaling-stroke", "A normalized dash must scale with the nonuniform SVG instead of being clipped short");
});

test("Design preserves the same localized heading, message, artwork and action through wireframe, styled and mobile layouts", t => {
  for (const locale of ["ua", "en"]) {
    const p = fixture({ kind: "design", locale });
    t.after(() => p.unmount());
    const heading = locale === "ua" ? "Ваш новий проєкт" : "Your next project";
    const note = locale === "ua" ? "Від ідеї до запуску." : "From idea to launch.";
    const action = locale === "ua" ? "Переглянути" : "View project";
    const devices = ["cds-wireframe", "cds-styled", "cds-responsive"].map(name => byClass(p.root, name)[0]);
    let artwork;
    for (const device of devices) {
      assert.equal(text(byClass(device, "cds-title")[0]), heading);
      assert.equal(text(byClass(device, "cds-note")[0]), note);
      assert.equal(text(byClass(device, "cds-action")[0]).replace("↗", ""), action);
      const paths = walk(byClass(device, "cds-art")[0], node => node.type === "path").map(path => path.props.d);
      assert.ok(paths.length > 0, "The page includes its illustration");
      if (artwork) assert.deepEqual(paths, artwork, "The illustration survives the responsive change");
      artwork = paths;
    }
  }
});

test("Development publishes matching before and after CMS titles to the website preview through its save action", t => {
  for (const locale of ["ua", "en"]) {
    const p = fixture({ kind: "development", locale });
    t.after(() => p.unmount());
    const before = locale === "ua" ? "Новий проєкт" : "New project";
    const after = locale === "ua" ? "Ваш проєкт" : "Your project";
    assert.notEqual(before, after);
    for (const target of ["editor", "site"]) {
      assert.equal(text(byClass(p.root, `cdev-${target}-before`)[0]), before);
      assert.equal(text(byClass(p.root, `cdev-${target}-after`)[0]), after);
    }
    assert.equal(text(byClass(p.root, "cdev-save-before")[0]).replace("↗", ""), locale === "ua" ? "Зберегти" : "Save");
    assert.equal(text(byClass(p.root, "cdev-save-after")[0]), locale === "ua" ? "Збережено" : "Saved");
    const caption = text(walk(p.root, node => node.type === "figcaption")[0]);
    assert.ok(caption.includes(before) && caption.includes(after));
  }
});

test("Motion retains its localized project card, launch reaction and completed state inside the shared frame", t => {
  for (const locale of ["ua", "en"]) {
    const p = fixture({ kind: "motion", locale });
    t.after(() => p.unmount());
    assert.deepEqual(byClass(p.root, "cmd-title").map(text), locale === "ua"
      ? ["Ідея в русі.", "Проєкт онлайн."] : ["Make it move.", "Project is live."]);
    assert.deepEqual(byClass(p.root, "cmd-action-copy").map(node => text(node).replace("↗", "")), locale === "ua"
      ? ["Запустити проєкт", "Переглянути проєкт"] : ["Launch project", "View project"]);
    assert.equal(byClass(p.root, "cmd-cursor").length, 1);
    assert.equal(byClass(p.root, "cmd-check").length, 1);
  }
});

test("all scene animation names resolve to keyframes and share the common 8–10 second playback clock", () => {
  const styles = kinds.map(kind => readFileSync(new URL(`../app/capability-${kind}-demo.css`, import.meta.url), "utf8"));
  const keyframes = new Set(styles.flatMap(css => [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(match => match[1])));
  for (const [i, css] of styles.entries()) {
    const names = [...css.matchAll(/animation-name:\s*([\w-]+)\s*;/g)].map(match => match[1]);
    assert.ok(names.length > 0, `${kinds[i]} defines animated tracks`);
    for (const name of names) assert.ok(keyframes.has(name), `${name} has a defined keyframe sequence`);
  }
  const common = styles[kinds.indexOf("motion")];
  const duration = Number(common.match(/--cmd-loop:\s*([\d.]+)s\s*;/)?.[1]);
  assert.ok(duration >= 8 && duration <= 10);
  assert.match(common, /\.cmd-motion\s+\.cmd-animated\s*\{[^}]*animation-duration:\s*var\(--cmd-loop\)/);
  for (const css of styles.slice(0, 3)) assert.doesNotMatch(css, /animation-duration:/, "Scene tracks retain the shared clock");
});

test("desktop click, focus and hover select all four localized demos and mobile accordions contain their matching demos", () => {
  for (const locale of ["ua", "en"]) {
    const slots = [];
    let index = 0;
    let tree;
    const exports = {};
    const jsx = (type, props) => ({ type, props });
    const dependencies = {
      "next/image": { default: "image" },
      "@/components/ui/accordion": {
        Accordion: "accordion", AccordionItem: "accordion-item", AccordionTrigger: "accordion-trigger", AccordionContent: "accordion-content",
      },
      "./faq": { Faq: "faq" },
      "./hero-technology-field": { HeroTechnologyField: "hero-technology-field" },
      "./featured-solarcity": { FeaturedSolarcity: "featured-solarcity" },
      "./services": { getServices: () => [] },
      "./price-text": { PriceText: "price-text" },
      "./site-chrome": { SiteHeader: "site-header" },
      "./testimonials": { Testimonials: "testimonials" },
      "./capability-motion-demo": { CapabilityMotionDemo: "capability-motion-demo" },
      "./capability-strategy-demo": { CapabilityStrategyDemo: "capability-strategy-demo" },
      "./capability-design-demo": { CapabilityDesignDemo: "capability-design-demo" },
      "./capability-development-demo": { CapabilityDevelopmentDemo: "capability-development-demo" },
    };
    vm.runInNewContext(source("site-client"), {
      exports,
      require(name) {
        if (name === "react") return {
          useState(initial) {
            const slot = slots[index++] ??= { value: initial };
            return [slot.value, value => { slot.value = typeof value === "function" ? value(slot.value) : value; }];
          },
          useRef(initial) { return slots[index++] ??= { current: initial }; },
          useEffect() {},
        };
        if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
        if (dependencies[name]) return dependencies[name];
        throw new Error(`Unexpected site import: ${name}`);
      },
    });
    const render = () => { index = 0; tree = resolve(exports.HoverSite({ locale })); };
    const desktop = () => walk(tree, hasClass("cap-desktop"))[0];
    const visual = () => walk(desktop(), hasClass("cap-visual"))[0];
    const rows = () => walk(tree, hasClass("cap-rows"))[0].props.children;
    const demos = node => walk(node, child => kinds.some(kind => child.type === `capability-${kind}-demo`));
    render();
    assert.equal(rows().length, 4);
    for (const [selected, kind] of kinds.entries()) {
      for (const handler of ["onClick", "onFocus", "onMouseEnter"]) {
        rows()[selected].props[handler]();
        render();
        assert.equal(demos(visual()).length, 1);
        assert.equal(demos(visual())[0].type, `capability-${kind}-demo`);
        assert.equal(demos(visual())[0].props.locale, locale);
        assert.equal(rows()[selected].props.className, "active");
        assert.deepEqual(Array.from(rows(), row => row.props["aria-pressed"]), kinds.map((_, i) => i === selected));
      }
    }
    assert.equal(walk(visual(), hasClass("cap-diagram")).length, 0);

    const mobile = walk(tree, hasClass("cap-mobile"))[0];
    assert.equal(mobile.type, "accordion");
    assert.equal(mobile.props.type, "single", "Opening a mobile capability closes the previous capability");
    assert.equal(mobile.props.collapsible, true, "The selected mobile capability can also be collapsed");
    const contents = walk(mobile, node => node.type === "accordion-content");
    assert.equal(contents.length, 4);
    for (const [i, kind] of kinds.entries()) {
      assert.equal(demos(contents[i]).length, 1);
      assert.equal(demos(contents[i])[0].type, `capability-${kind}-demo`);
      assert.equal(demos(contents[i])[0].props.locale, locale);
    }

    rows()[0].props.onClick();
    render();
    assert.equal(demos(visual())[0].type, "capability-strategy-demo", "Returning from Motion restores Strategy");
  }
});
