import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../app/solarcity-motion.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } },
).outputText;
const css = readFileSync(new URL("../app/solarcity-motion.css", import.meta.url), "utf8");

function walk(node, predicate, result = []) {
  if (Array.isArray(node)) node.forEach(child => walk(child, predicate, result));
  else if (node && typeof node === "object") {
    if (predicate(node)) result.push(node);
    walk(node.props?.children, predicate, result);
  }
  return result;
}
const byClass = (tree, name) => walk(tree, node => node.props?.className?.split(" ").includes(name));
const text = node => Array.isArray(node) ? node.map(text).join(" ")
  : node && typeof node === "object" ? text(node.props?.children) : String(node ?? "");
function key(key) {
  return { key, prevented: false, preventDefault() { this.prevented = true; } };
}

// Execute the real hooks, effect dependencies, handlers and timer cleanup. The
// DOM geometry is deterministic; this harness creates no browser or listener.
function fixture({ reduced = false } = {}) {
  let current;
  let now = 0;
  let timerId = 0;
  let uid = 0;
  const timers = new Map();
  const media = new EventTarget();
  media.matches = reduced;
  const doc = new EventTarget();
  doc.hidden = false;
  const intersections = [];
  const resizeObservers = [];
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; intersections.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.disconnected = true; }
  }
  class ResizeObserver {
    constructor(callback) { this.callback = callback; resizeObservers.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.disconnected = true; }
  }
  const window = new EventTarget();
  Object.assign(window, {
    IntersectionObserver,
    ResizeObserver,
    matchMedia: () => media,
    setTimeout: (callback, delay) => { timers.set(++timerId, { callback, at: now + delay }); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  const hooks = {
    useState(initial) {
      const runner = current;
      const index = runner.index++;
      if (!runner.slots[index]) runner.slots[index] = { value: typeof initial === "function" ? initial() : initial };
      const slot = runner.slots[index];
      return [slot.value, value => {
        const next = typeof value === "function" ? value(slot.value) : value;
        if (!Object.is(next, slot.value)) { slot.value = next; runner.dirty = true; }
      }];
    },
    useRef(initial) {
      const runner = current;
      const index = runner.index++;
      return runner.slots[index] ??= { current: initial };
    },
    useId() {
      const runner = current;
      const index = runner.index++;
      return (runner.slots[index] ??= { value: `:test-${++uid}:` }).value;
    },
    useEffect: (callback, deps) => registerEffect(callback, deps, false),
    useLayoutEffect: (callback, deps) => registerEffect(callback, deps, true),
  };
  function registerEffect(callback, deps, layout) {
    const runner = current;
    const index = runner.index++;
    const slot = runner.slots[index] ??= {};
    if (!slot.deps || deps.some((value, i) => !Object.is(value, slot.deps[i]))) {
      slot.deps = deps;
      runner.effects.push({ slot, callback, layout });
    }
  }
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(source, {
    exports, window, document: doc, IntersectionObserver, ResizeObserver,
    require: name => {
      if (name === "react") return hooks;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  function mount(component, props) {
    const runner = {
      slots: [], effects: [], elements: new Map(), props,
      render(nextProps = runner.props) {
        runner.props = nextProps;
        let iterations = 0;
        do {
          assert.ok(++iterations < 20, "Effects must settle without an update loop");
          runner.index = 0;
          runner.dirty = false;
          current = runner;
          runner.tree = component(runner.props);
          current = null;
          walk(runner.tree, node => typeof node.type === "string").forEach((node, index) => {
            if (!node.props?.ref) return;
            const element = runner.elements.get(index) ?? {
              focus() { runner.focused = node.props.id; },
              getBoundingClientRect: () => ({ width: 600, height: 260, left: 100 }),
              getTotalLength: () => 900,
              getPointAtLength: length => ({ x: 50 + length, y: 330 - length / 4 }),
            };
            runner.elements.set(index, element);
            if (typeof node.props.ref === "function") node.props.ref(element);
            else node.props.ref.current = element;
          });
          const pending = runner.effects.splice(0).sort((a, b) => Number(b.layout) - Number(a.layout));
          pending.forEach(({ slot, callback }) => { slot.cleanup?.(); slot.cleanup = callback(); });
        } while (runner.dirty);
        return runner.tree;
      },
      unmount() { runner.slots.forEach(slot => slot.cleanup?.()); },
    };
    runner.render();
    return runner;
  }
  const root = mount(exports.SolarCityMotionShowcase, { locale: "en" });
  const component = name => walk(root.tree, node => node.type?.name === name)[0];
  return {
    root, mount, component, timers, intersections, resizeObservers,
    show(visible) { intersections[0].callback([{ isIntersecting: visible }]); root.render(); },
    preference(value) { media.matches = value; media.dispatchEvent(new Event("change")); root.render(); },
    hidden(value) { doc.hidden = value; doc.dispatchEvent(new Event("visibilitychange")); root.render(); },
    advance(milliseconds) {
      now += milliseconds;
      for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.callback(); }
    },
  };
}

test("all six native node buttons respond to click and keyboard focus with matching content and flows", () => {
  const p = fixture();
  const node = p.component("EnergyNetwork");
  const network = p.mount(node.type, node.props);
  const expected = ["SOLAR GENERATION", "ENERGY STORAGE", "SUBSTATION", "GRID", "INDUSTRY", "CITY"];
  const connectedFlows = [2, 2, 3, 2, 3, 2];
  expected.forEach((label, index) => {
    const button = byClass(network.tree, "sc-node")[index];
    assert.equal(button.type, "button");
    assert.equal(button.props.type, "button");
    button.props.onClick();
    network.render();
    assert.equal(byClass(network.tree, "sc-node").filter(node => node.props["aria-pressed"]).length, 1);
    assert.equal(byClass(network.tree, "sc-node")[index].props["aria-pressed"], true);
    assert.match(text(byClass(network.tree, "sc-node-copy")[0]), new RegExp(label));
    assert.equal(byClass(network.tree, "sc-flow").filter(path => path.props.className.includes("is-active")).length, connectedFlows[index]);
  });
  byClass(network.tree, "sc-node")[1].props.onFocus();
  network.render();
  assert.equal(byClass(network.tree, "sc-node")[1].props["aria-pressed"], true);
  assert.match(text(byClass(network.tree, "sc-node-copy")[0]), /ENERGY STORAGE/);
  network.unmount(); p.root.unmount();
});

test("tabs support click, arrows, Home and End with roving focus and only one visible panel", () => {
  const p = fixture();
  const tablist = () => walk(p.root.tree, node => node.props?.role === "tablist")[0];
  const tabs = () => walk(p.root.tree, node => node.props?.role === "tab");
  tabs()[1].props.onClick(); p.root.render();
  assert.equal(tabs()[1].props["aria-selected"], true);
  for (const [name, selected] of [["ArrowRight", 0], ["ArrowLeft", 1], ["Home", 0], ["End", 1]]) {
    const event = key(name); tablist().props.onKeyDown(event); p.root.render();
    assert.equal(event.prevented, true);
    assert.equal(tabs()[selected].props.tabIndex, 0);
    assert.equal(tabs()[1 - selected].props.tabIndex, -1);
    assert.equal(p.root.focused, tabs()[selected].props.id);
    const panels = walk(p.root.tree, node => node.props?.role === "tabpanel");
    assert.equal(panels[selected].props.hidden, false);
    assert.equal(panels[1 - selected].props.hidden, true);
    assert.equal(tabs()[selected].props["aria-controls"], panels[selected].props.id);
  }
  const event = key("Tab"); tablist().props.onKeyDown(event);
  assert.equal(event.prevented, false);
  p.root.unmount();
});

test("three scenarios change curve and explanatory state; paused changes are immediate", () => {
  const p = fixture();
  const node = p.component("DailyCurve");
  const curve = p.mount(node.type, { ...node.props, running: false });
  const paths = new Set();
  for (let index = 0; index < 3; index++) {
    const button = byClass(curve.tree, "sc-model")[index];
    (index === 1 ? button.props.onFocus : button.props.onClick)();
    curve.render();
    assert.equal(byClass(curve.tree, "sc-model")[index].props["aria-pressed"], true);
    assert.equal(byClass(curve.tree, "sc-model").filter(node => node.props["aria-pressed"]).length, 1);
    paths.add(byClass(curve.tree, "sc-curve-line")[0].props.d);
    assert.equal(byClass(curve.tree, "sc-curve-plot")[0].props["data-switching"], false);
    assert.ok(text(byClass(curve.tree, "sc-curve-note")[0]).length > 40);
  }
  assert.equal(paths.size, 3);
  assert.equal(p.timers.size, 0);
  curve.unmount(); p.root.unmount();
});

test("slider, arrow keys and pointer keep time within a full day while touch scrolling stays passive", () => {
  const p = fixture();
  const node = p.component("DailyCurve");
  const curve = p.mount(node.type, node.props);
  const slider = () => walk(curve.tree, node => node.props?.type === "range")[0];
  const time = () => text(walk(curve.tree, node => node.type === "output")[0]);
  slider().props.onChange({ target: { value: ".5" } }); curve.render();
  assert.equal(time(), "12:00");
  assert.match(slider().props["aria-valuetext"], /12:00/);
  slider().props.onChange({ target: { value: ".99" } }); curve.render();
  const right = key("ArrowRight"); slider().props.onKeyDown(right); curve.render();
  assert.equal(right.prevented, true); assert.equal(slider().props.value, 1); assert.equal(time(), "24:00");
  slider().props.onChange({ target: { value: ".01" } }); curve.render();
  slider().props.onKeyDown(key("ArrowLeft")); curve.render();
  assert.equal(slider().props.value, 0); assert.equal(time(), "00:00");
  const pointer = clientX => ({ clientX, pointerType: "mouse", currentTarget: { getBoundingClientRect: () => ({ left: 100, width: 600 }) } });
  byClass(curve.tree, "sc-curve-svg")[0].props.onPointerDown(pointer(10_000)); curve.render();
  assert.equal(slider().props.value, 1);
  byClass(curve.tree, "sc-curve-svg")[0].props.onPointerDown(pointer(-100)); curve.render();
  assert.equal(slider().props.value, 0);
  byClass(curve.tree, "sc-curve-svg")[0].props.onPointerMove({ ...pointer(400), pointerType: "touch", buttons: 0 }); curve.render();
  assert.equal(slider().props.value, 0);
  curve.unmount(); p.root.unmount();
});

test("Pause, offscreen visibility and document hiding stop motion and restore safely", () => {
  const p = fixture();
  assert.equal(p.root.tree.props["data-running"], false);
  p.show(true); assert.equal(p.root.tree.props["data-running"], true);
  byClass(p.root.tree, "sc-pause")[0].props.onClick(); p.root.render();
  assert.equal(p.root.tree.props["data-running"], false);
  assert.equal(byClass(p.root.tree, "sc-pause")[0].props["aria-pressed"], true);
  p.show(false); p.show(true);
  assert.equal(p.root.tree.props["data-running"], false, "Viewport changes must preserve manual pause");
  byClass(p.root.tree, "sc-pause")[0].props.onClick(); p.root.render();
  assert.equal(p.root.tree.props["data-running"], true);
  p.hidden(true); assert.equal(p.root.tree.props["data-running"], false);
  p.hidden(false); assert.equal(p.root.tree.props["data-running"], true);
  p.show(false); assert.equal(p.root.tree.props["data-running"], false);
  assert.match(css, /\.sc-motion\[data-running='false'\][^{]+\{\s*animation-play-state:\s*paused\s*!important/);
  p.root.unmount();
  assert.equal(p.intersections[0].disconnected, true);
});

test("reduced motion starts paused, allows explicit Play, and resets that opt-in on preference changes", () => {
  const p = fixture({ reduced: true });
  p.show(true);
  assert.equal(p.root.tree.props["data-reduced"], true);
  assert.equal(p.root.tree.props["data-running"], false);
  assert.equal(byClass(p.root.tree, "sc-pause")[0].props["aria-pressed"], true);
  byClass(p.root.tree, "sc-pause")[0].props.onClick(); p.root.render();
  assert.equal(p.root.tree.props["data-running"], true);
  assert.equal(p.root.tree.props["data-reduced"], false);
  p.preference(true);
  assert.equal(p.root.tree.props["data-running"], false);
  assert.equal(p.root.tree.props["data-reduced"], true);
  p.preference(false);
  assert.equal(p.root.tree.props["data-running"], true);
  p.preference(true);
  assert.equal(p.root.tree.props["data-running"], false);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.sc-motion\[data-reduced='true'\][^{]+\{\s*animation:\s*none\s*!important/);
  p.root.unmount();
});

test("animated scenario timers settle, cancel when motion stops, and clean up on unmount", () => {
  const p = fixture();
  const node = p.component("DailyCurve");
  const curve = p.mount(node.type, { ...node.props, running: true });
  const original = byClass(curve.tree, "sc-curve-line")[0].props.d;
  byClass(curve.tree, "sc-model")[1].props.onClick(); curve.render();
  assert.equal(byClass(curve.tree, "sc-curve-plot")[0].props["data-switching"], true);
  assert.equal(p.timers.size, 1);
  p.advance(120); curve.render();
  assert.notEqual(byClass(curve.tree, "sc-curve-line")[0].props.d, original);
  assert.equal(p.timers.size, 0);
  byClass(curve.tree, "sc-model")[2].props.onClick(); curve.render();
  assert.equal(p.timers.size, 1);
  curve.render({ ...node.props, running: false });
  assert.equal(p.timers.size, 0);
  assert.equal(byClass(curve.tree, "sc-curve-plot")[0].props["data-switching"], false);
  curve.render({ ...node.props, running: true });
  byClass(curve.tree, "sc-model")[0].props.onClick(); curve.render();
  assert.equal(p.timers.size, 1);
  curve.unmount(); p.root.unmount();
  assert.equal(p.timers.size, 0);
  assert.equal(p.resizeObservers[0].disconnected, true);
});
