import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../app/contact-turnstile.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const tick = () => new Promise(setImmediate);
function find(tree, predicate) {
  if (Array.isArray(tree)) {
    for (const node of tree) { const match = find(node, predicate); if (match) return match; }
  } else if (tree && typeof tree === "object") {
    if (predicate(tree)) return tree;
    return find(tree.props?.children, predicate);
  }
  return undefined;
}
function textContent(tree) {
  if (Array.isArray(tree)) return tree.map(textContent).join("");
  if (tree && typeof tree === "object") return textContent(tree.props?.children);
  return typeof tree === "string" ? tree : "";
}

// A browser boundary with no fetch implementation: script loads and Cloudflare
// callbacks happen only when a test explicitly dispatches them.
function createEnvironment({ configured = true } = {}) {
  const scripts = [], timers = new Map(), observers = new Set();
  const rendered = [], removed = [], widgets = new Map();
  let readyCalls = 0;
  let timerId = 0, widgetSequence = 0, instanceSequence = 0, activeInstance;
  class Script {
    listeners = new Map();
    removed = false;
    addEventListener(name, callback) {
      if (!this.listeners.has(name)) this.listeners.set(name, new Set());
      this.listeners.get(name).add(callback);
    }
    removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
    remove() { this.removed = true; }
    dispatch(name) { for (const callback of Array.from(this.listeners.get(name) ?? [])) callback(); }
  }
  class Observer {
    constructor(callback) { this.callback = callback; }
    observe(container) { this.container = container; observers.add(this); }
    disconnect() { observers.delete(this); }
  }
  const api = {
    ready() {
      readyCalls += 1;
      throw Object.assign(new Error("Remove async/defer before using turnstile.ready()."), { code: 3857 });
    },
    render(container, options) {
      const id = `widget-${++widgetSequence}`;
      const widget = { id, container, options };
      rendered.push(widget);
      widgets.set(id, widget);
      return id;
    },
    remove(id) { removed.push(id); widgets.delete(id); },
  };
  const window = {
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener() {}, removeEventListener() {},
  };
  const document = {
    getElementById(id) { return scripts.find(script => !script.removed && script.id === id) ?? null; },
    createElement(tag) { assert.equal(tag, "script"); return new Script(); },
    head: { appendChild(script) { scripts.push(script); } },
  };
  const react = {
    useState(initial) {
      const owner = activeInstance, index = owner.hookIndex++;
      if (!(index in owner.hooks)) owner.hooks[index] = typeof initial === "function" ? initial() : initial;
      return [owner.hooks[index], next => {
        owner.hooks[index] = typeof next === "function" ? next(owner.hooks[index]) : next;
      }];
    },
    useRef(current) {
      const owner = activeInstance, index = owner.hookIndex++;
      return owner.hooks[index] ??= { current };
    },
    useId() {
      const owner = activeInstance, index = owner.hookIndex++;
      return owner.hooks[index] ??= `test-contact-${owner.id}`;
    },
    useEffect(effect, dependencies) {
      const owner = activeInstance, index = owner.hookIndex++;
      const previous = owner.hooks[index];
      if (!previous || dependencies.some((value, key) => !Object.is(value, previous.dependencies[key]))) {
        owner.pending.push(() => {
          previous?.cleanup?.();
          owner.hooks[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const exports = {};
  vm.runInNewContext(source, {
    exports, window, document, ResizeObserver: Observer,
    process: { env: { NEXT_PUBLIC_TURNSTILE_SITE_KEY: configured ? "public-test-site-key" : "" } },
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      throw new Error(`Unexpected import: ${name}`);
    },
  }, { filename: "contact-turnstile.tsx" });
  function mount({ locale = "ua", width = 600 } = {}) {
    const owner = {
      id: ++instanceSequence, hooks: [], hookIndex: 0, pending: [], tokens: [], width,
      props: { locale, resetKey: 0 },
      container: null,
    };
    owner.props.onToken = token => owner.tokens.push(token);
    function render() {
      activeInstance = owner;
      owner.hookIndex = 0; owner.pending = [];
      const tree = exports.ContactTurnstile(owner.props);
      activeInstance = undefined;
      const host = find(tree, node => node.props?.className === "contact-verification-widget");
      if (host) {
        owner.container ??= { getBoundingClientRect() { return { width: owner.width }; } };
        host.props.ref.current = owner.container;
      }
      for (const effect of owner.pending) effect();
      return tree;
    }
    const instance = {
      tokens: owner.tokens, render,
      widget() { return Array.from(widgets.values()).find(widget => widget.container === owner.container); },
      reset() { owner.props.resetKey += 1; return render(); },
      resize(width) {
        owner.width = width;
        for (const observer of Array.from(observers)) if (observer.container === owner.container) observer.callback();
      },
      retry() {
        const button = find(render(), node => node.props?.className === "contact-verification-retry");
        assert.ok(button, "A failed or expired verification must offer recovery");
        assert.equal(button.props.type, "button", "Recovery must not submit the form");
        button.props.onClick();
        render();
      },
      unmount() { for (const hook of owner.hooks) hook?.cleanup?.(); },
    };
    render();
    return instance;
  }
  return {
    scripts, rendered, removed, widgets, mount,
    get readyCalls() { return readyCalls; },
    get hasApi() { return Boolean(window.turnstile); },
    installApi({ malformed = false } = {}) { window.turnstile = malformed ? { ready: api.ready } : api; },
    async load({ malformed = false } = {}) {
      window.turnstile = malformed ? { ready: api.ready } : api;
      const script = scripts.find(script => !script.removed);
      assert.ok(script);
      script.dispatch("load");
      await tick();
    },
    async failLoading(mode) {
      if (mode === "error") scripts.find(script => !script.removed).dispatch("error");
      else for (const callback of Array.from(timers.values())) callback();
      await tick();
    },
  };
}

test("multiple mounted forms share one explicit loader and clean up only their own widgets", async () => {
  const environment = createEnvironment();
  const first = environment.mount(), second = environment.mount({ locale: "en" });
  assert.equal(environment.scripts.length, 1);
  assert.equal(environment.scripts[0].src, "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit");
  assert.equal(environment.scripts[0].async, true);
  await environment.load();
  assert.equal(environment.widgets.size, 2);
  const firstId = first.widget().id, secondId = second.widget().id;
  first.unmount();
  assert.deepEqual(environment.removed, [firstId]);
  assert.ok(environment.widgets.has(secondId));
  environment.mount();
  await tick();
  assert.equal(environment.scripts.length, 1, "Navigating between forms must not append another loader");
  assert.equal(environment.widgets.size, 2);
});

for (const locale of ["ua", "en"]) test(`${locale}: widget uses the expected action, language, accessible grouping and one token callback`, async () => {
  const environment = createEnvironment(), form = environment.mount({ locale });
  await environment.load();
  const options = form.widget().options;
  assert.equal(options.action, "contact");
  assert.equal(options.language, locale === "ua" ? "uk" : "en");
  assert.equal(options.theme, "light");
  assert.equal(options.size, "flexible");
  assert.equal(options.tabindex, 0);
  assert.equal(options["response-field"], false, "Only the explicit callback supplies the API token");
  const tree = form.render();
  assert.equal(tree.props.role, "group");
  assert.ok(tree.props["aria-labelledby"]);
  assert.ok(tree.props["aria-describedby"]);
  options.callback("verified-token");
  assert.equal(form.tokens.at(-1), "verified-token");
  assert.match(textContent(form.render()), locale === "ua" ? /Перевірку пройдено/ : /Verification complete/);
});

test("width below 300px uses compact mode and only crossing the threshold replaces the widget", async () => {
  const environment = createEnvironment(), form = environment.mount({ width: 284 });
  await environment.load();
  const compact = form.widget();
  assert.equal(compact.options.size, "compact");
  form.resize(290);
  assert.equal(environment.rendered.length, 1);
  form.resize(500);
  assert.equal(form.widget().options.size, "flexible");
  assert.deepEqual(environment.removed, [compact.id]);
  const tokenCount = form.tokens.length;
  compact.options.callback("stale-size-token");
  assert.equal(form.tokens.length, tokenCount, "A callback from the replaced compact widget must be ignored");
  form.resize(280);
  assert.equal(form.widget().options.size, "compact");
  assert.equal(environment.scripts.length, 1);
});

for (const callback of ["error-callback", "expired-callback", "timeout-callback", "unsupported-callback"]) {
  test(`${callback} clears the token and offers a localized retry without a second script`, async () => {
    const environment = createEnvironment(), form = environment.mount();
    await environment.load();
    const previous = form.widget();
    previous.options.callback("first-token");
    previous.options[callback]();
    assert.equal(form.tokens.at(-1), null);
    assert.match(textContent(form.render()), /Повторити перевірку/);
    form.retry();
    await tick();
    assert.notEqual(form.widget().id, previous.id);
    assert.ok(environment.removed.includes(previous.id));
    assert.equal(environment.scripts.length, 1);
    form.widget().options.callback("recovered-token");
    assert.equal(form.tokens.at(-1), "recovered-token");
  });
}

for (const mode of ["error", "timeout"]) test(`loader ${mode} can be retried instead of leaving the form permanently unavailable`, async () => {
  const environment = createEnvironment(), form = environment.mount({ locale: "en" });
  await environment.failLoading(mode);
  assert.equal(environment.scripts[0].removed, true);
  assert.match(textContent(form.render()), /Retry verification/);
  form.retry();
  assert.equal(environment.scripts.length, 2);
  assert.equal(environment.scripts.filter(script => !script.removed).length, 1);
  await environment.load();
  form.widget().options.callback("recovered-token");
  assert.equal(form.tokens.at(-1), "recovered-token");
});

for (const existing of [false, true]) test(`an ${existing ? "existing" : "async-loaded"} API renders without calling Cloudflare's forbidden ready method`, async () => {
  const environment = createEnvironment();
  if (existing) environment.installApi();
  const form = environment.mount({ locale: "en" });
  if (existing) {
    await tick();
    assert.equal(environment.scripts.length, 0, "An existing API must not cause a duplicate script");
  } else {
    assert.equal(environment.scripts[0].async, true);
    assert.equal(environment.scripts[0].defer, true);
    await environment.load();
    assert.equal(environment.scripts[0].removed, false);
  }
  assert.equal(environment.readyCalls, 0, "The actual Cloudflare ready() contract throws 3857 for async/defer scripts");
  assert.equal(environment.rendered.length, 1);
  form.widget().options.callback("verified-token");
  assert.equal(form.tokens.at(-1), "verified-token");
  assert.match(textContent(form.render()), /Verification complete/);
  await environment.failLoading("timeout");
  assert.equal(environment.rendered.length, 1, "Successful load must clear its failure deadline");
  assert.match(textContent(form.render()), /Verification complete/);
});

for (const existing of [false, true]) test(`a malformed ${existing ? "existing" : "loaded"} API without render fails closed and permits a fresh script retry`, async () => {
  const environment = createEnvironment();
  if (existing) environment.installApi({ malformed: true });
  const form = environment.mount({ locale: "en" });
  if (existing) await tick();
  else await environment.load({ malformed: true });
  assert.equal(environment.rendered.length, 0);
  assert.equal(environment.hasApi, false, "Retry must not reuse the malformed API");
  assert.match(textContent(form.render()), /Retry verification/);
  assert.ok(!form.tokens.some(Boolean), "A malformed API must never verify the form");
  assert.equal(environment.scripts.filter(script => !script.removed).length, 0);
  form.retry();
  assert.equal(environment.scripts.filter(script => !script.removed).length, 1);
  await environment.load();
  form.widget().options.callback("fresh-token");
  assert.equal(form.tokens.at(-1), "fresh-token");
  assert.equal(environment.rendered.length, 1);
  assert.equal(environment.readyCalls, 0);
});

test("resetKey clears a consumed token, replaces the widget, and rejects old callbacks", async () => {
  const environment = createEnvironment(), form = environment.mount();
  await environment.load();
  const previous = form.widget();
  previous.options.callback("consumed-token");
  form.reset();
  assert.equal(form.tokens.at(-1), null);
  assert.match(textContent(form.render()), /Готуємо перевірку/);
  await tick();
  assert.notEqual(form.widget().id, previous.id);
  const tokenCount = form.tokens.length;
  previous.options.callback("late-consumed-token");
  assert.equal(form.tokens.length, tokenCount);
  form.widget().options.callback("fresh-token");
  assert.equal(form.tokens.at(-1), "fresh-token");
});

test("unmount removes the widget and late callbacks cannot restore its token", async () => {
  const environment = createEnvironment(), form = environment.mount();
  await environment.load();
  const widget = form.widget();
  widget.options.callback("valid-token");
  form.unmount();
  assert.equal(form.tokens.at(-1), null);
  assert.ok(environment.removed.includes(widget.id));
  const tokenCount = form.tokens.length;
  widget.options.callback("late-token");
  widget.options["expired-callback"]();
  assert.equal(form.tokens.length, tokenCount);
});

test("a script completing after unmount cannot create a widget for a removed form", async () => {
  const environment = createEnvironment(), form = environment.mount();
  form.unmount();
  await environment.load();
  assert.equal(environment.rendered.length, 0);
  environment.mount();
  await tick();
  assert.equal(environment.rendered.length, 1);
  assert.equal(environment.scripts.length, 1);
});

test("missing public configuration shows temporary unavailability and never loads a widget", () => {
  const environment = createEnvironment({ configured: false });
  const form = environment.mount({ locale: "en" });
  assert.match(textContent(form.render()), /Sending is temporarily unavailable/);
  assert.equal(environment.scripts.length, 0);
  assert.equal(environment.rendered.length, 0);
});
