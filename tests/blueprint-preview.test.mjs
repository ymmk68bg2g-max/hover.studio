import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../app/blueprint-preview.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } },
).outputText;

function walk(node, predicate, result = []) {
  if (Array.isArray(node)) node.forEach(child => walk(child, predicate, result));
  else if (node && typeof node === "object") {
    if (predicate(node)) result.push(node);
    walk(node.props?.children, predicate, result);
  }
  return result;
}
const byClass = (tree, name) => walk(tree, node => node.props?.className?.split(" ").includes(name));
const text = node => Array.isArray(node) ? node.map(text).join("")
  : node && typeof node === "object" ? text(node.props?.children) : String(node ?? "");

// Run the component's real state, effects and event handlers. Dialog is the only
// UI dependency stubbed; its viewport ref is mounted only while the dialog opens.
function fixture(locale = "en") {
  const slots = [];
  const viewport = { scrollLeft: 0, scrollTop: 0 };
  let index = 0;
  let effects = [];
  let tree;
  const hooks = {
    useState(initial) {
      const slot = slots[index++] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slot.value, next => { slot.value = typeof next === "function" ? next(slot.value) : next; }];
    },
    useRef(initial) { return slots[index++] ??= { current: initial }; },
    useId() { return (slots[index++] ??= { value: ":blueprint-test:" }).value; },
    useEffect(callback, deps) {
      const slot = slots[index++] ??= {};
      if (!slot.deps || deps.length !== slot.deps.length || deps.some((value, i) => !Object.is(value, slot.deps[i]))) {
        slot.deps = deps;
        effects.push({ slot, callback });
      }
    },
  };
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "react") return hooks;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (name === "@/components/ui/dialog") return {
        Dialog: "dialog", DialogClose: "dialog-close", DialogContent: "dialog-content", DialogTitle: "dialog-title",
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const result = {
    viewport,
    render() {
      index = 0;
      tree = exports.BlueprintPreview({ locale });
      byClass(tree, "bp-master-viewport")[0].props.ref.current = tree.props.open ? viewport : null;
      const pending = effects;
      effects = [];
      pending.forEach(({ slot, callback }) => { slot.cleanup?.(); slot.cleanup = callback(); });
      return tree;
    },
    get tree() { return tree; },
    get options() { return byClass(tree, "bp-preview-option"); },
    get sheet() { return byClass(tree, "bp-preview-sheet")[0]; },
    get content() { return walk(tree, node => node.type === "dialog-content")[0]; },
    get zoom() { return byClass(tree, "bp-master-toolbar")[0].props.children[1]; },
    select(page) { result.options[page].props.onClick(); result.render(); },
    open(opener = { focus() {} }) { result.sheet.props.onClick({ currentTarget: opener }); result.render(); },
    unmount() { slots.forEach(slot => slot.cleanup?.()); },
  };
  result.render();
  return result;
}

const pages = [
  { src: "/case/blueprint/commercial-pipeline-master.png", preview: "/case/blueprint/commercial-pipeline-master.png", width: 2048, height: 1365,
    ua: { title: "Комерційний pipeline", label: "СИСТЕМА / ПРОЦЕС" },
    en: { title: "The Commercial Pipeline", label: "SYSTEM / PROCESS" } },
  { src: "/case/blueprint/mira-keyframe-breakdown-master.png", preview: "/case/blueprint/mira-keyframe-breakdown-preview-1200.webp", width: 1638, height: 2048,
    ua: { title: "MIRA — розбір ключових кадрів", label: "КЕЙС / КЛЮЧОВІ КАДРИ" },
    en: { title: "MIRA — Keyframe Breakdown", label: "CASE / KEYFRAMES" } },
  { src: "/case/blueprint/tissot-product-fidelity-master.png", preview: "/case/blueprint/tissot-product-fidelity-preview-1200.webp", width: 1638, height: 2048,
    ua: { title: "TISSOT — точність продукту", label: "КЕЙС / КОНТРОЛЬ ПРОДУКТУ" },
    en: { title: "TISSOT — Product Fidelity", label: "CASE / PRODUCT CONTROL" } },
];

test("all three page selectors update the matching preview and polite title in UA and EN", () => {
  for (const locale of ["ua", "en"]) {
    const p = fixture(locale);
    assert.equal(p.options.length, 3);
    assert.equal(p.options[0].props["aria-pressed"], true);
    pages.forEach((page, i) => {
      assert.equal(p.options[i].type, "button");
      assert.equal(p.options[i].props.type, "button");
      assert.ok(text(p.options[i]).includes(page[locale].title));
      p.select(i);
      assert.deepEqual(p.options.map(option => option.props["aria-pressed"]), pages.map((_, j) => j === i));
      const figure = byClass(p.tree, "bp-preview-page")[0];
      assert.ok(p.options.every(option => option.props["aria-controls"] === figure.props.id));
      const image = walk(p.sheet, node => node.type === "img")[0];
      assert.equal(image.props.src, page.preview);
      assert.ok(image.props.width > 0 && image.props.height > 0);
      assert.ok(image.props.alt.includes(locale === "ua" ? "оригінальна сторінка Blueprint" : "original Blueprint page"));
      const title = byClass(p.tree, "bp-preview-title")[0];
      assert.equal(text(title), `0${i + 1} / ${page[locale].title}`);
      assert.equal(title.props["aria-live"], "polite");
      assert.equal(title.props["aria-atomic"], "true");
      assert.equal(text(byClass(p.tree, "bp-preview-label")[0]), page[locale].label);
      assert.equal(p.tree.props.open, false, "choosing a page does not open its dialog");
    });
    p.unmount();
  }
});

test("enlarge opens the selected high resolution master with localized accessible controls", () => {
  for (const locale of ["ua", "en"]) {
    const p = fixture(locale);
    const group = byClass(p.tree, "bp-preview-controls")[0];
    assert.equal(group.props["aria-label"], locale === "ua" ? "Оберіть сторінку Blueprint" : "Choose a Blueprint page");
    assert.equal(text(byClass(p.tree, "bp-preview-hint")[0]), locale === "ua"
      ? "Оберіть сторінку та натисніть на неї, щоб розглянути оригінал."
      : "Choose a page and select it to inspect the original.");
    pages.forEach((page, i) => {
      p.select(i);
      assert.equal(p.sheet.props["aria-haspopup"], "dialog");
      assert.equal(p.sheet.props["aria-label"], `${locale === "ua" ? "Збільшити оригінальну сторінку" : "Enlarge original page"}: ${page[locale].title}`);
      p.open();
      assert.equal(p.tree.props.open, true);
      assert.equal(text(walk(p.content, node => node.type === "dialog-title")[0]), `BLUEPRINT / ${page[locale].title}`);
      const image = walk(p.content, node => node.type === "img")[0];
      assert.equal(image.props.src, page.src);
      assert.equal(image.props.width, page.width);
      assert.equal(image.props.height, page.height);
      assert.equal(image.props.alt, walk(p.sheet, node => node.type === "img")[0].props.alt);
      assert.equal(image.props.draggable, false);
      const viewport = byClass(p.tree, "bp-master-viewport")[0];
      assert.equal(viewport.props.role, "region");
      assert.equal(viewport.props.tabIndex, 0);
      assert.equal(viewport.props["aria-label"], locale === "ua"
        ? "Оригінальна сторінка — прокручуйте у масштабі 100%"
        : "Original page — scroll when viewing at 100%");
      assert.equal(text(walk(p.content, node => node.type === "dialog-close")[0]), locale === "ua" ? "ЗАКРИТИ" : "CLOSE");
      p.tree.props.onOpenChange(false);
      p.render();
    });
    p.unmount();
  }
});

test("100 percent and FIT toggles update zoom accessibly and reset both scroll axes", () => {
  for (const locale of ["ua", "en"]) {
    const p = fixture(locale);
    p.viewport.scrollLeft = 71;
    p.viewport.scrollTop = 230;
    p.open();
    assert.deepEqual(p.viewport, { scrollLeft: 0, scrollTop: 0 });
    assert.equal(p.content.props["data-zoomed"], false);
    assert.equal(p.zoom.props["aria-pressed"], false);
    assert.equal(text(p.zoom), "100%");
    assert.equal(p.zoom.props["aria-label"], locale === "ua" ? "Показати сторінку в оригінальному розмірі" : "Show the page at its original size");

    p.viewport.scrollLeft = 110;
    p.viewport.scrollTop = 440;
    p.render();
    assert.deepEqual(p.viewport, { scrollLeft: 110, scrollTop: 440 }, "an ordinary render preserves the reader's scroll position");
    p.zoom.props.onClick();
    p.render();
    assert.equal(p.content.props["data-zoomed"], true);
    assert.equal(p.zoom.props["aria-pressed"], true);
    assert.equal(text(p.zoom), locale === "ua" ? "ВМІСТИТИ" : "FIT");
    assert.equal(p.zoom.props["aria-label"], locale === "ua" ? "Вмістити всю сторінку" : "Fit the whole page");
    assert.deepEqual(p.viewport, { scrollLeft: 0, scrollTop: 0 });

    p.viewport.scrollLeft = 200;
    p.viewport.scrollTop = 600;
    p.zoom.props.onClick();
    p.render();
    assert.equal(p.content.props["data-zoomed"], false);
    assert.equal(p.zoom.props["aria-pressed"], false);
    assert.equal(text(p.zoom), "100%");
    assert.deepEqual(p.viewport, { scrollLeft: 0, scrollTop: 0 });
    p.unmount();
  }
});

test("dialog closure returns focus to its opener without scrolling", () => {
  const p = fixture();
  const focusCalls = [];
  const opener = { focus: options => focusCalls.push(options) };
  p.open(opener);
  p.tree.props.onOpenChange(false);
  p.render();
  assert.equal(p.tree.props.open, false);
  assert.equal(focusCalls.length, 0);
  let prevented = false;
  p.content.props.onCloseAutoFocus({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(focusCalls.length, 1);
  assert.equal(focusCalls[0].preventScroll, true);
  p.unmount();
});

test("reopening a different page starts fitted at the top and uses the latest opener", () => {
  const p = fixture();
  const focused = [];
  p.open({ focus: () => focused.push("first") });
  p.zoom.props.onClick();
  p.render();
  assert.equal(p.content.props["data-zoomed"], true);
  p.tree.props.onOpenChange(false);
  p.render();
  p.select(2);
  p.viewport.scrollLeft = 220;
  p.viewport.scrollTop = 820;
  p.open({ focus: options => { assert.equal(options.preventScroll, true); focused.push("latest"); } });
  assert.equal(p.tree.props.open, true);
  assert.equal(p.content.props["data-zoomed"], false);
  assert.equal(text(p.zoom), "100%");
  assert.deepEqual(p.viewport, { scrollLeft: 0, scrollTop: 0 });
  assert.equal(walk(p.content, node => node.type === "img")[0].props.src, pages[2].src);
  p.tree.props.onOpenChange(false);
  p.render();
  p.content.props.onCloseAutoFocus({ preventDefault() {} });
  assert.deepEqual(focused, ["latest"]);
  p.unmount();
});
