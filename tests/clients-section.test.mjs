import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const compiled = new Map();
const appSource = file => readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8");
const styleNames = new Proxy({}, { get: (_target, name) => String(name) });

function loadModule(file, imports = {}, globals = {}) {
  if (!compiled.has(file)) compiled.set(file, ts.transpileModule(appSource(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText);
  const exports = {};
  vm.runInNewContext(compiled.get(file), {
    exports,
    require(name) {
      if (name.endsWith(".module.css")) return { __esModule: true, default: styleNames };
      assert.ok(name in imports, `Unexpected runtime import in ${file}: ${name}`);
      return imports[name];
    },
    ...globals,
  }, { filename: file });
  return exports;
}

function walk(tree, predicate, found = []) {
  if (Array.isArray(tree)) tree.forEach(node => walk(node, predicate, found));
  else if (tree && typeof tree === "object") {
    if (predicate(tree)) found.push(tree);
    walk(tree.props?.children, predicate, found);
  }
  return found;
}

const text = tree => Array.isArray(tree) ? tree.map(text).join("")
  : tree && typeof tree === "object" ? text(tree.props?.children) : String(tree ?? "");
const byType = (tree, type) => walk(tree, node => node.type === type);
const byData = (tree, name) => walk(tree, node => node.props?.[name] !== undefined);

function resolve(tree) {
  if (Array.isArray(tree)) return tree.map(resolve);
  if (!tree || typeof tree !== "object") return tree;
  if (typeof tree.type === "function") return resolve(tree.type(tree.props));
  return { ...tree, props: { ...tree.props, children: resolve(tree.props?.children) } };
}

function componentImports(react, runtime) {
  const Link = props => runtime.jsx("a", { ...props });
  const Image = props => runtime.jsx("img", { ...props });
  return {
    react,
    "react/jsx-runtime": runtime,
    "next/link": { __esModule: true, default: Link },
    "next/image": { __esModule: true, default: Image },
    "./ui-arrow": loadModule("ui-arrow.tsx", { "react/jsx-runtime": runtime }),
  };
}

// These deliberately fictional records exist only in this test file. They
// exercise multiple-review states without adding fake clients to public data.
const clients = ["alpha", "beta", "gamma"].map((id, index) => ({
  id, name: `Fixture client ${id}`, logoSrc: `/fixtures/logo-${id}.svg`, logoWidth: 120 + index * 10,
  logoHeight: 36, caseHref: index === 0 ? "/ua/projects/fixture-alpha" : undefined,
}));
const review = (id, relatedClientIds = [id]) => ({
  id, status: "published", quote: `Fixture quote ${id}. ${id.repeat(8)} belongs to this author only.`,
  name: `Fixture author ${id}`, role: `Fixture role ${id}`, company: `Fixture company ${id}`,
  avatarSrc: `/fixtures/avatar-${id}.jpg`, relatedClientIds,
  caseLinks: [{ href: `/ua/projects/fixture-${id}`, label: `Fixture case ${id}` }],
});
const reviews = [review("alpha", ["alpha", "gamma"]), review("beta"), review("gamma", ["missing-client"])];

function serverRender(props) {
  const { ClientsSection } = loadModule("clients-section.tsx", componentImports(React, jsxRuntime));
  return renderToStaticMarkup(React.createElement(ClientsSection, props));
}

// Run the component's actual hooks and callbacks against deterministic timers.
// There is no browser, network, analytics API, or form submission in this suite.
function fixture({ locale = "ua", testimonials = reviews, logos = clients, reduced = false } = {}) {
  const slots = [], timers = new Map(), frames = new Map(), listeners = new Map();
  let hookIndex = 0, dirty = false, effects = [], tree, timerSequence = 0, now = 0;
  const props = { locale, testimonials, clients: logos };
  const media = {
    matches: reduced,
    addEventListener(type, callback) { listeners.set(callback, type); },
    removeEventListener(_type, callback) { listeners.delete(callback); },
  };
  const window = {
    matchMedia: () => media,
    setTimeout(callback, delay = 0) { const id = ++timerSequence; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(callback) { const id = ++timerSequence; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const memo = (callback, dependencies) => {
    const index = hookIndex++, previous = slots[index];
    if (!previous || !same(previous.dependencies, dependencies)) slots[index] = { value: callback(), dependencies };
    return slots[index].value;
  };
  const react = {
    useState(initial) {
      const index = hookIndex++;
      if (!(index in slots)) slots[index] = { value: typeof initial === "function" ? initial() : initial };
      return [slots[index].value, next => {
        const value = typeof next === "function" ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef(current) { const index = hookIndex++; return slots[index] ??= { current }; },
    useId() { const index = hookIndex++; return (slots[index] ??= { value: `clients-fixture-${index}` }).value; },
    useMemo: memo,
    useCallback: (callback, dependencies) => memo(() => callback, dependencies),
    useEffect(callback, dependencies) {
      const index = hookIndex++, previous = slots[index];
      if (!previous || !same(previous.dependencies, dependencies)) effects.push(() => {
        previous?.cleanup?.();
        slots[index] = { dependencies, cleanup: callback() };
      });
    },
  };
  react.useLayoutEffect = react.useEffect;
  const jsx = (type, nextProps, key) => ({ type, props: nextProps ?? {}, key });
  const runtime = { jsx, jsxs: jsx, Fragment: "fragment" };
  const { ClientsSection } = loadModule("clients-section.tsx", componentImports(react, runtime), {
    window,
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    requestAnimationFrame: window.requestAnimationFrame, cancelAnimationFrame: window.cancelAnimationFrame,
  });
  function render() {
    let cycles = 0;
    do {
      assert.ok(cycles++ < 25, "Component effects must settle without a render loop");
      hookIndex = 0; dirty = false; effects = [];
      tree = resolve(ClientsSection(props));
      for (const effect of effects) effect();
    } while (dirty);
    return tree;
  }
  const controls = () => byType(tree, "button");
  const buttonFor = direction => {
    const label = locale === "ua" ? (direction === 1 ? "Наступний відгук" : "Попередній відгук")
      : (direction === 1 ? "Next testimonial" : "Previous testimonial");
    const button = controls().find(node => node.props["aria-label"] === label);
    assert.ok(button, `${label} is a visible button`);
    assert.equal(button.props.type, "button");
    return button;
  };
  const instance = {
    get tree() { return tree; },
    get elapsed() { return now; },
    get pendingTimers() { return timers.size + frames.size; },
    get controls() { return controls(); },
    render,
    click(direction) {
      const button = buttonFor(direction);
      if (!button.props.disabled) button.props.onClick();
      return render();
    },
    batch(directions) {
      for (const direction of directions) {
        const button = buttonFor(direction);
        if (!button.props.disabled) button.props.onClick();
      }
      return render();
    },
    advance() {
      if (frames.size) {
        const callbacks = [...frames.values()]; frames.clear(); now += 16;
        callbacks.forEach(callback => callback(now));
      } else if (timers.size) {
        now = Math.min(...[...timers.values()].map(timer => timer.at));
        const due = [...timers].filter(([, timer]) => timer.at <= now);
        for (const [id, timer] of due) { if (timers.delete(id)) timer.callback(); }
      }
      return render();
    },
    settle() {
      let steps = 0;
      while (timers.size || frames.size) {
        assert.ok(steps++ < 50, "Manual navigation must settle instead of running an autoplay clock");
        instance.advance();
      }
      return tree;
    },
    update(testimonials) { props.testimonials = testimonials; return render(); },
    preference(matches) { media.matches = matches; for (const callback of [...listeners.keys()]) callback({ matches }); return render(); },
    unmount() { for (const slot of slots) slot?.cleanup?.(); },
  };
  render();
  return instance;
}

function assertRecord(tree, expected, all = reviews) {
  const quotes = byType(tree, "blockquote");
  assert.equal(quotes.length, 1, "Exactly one quote is rendered, with no hidden duplicate slides");
  assert.equal(byType(quotes[0], "p").map(paragraph => text(paragraph)).join("\n\n").trim(), expected.quote);
  const content = text(tree);
  assert.ok(content.includes(expected.name), "The quote has its matching author");
  if (expected.role) assert.ok(content.includes(expected.role));
  if (expected.company) assert.ok(content.includes(expected.company));
  for (const other of all.filter(item => item.id !== expected.id)) {
    assert.ok(!content.includes(other.quote), "Inactive quote is absent from DOM");
    assert.ok(!content.includes(other.name), "Inactive attribution is absent from DOM");
  }
  const avatars = byType(tree, "img").filter(node => String(node.props.className).split(" ").includes("avatar"));
  assert.equal(avatars.length, expected.avatarSrc ? 1 : 0);
  if (expected.avatarSrc) {
    assert.equal(avatars[0].props.src, expected.avatarSrc);
    assert.equal(avatars[0].props.alt, "", "The visible author already names a decorative avatar");
    assert.ok(avatars[0].props.width > 0 && avatars[0].props.height > 0);
  }
}

function assertPosition(tree, position, total, record) {
  const figures = byData(tree, "data-testimonial-id");
  assert.equal(figures.length, 1, "Only the active view is rendered");
  assert.equal(figures[0].props["data-testimonial-id"], record.id, "A view position keeps the genuine approved record ID");
  assert.equal(String(figures[0].props["data-testimonial-position"]), String(position));
  const counters = walk(tree, node => node.props?.className === "counter");
  assert.equal(counters.length, 1);
  assert.equal(text(counters[0]).trim(), `${String(position).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
}

for (const locale of ["ua", "en"]) {
  test(`${locale}: one published testimonial renders statically with a semantic quote and no redundant controls`, () => {
    const html = serverRender({ locale, clients, testimonials: [reviews[0]] });
    assert.match(html, /<section\b[^>]*id="clients"/);
    assert.equal((html.match(/id="clients"/g) ?? []).length, 1);
    assert.match(html, locale === "ua" ? /Наші клієнти/ : /Our clients/);
    assert.match(html, locale === "ua" ? /Обрані клієнти/ : /Selected clients/);
    assert.equal((html.match(/<blockquote\b/g) ?? []).length, 1);
    assert.ok(html.includes(reviews[0].quote));
    assert.doesNotMatch(html, /<button|01\s*\/\s*01/);
    assert.doesNotMatch(html, /AggregateRating|schema\.org\/Review|"ratingValue"/);
  });

  test(`${locale}: empty or draft-only testimonials never create a fake quote or empty carousel`, () => {
    for (const testimonials of [[], [{ ...reviews[0], status: "draft" }]]) {
      const html = serverRender({ locale, clients, testimonials });
      assert.match(html, /id="clients"/);
      assert.doesNotMatch(html, /<blockquote|<button|Fixture quote|Fixture author|01\s*\/\s*0/);
      assert.ok(html.includes(clients[0].name), "Confirmed client identity remains available");
    }
  });

  test(`${locale}: the two approved reviews render with localized controls and one active record`, () => {
    const { getClientsContent } = loadModule("client-data.ts");
    const data = getClientsContent(locale);
    const approved = data.testimonials[0];
    const before = JSON.stringify(data.testimonials);
    const html = serverRender({ locale, ...data });
    assert.equal((html.match(/<blockquote\b/g) ?? []).length, 1);
    assert.equal((html.match(/<button\b/g) ?? []).length, 2);
    assert.match(html, /01\s*\/\s*02/);
    assert.match(html, /data-testimonial-id="oleksandr-kastronov"/);
    assert.match(html, /data-testimonial-position="1"/);
    assert.ok(html.includes(approved.quote));
    assert.ok(html.includes(approved.name));
    assert.equal((html.match(new RegExp(`src="${approved.avatarSrc}"`, "g")) ?? []).length, 1);
    assert.ok(html.includes(locale === "ua" ? 'aria-label="Попередній відгук"' : 'aria-label="Previous testimonial"'));
    assert.ok(html.includes(locale === "ua" ? 'aria-label="Наступний відгук"' : 'aria-label="Next testimonial"'));
    assert.equal(JSON.stringify(data.testimonials), before, "Rendering never duplicates or mutates approved data");
    assert.equal(data.testimonials.length, 2);
  });

  test(`${locale}: manual navigation switches the full approved quote, author, portrait, case links and related client together`, () => {
    const { getClientsContent } = loadModule("client-data.ts");
    const data = getClientsContent(locale);
    const p = fixture({ locale, testimonials: data.testimonials, logos: data.clients });
    const assertApprovedView = index => {
      const approved = data.testimonials[index];
      assertRecord(p.tree, approved, data.testimonials);
      assertPosition(p.tree, index + 1, 2, approved);
      const links = byType(p.tree, "a").filter(node => node.props.className === "caseLink");
      assert.deepEqual(links.map(node => node.props.href), Array.from(approved.caseLinks, item => item.href));
      const activeIds = byData(p.tree, "data-client-id").filter(node => node.props["data-active"])
        .map(node => node.props["data-client-id"]);
      assert.deepEqual(activeIds, Array.from(approved.relatedClientIds));
      assert.equal(p.pendingTimers, 0, "A settled view never schedules autoplay");
    };
    assertApprovedView(0);
    assert.equal(p.controls.length, 2);
    for (const [direction, index] of [[1, 1], [1, 0], [-1, 1], [-1, 0]]) {
      p.click(direction); p.settle();
      assertApprovedView(index);
    }
    p.unmount();
  });

  test(`${locale}: multiple testimonials have localized vector buttons, one short polite announcement and no autoplay`, () => {
    const p = fixture({ locale });
    assertRecord(p.tree, reviews[0]);
    assert.equal(p.controls.length, 2);
    assert.deepEqual(p.controls.map(node => node.props["aria-label"]), locale === "ua"
      ? ["Попередній відгук", "Наступний відгук"] : ["Previous testimonial", "Next testimonial"]);
    for (const button of p.controls) {
      assert.equal(button.props.type, "button");
      assert.equal(byType(button, "svg").length, 1, "Navigation uses a vector arrow");
      assert.doesNotMatch(text(button), /[↗↘⬅➡⬆⬇]/u);
    }
    const live = walk(p.tree, node => node.props?.["aria-live"] === "polite");
    assert.equal(live.length, 1);
    assert.ok(text(live[0]).length < 80, "Announcement is short instead of rereading the entire quote");
    assert.ok(!text(live[0]).includes(reviews[0].quote));
    assert.equal(p.pendingTimers, 0, "Initial render never starts an autoplay timer");
    p.unmount();
  });
}

test("a manual transition switches complete records in 300 ms without exposing two quotes", () => {
  const p = fixture({ testimonials: reviews.slice(0, 2) });
  const phase = () => byData(p.tree, "data-transition")[0].props["data-transition"];
  p.click(1);
  assert.equal(phase(), "exit");
  assertPosition(p.tree, 1, 2, reviews[0]);
  assertRecord(p.tree, reviews[0]);
  p.advance();
  assert.equal(p.elapsed, 150);
  assert.equal(phase(), "enter");
  assertPosition(p.tree, 2, 2, reviews[1]);
  assertRecord(p.tree, reviews[1]);
  p.advance();
  assert.equal(p.elapsed, 300);
  assert.equal(phase(), "idle");
  assert.equal(p.pendingTimers, 0);
  p.unmount();
});

test("rapid batched navigation resolves to the correct approved record without creating repeat slots", () => {
  const { getClientsContent } = loadModule("client-data.ts");
  const data = getClientsContent("ua");
  const p = fixture({ testimonials: data.testimonials, logos: data.clients });
  let current = 0;
  for (const directions of [[1, 1, 1], [-1, -1, -1], [1, -1], [1, 1], [-1]]) {
    p.batch(directions);
    assertRecord(p.tree, data.testimonials[current], data.testimonials);
    current = (current + directions.reduce((sum, direction) => sum + direction, 0) + data.testimonials.length * directions.length) % data.testimonials.length;
    p.settle();
    assertPosition(p.tree, current + 1, 2, data.testimonials[current]);
    assertRecord(p.tree, data.testimonials[current], data.testimonials);
    assert.equal(p.pendingTimers, 0);
  }
  assert.doesNotMatch(appSource("clients-section.tsx"), /repeatSingleReview|positionStatus|:position-/);
  assert.doesNotMatch(appSource("site-client.tsx"), /repeatSingleReview/);
  p.unmount();
});

test("next and previous navigation cycle through complete records in both directions", () => {
  const p = fixture();
  for (const [direction, indices] of [[1, [1, 2, 0]], [-1, [2, 1, 0]]]) {
    for (const index of indices) {
      p.click(direction);
      p.settle();
      assertRecord(p.tree, reviews[index]);
    }
  }
  p.unmount();
});

test("rapid clicks never mix a quote, author or avatar and navigation remains usable after settling", () => {
  const p = fixture();
  for (const direction of [1, 1, -1, 1, 1, -1, -1, 1]) {
    p.click(direction);
    const shown = reviews.find(item => text(byType(p.tree, "blockquote")[0]).trim() === item.quote);
    assert.ok(shown, "Every transition render contains a valid complete review");
    assertRecord(p.tree, shown);
    if (p.pendingTimers) p.advance();
  }
  p.settle();
  const shown = reviews.find(item => text(byType(p.tree, "blockquote")[0]).trim() === item.quote);
  assertRecord(p.tree, shown);
  p.click(1); p.settle();
  assertRecord(p.tree, reviews[(reviews.indexOf(shown) + 1) % reviews.length]);
  p.unmount();
});

test("batched clicks accumulate against the requested record before React commits the next render", () => {
  const p = fixture();
  p.batch([1, 1]); p.settle();
  assertRecord(p.tree, reviews[2]);
  p.batch([-1, -1, -1, -1]); p.settle();
  assertRecord(p.tree, reviews[1]);
  p.batch([1, -1]); p.settle();
  assertRecord(p.tree, reviews[1]);
  p.unmount();
});

test("removing an active record or all published records cannot leave a blank or stale slide", () => {
  const p = fixture();
  p.click(1); p.settle();
  assertRecord(p.tree, reviews[1]);
  p.update([reviews[0], reviews[2]]);
  p.settle();
  const remaining = [reviews[0], reviews[2]];
  const shown = remaining.find(item => text(byType(p.tree, "blockquote")[0]).trim() === item.quote);
  assert.ok(shown);
  assertRecord(p.tree, shown);
  p.click(1);
  p.update([reviews[2]]);
  p.settle();
  assertRecord(p.tree, reviews[2]);
  assert.equal(p.controls.length, 0, "One remaining review becomes static");
  p.update([]); p.settle();
  assert.equal(byType(p.tree, "blockquote").length, 0);
  assert.equal(p.controls.length, 0);
  p.update([reviews[1]]); p.settle();
  assertRecord(p.tree, reviews[1]);
  p.unmount();
});

test("related-client markers update only for the active review while logos remain stable", () => {
  const p = fixture();
  const logoIds = () => byData(p.tree, "data-client-id").map(node => node.props["data-client-id"]);
  const activeIds = () => byData(p.tree, "data-client-id").filter(node => [true, "true"].includes(node.props["data-active"]))
    .map(node => node.props["data-client-id"]);
  const originalIds = logoIds();
  assert.deepEqual(activeIds(), ["alpha", "gamma"]);
  p.click(1); p.settle();
  assert.deepEqual(activeIds(), ["beta"]);
  p.click(1); p.settle();
  assert.deepEqual(activeIds(), [], "A missing related logo never highlights another client");
  assert.deepEqual(logoIds(), originalIds, "Logo order and instances do not depend on active review");
  p.unmount();
});

test("absent case links and unconfirmed optional attribution do not produce empty or fake controls", () => {
  const minimal = { id: "minimal", status: "published", name: "AB Example", quote: "Approved minimal text.", relatedClientIds: [] };
  const p = fixture({ testimonials: [minimal], logos: [{ id: "plain", name: "Plain confirmed company" }] });
  assertRecord(p.tree, minimal, [minimal]);
  assert.equal(byType(p.tree, "a").length, 0);
  assert.equal(byType(p.tree, "img").length, 0);
  assert.equal(text(walk(p.tree, node => node.props?.className === "initials")[0]), "AE");
  assert.doesNotMatch(text(p.tree), /undefined|null|View project|Переглянути проєкт/);
  p.unmount();
});

test("long testimonials preserve their full text and reduced motion remains manually navigable", () => {
  const long = { ...reviews[0], quote: `${"Long approved sentence remains readable. ".repeat(100)}Final sentence.` };
  const p = fixture({ testimonials: [long, reviews[1]], reduced: true });
  assertRecord(p.tree, long, [long, reviews[1]]);
  p.click(1); p.settle();
  assertRecord(p.tree, reviews[1], [long, reviews[1]]);
  p.click(-1); p.settle();
  assertRecord(p.tree, long, [long, reviews[1]]);
  p.preference(false);
  p.click(1); p.settle();
  assertRecord(p.tree, reviews[1], [long, reviews[1]]);
  p.unmount();
  assert.equal(p.pendingTimers, 0, "Unmount cleans transition timers");
});

test("unpublished records never participate in navigation, counters or related-client markers", () => {
  const drafts = [{ ...reviews[0], status: "draft" }, reviews[1], { ...reviews[2], status: "draft" }];
  const p = fixture({ testimonials: drafts });
  assertRecord(p.tree, reviews[1]);
  assert.equal(p.controls.length, 0, "Only one published item remains static even among drafts");
  assert.equal(p.pendingTimers, 0);
  p.unmount();
});

test("semantic mobile reading order is intro, review, attribution, controls and one logo grid", () => {
  const p = fixture();
  const section = p.tree;
  assert.equal(section.props["aria-labelledby"], "clients-heading");
  const heading = byType(section, "h2");
  assert.equal(heading.length, 1);
  assert.equal(heading[0].props.id, section.props["aria-labelledby"]);
  const ordered = walk(section, node => ["header", "blockquote", "figcaption", "button", "ul"].includes(node.type));
  assert.deepEqual(ordered.map(node => node.type), ["header", "blockquote", "figcaption", "button", "button", "ul"]);
  const figure = byType(section, "figure")[0];
  assert.equal(byType(figure, "button").length, 0, "Animated content never contains the focused navigation buttons");
  assert.equal(byType(section, "ul").length, 1, "Desktop/mobile layouts share one logo grid");
  p.unmount();
});

test("the focused stylesheet protects readable full quotes, visible focus and reduced-motion navigation", () => {
  const css = appSource("clients-section.module.css");
  const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.ok(reduced.length > 0, "Reduced-motion preference is explicitly respected");
  assert.match(reduced, /transform:\s*none/);
  assert.match(reduced, /animation:\s*none/);
  assert.match(reduced, /opacity:\s*1/);
  assert.doesNotMatch(css, /line-clamp|text-overflow:\s*ellipsis/);
  assert.match(css, /\.control:focus-visible[^{]*\{[^}]*outline:\s*2px/);
  assert.match(css, /\.control\s*\{[^}]*width:\s*3rem[^}]*height:\s*3rem/);
  assert.match(css, /grid-template-areas:\s*"intro"\s*"review"\s*"brands"/);
});

test("only the two owner-confirmed reviews are public, with stable cross-language IDs and real local assets", () => {
  const { getClientsContent } = loadModule("client-data.ts");
  const ua = getClientsContent("ua"), en = getClientsContent("en");
  assert.deepEqual(Array.from(ua.testimonials, item => item.id), ["oleksandr-kastronov", "vladyslav-isakov"]);
  assert.deepEqual(Array.from(en.testimonials, item => item.id), ["oleksandr-kastronov", "vladyslav-isakov"]);
  assert.deepEqual(Array.from(ua.clients, item => item.id), Array.from(en.clients, item => item.id));
  for (const locale of ["ua", "en"]) {
    const data = getClientsContent(locale);
    const publicData = JSON.stringify(data);
    assert.doesNotMatch(publicData, /ivan-tokmachov|Іван Токмачов|Ivan Tokmachov|demo-profile|Fixture|YevAI|AI Commercial Blueprint/);
    const validClientIds = new Set(Array.from(data.clients, item => item.id));
    for (const item of data.testimonials) {
      assert.equal(item.status, "published");
      assert.ok(item.quote.length > 300, "The full supplied quote remains in public data");
      assert.equal(item.isTranslation === true, locale === "en");
      for (const id of item.relatedClientIds) assert.ok(validClientIds.has(id));
      assert.ok(existsSync(new URL(`../public${item.avatarSrc}`, import.meta.url)), "Approved portrait is present");
      for (const link of item.caseLinks ?? []) {
        if (item.id === "vladyslav-isakov") assert.equal(link.href, "https://roland.dental/");
        else assert.ok(link.href.startsWith(`/${locale}/work/`));
      }
    }
    for (const client of data.clients) {
      if (client.caseHref) assert.ok(client.caseHref.startsWith(`/${locale}/work/`));
      if (client.logoSrc) {
        assert.ok(existsSync(new URL(`../public${client.logoSrc}`, import.meta.url)), "Local confirmed logo is present");
        assert.ok(client.logoWidth > 0 && client.logoHeight > 0);
      }
    }
    const html = serverRender({ locale, ...data });
    assert.equal((html.match(/<blockquote\b/g) ?? []).length, 1);
    assert.doesNotMatch(html, /01\s*\/\s*01|href="#"/);
    assert.equal((html.match(/<button\b/g) ?? []).length, 2);
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1]);
    assert.ok(links.length > 0);
    assert.ok(links.every(href => href.startsWith(`/${locale}/work/`)), "Every client and testimonial case link retains the current language");
    if (locale === "en") assert.match(html, /[Tt]ranslat/);
  }
});

test("Vladyslav's supplied three-paragraph review remains complete with its own portrait and Roland link", () => {
  const { getClientsContent } = loadModule("client-data.ts");
  const suppliedUa = [
    "Наша компанія представляє низку брендів, кожен із яких має свою аудиторію, асортимент і специфіку. Тому нам не підходить підхід, коли один сайт просто копіюють і змінюють логотип. Важливо, щоб кожен проєкт мав власний характер, враховував особливості обладнання та зрозуміло представляв конкретну пропозицію.",
    "З HOVER працюємо над серією сайтів, зокрема над сайтом нашого напряму обладнання Roland. Співпрацю вибудовуємо з розрахунком на довгострокове партнерство: для нас важливо, щоб студія розуміла специфіку компанії та враховувала її в наступних проєктах. При цьому кожен сайт розглядаємо окремо — зі своєю структурою, візуальною подачею та завданнями, а не як чергову версію попереднього.",
    "За такого обсягу роботи для нас особливо важливі узгоджені строки, зрозумілі етапи та своєчасна комунікація. Потрібно бачити, на якому етапі перебуває кожен проєкт, що потребує погодження та які кроки наступні. Саме на цих принципах будуємо роботу з HOVER: індивідуальна увага до кожного сайту та послідовний підхід до всієї серії.",
  ].join("\n\n");
  assert.equal(getClientsContent("ua").testimonials.find(item => item.id === "vladyslav-isakov").quote, suppliedUa);
  for (const locale of ["ua", "en"]) {
    const data = getClientsContent(locale);
    const approved = data.testimonials.find(item => item.id === "vladyslav-isakov");
    assert.equal(approved.name, locale === "ua" ? "Владислав Ісаков" : "Vladyslav Isakov");
    assert.equal(approved.role, locale === "ua" ? "Засновник" : "Founder");
    assert.equal(approved.company, "Yamamoto Dental Group");
    assert.equal(approved.avatarSrc, "/testimonials/vladyslav-isakov.jpg");
    assert.equal(approved.avatarCrop, undefined, "The square owner-supplied portrait requires no invented crop");
    assert.equal(approved.quote.split("\n\n").length, 3);
    assert.deepEqual(Array.from(approved.caseLinks, link => ({ ...link })), [{
      href: "https://roland.dental/", label: locale === "ua" ? "Сайт Roland" : "Roland website",
    }]);
    const p = fixture({ locale, testimonials: data.testimonials, logos: data.clients });
    p.click(1); p.settle();
    assertRecord(p.tree, approved, data.testimonials);
    const paragraphs = byType(byType(p.tree, "blockquote")[0], "p");
    assert.deepEqual(paragraphs.map(paragraph => text(paragraph)), Array.from(approved.quote.split("\n\n")));
    const avatar = byType(p.tree, "img").find(node => node.props.src === approved.avatarSrc);
    assert.equal(avatar.props.width, 56);
    assert.equal(avatar.props.height, 56);
    const caseLinks = byType(p.tree, "a").filter(node => node.props.className === "caseLink");
    assert.equal(caseLinks.length, 1);
    assert.equal(caseLinks[0].props.href, "https://roland.dental/");
    assert.equal(text(caseLinks[0]), locale === "ua" ? "Сайт Roland" : "Roland website");
    p.click(-1); p.settle();
    assertRecord(p.tree, data.testimonials[0], data.testimonials);
    assert.equal(byType(p.tree, "a").filter(node => node.props.className === "caseLink" && node.props.href === "https://roland.dental/").length, 0);
    p.unmount();
  }
});

test("the supplied Yamamoto mark remains static and relates only to Vladyslav’s review", () => {
  const { getClientsContent } = loadModule("client-data.ts");
  for (const locale of ["ua", "en"]) {
    const data = getClientsContent(locale);
    assert.deepEqual(Array.from(data.clients, item => item.id), ["solarfamily", "solarcity", "yamamoto-dental-group"]);
    const logo = data.clients.find(item => item.id === "yamamoto-dental-group");
    assert.equal(logo.caseHref, undefined);
    assert.ok(logo.logoCrop.x >= 0 && logo.logoCrop.x + logo.logoCrop.width <= logo.logoWidth);
    assert.ok(logo.logoCrop.y >= 0 && logo.logoCrop.y + logo.logoCrop.height <= logo.logoHeight);
    const p = fixture({ locale, logos: data.clients, testimonials: data.testimonials });
    for (const [direction, expectedActive] of [[1, true], [-1, false]]) {
      p.click(direction); p.settle();
      const yamamoto = byData(p.tree, "data-client-id").find(node => node.props["data-client-id"] === logo.id);
      assert.equal(yamamoto.props["data-active"], expectedActive, "Only Vladyslav relates to Yamamoto; Oleksandr relates to the Solar brands");
      assert.equal(byType(yamamoto, "a").length, 0, "A client without a published case is a static mark");
      const image = byType(yamamoto, "img")[0];
      assert.equal(image.props.src, logo.logoSrc);
      assert.equal(image.props.alt, logo.name);
      assert.equal(image.props.width, 1200);
      assert.equal(image.props.height, 800);
    }
    p.unmount();
  }
});

for (const locale of ["ua", "en"]) {
  test(`${locale}: the real homepage renders one clients section immediately before FAQ and imports no legacy testimonial implementation`, () => {
    const data = loadModule("client-data.ts");
    const clientsModule = loadModule("clients-section.tsx", componentImports(React, jsxRuntime));
    const noContent = () => null;
    const block = props => React.createElement("div", null, props.children);
    const { HoverSite } = loadModule("site-client.tsx", {
      react: React,
      "react/jsx-runtime": jsxRuntime,
      "next/image": { __esModule: true, default: noContent },
      "@/components/ui/accordion": { Accordion: block, AccordionItem: block, AccordionTrigger: block, AccordionContent: block },
      "./faq": { Faq: () => React.createElement("section", { id: "faq" }, "Existing FAQ") },
      "./hero-technology-field": { HeroTechnologyField: noContent },
      "./featured-solarcity": { FeaturedSolarcity: noContent },
      "./services": { getServices: () => [], getServiceHref: (_locale, slug) => `/${locale}/services/${slug}` },
      "./price-text": { PriceText: noContent },
      "./site-chrome": { SiteHeader: noContent },
      "./clients-section": clientsModule,
      "./client-data": data,
      "./ui-arrow": loadModule("ui-arrow.tsx", { "react/jsx-runtime": jsxRuntime }),
      ...Object.fromEntries(["motion", "strategy", "design", "development"].map(kind => [
        `./capability-${kind}-demo`, { [`Capability${kind[0].toUpperCase()}${kind.slice(1)}Demo`]: noContent },
      ])),
    });
    const html = renderToStaticMarkup(React.createElement(HoverSite, { locale }));
    assert.equal((html.match(/id="clients"/g) ?? []).length, 1);
    assert.equal((html.match(/id="faq"/g) ?? []).length, 1);
    const ids = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids[ids.indexOf("clients") + 1], "faq");
    assert.equal(ids[ids.indexOf("clients") - 1], "care", "Other sections retain their established order");
    assert.doesNotMatch(html, /id="testimonials"|demo-profile|Демонстраційний відгук|Demo testimonial/);
    assert.equal((html.match(/<blockquote\b/g) ?? []).length, 1);
    const clientsHtml = html.slice(html.indexOf('id="clients"'), html.indexOf('id="faq"'));
    assert.equal((clientsHtml.match(/<button\b/g) ?? []).length, 2, "The homepage renders two genuinely distinct approved reviews");
    assert.match(clientsHtml, /01\s*\/\s*02/);
    assert.match(clientsHtml, /data-testimonial-id="oleksandr-kastronov"/);
    assert.match(clientsHtml, /data-testimonial-position="1"/);
    assert.ok(clientsHtml.includes(locale === "ua" ? 'aria-label="Попередній відгук"' : 'aria-label="Previous testimonial"'));
    assert.ok(clientsHtml.includes(locale === "ua" ? 'aria-label="Наступний відгук"' : 'aria-label="Next testimonial"'));
  });
}

