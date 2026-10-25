import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { createElement } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const compiled = new Map();
const plain = (value) => JSON.parse(JSON.stringify(value));
const appSource = (file) => readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8");

function loadModule(file, imports = {}, globals = {}) {
  if (!compiled.has(file)) {
    compiled.set(file, ts.transpileModule(appSource(file), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText);
  }
  const exports = {};
  vm.runInNewContext(compiled.get(file), {
    exports,
    require(name) {
      assert.ok(name in imports, `Unexpected runtime import: ${name}`);
      return imports[name];
    },
    ...globals,
  }, { filename: file });
  return exports;
}

const config = loadModule("meta-pixel-config.ts");
const initialCommands = [["init", "1118365304509487"], ["track", "PageView"]];
const pageView = ["track", "PageView"];

// Execute the actual inline bootstrap with a synthetic DOM. No network API is
// available: script insertion is recorded and the SDK handoff is simulated.
function createPixelBrowser(pathname = "/ua", { existingSdk, blockedLoader = false } = {}) {
  const scripts = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, "script");
      if (blockedLoader) throw new Error("Advertising script blocked");
      return {};
    },
    getElementsByTagName(tag) {
      assert.equal(tag, "script");
      return [{ parentNode: { insertBefore(script) { scripts.push(script); } } }];
    },
  };
  const browser = { document, location: { pathname, search: "", hash: "" } };
  browser.window = browser;
  if (existingSdk) browser.fbq = existingSdk;
  vm.createContext(browser);
  const bootstrap = () => vm.runInContext(config.META_PIXEL_BOOTSTRAP, browser, { filename: "meta-pixel-inline.js" });
  bootstrap();
  return {
    browser,
    scripts,
    bootstrap,
    commands() { return browser.fbq?.queue ? [...browser.fbq.queue].map((args) => plain([...args])) : []; },
  };
}

// Run the actual navigation component. Only React's effect scheduling and
// Next's committed pathname are substituted, preserving real guard behavior.
function createNavigation(initialPath = "/ua") {
  const pixel = createPixelBrowser(initialPath);
  const events = pixel.commands();
  pixel.browser.fbq.callMethod = (...args) => events.push(plain(args));
  let pathname = initialPath;
  let dependencies;
  let effect;
  let cleanup;
  let pending;
  const { MetaPixelPageViews } = loadModule("meta-pixel.tsx", {
    "next/navigation": { usePathname: () => pathname },
    react: {
      useEffect(callback, nextDependencies) {
        effect = callback;
        if (!dependencies || nextDependencies.some((value, index) => !Object.is(value, dependencies[index]))) {
          dependencies = [...nextDependencies];
          pending = callback;
        }
      },
    },
  }, { window: pixel.browser });
  function render() {
    assert.equal(MetaPixelPageViews(), null);
    if (pending) {
      const callback = pending;
      pending = undefined;
      cleanup?.();
      cleanup = callback();
    }
  }
  return {
    ...pixel,
    events,
    render,
    navigate(nextPath, actualPath = nextPath) {
      pathname = nextPath;
      pixel.browser.location.pathname = actualPath;
      render();
    },
    replayEffect() { cleanup?.(); cleanup = effect(); },
    remount() { cleanup?.(); dependencies = undefined; render(); },
  };
}

test("one bootstrap creates one async SDK loader, initializes the supplied ID and queues exactly one initial PageView", () => {
  assert.equal(config.META_PIXEL_ID, "1118365304509487");
  for (const pathname of ["/ua", "/en", "/ua/services/chatbots", "/en/services/corporate-websites"]) {
    const pixel = createPixelBrowser(pathname);
    assert.equal(pixel.scripts.length, 1, pathname);
    assert.equal(pixel.scripts[0].src, "https://connect.facebook.net/en_US/fbevents.js");
    assert.equal(pixel.scripts[0].async, true);
    assert.equal(pixel.browser.fbq, pixel.browser._fbq);
    assert.equal(pixel.browser.fbq.disablePushState, true);
    assert.equal(pixel.browser.__hoverMetaPixel.lastPath, pathname);
    assert.deepEqual(pixel.commands(), initialCommands);
    pixel.bootstrap();
    assert.equal(pixel.scripts.length, 1, "Re-executing the script must not install another SDK");
    assert.deepEqual(pixel.commands(), initialCommands, "Re-execution must not initialize or count again");
  }
});

test("SDK history tracking is disabled before initialization and the initial view, including when the API already exists", () => {
  const calls = [];
  function sdk(...args) { calls.push({ args, disablePushState: sdk.disablePushState }); }
  const pixel = createPixelBrowser("/en", { existingSdk: sdk });
  assert.equal(pixel.scripts.length, 0);
  assert.deepEqual(calls, initialCommands.map((args) => ({ args, disablePushState: true })));
  pixel.bootstrap();
  assert.equal(calls.length, 2);
});

test("each committed UA/EN route and a later return visit counts once while hydration, rerenders and StrictMode replays do not", () => {
  const nav = createNavigation();
  nav.render();
  nav.replayEffect();
  nav.render();
  nav.remount();
  assert.deepEqual(nav.events, initialCommands);
  const routes = ["/ua/services/chatbots", "/en/services/chatbots", "/en", "/ua"];
  for (const [index, route] of routes.entries()) {
    nav.navigate(route);
    nav.render();
    nav.replayEffect();
    nav.remount();
    assert.equal(nav.events.length, initialCommands.length + index + 1, route);
    assert.deepEqual(nav.events.at(-1), pageView);
    assert.equal(nav.browser.__hoverMetaPixel.lastPath, route);
  }
});

test("query strings and in-page hashes never create additional PageViews", () => {
  const nav = createNavigation();
  nav.render();
  for (const [search, hash] of [["?service=chatbots", "#contact"], ["?gclid=example", "#services"], ["", "#hover-example"], ["", ""]]) {
    nav.browser.location.search = search;
    nav.browser.location.hash = hash;
    nav.render();
    nav.replayEffect();
    nav.remount();
  }
  assert.deepEqual(nav.events, initialCommands);
});

test("stale and unavailable committed pathnames are skipped until the router agrees with the browser URL", () => {
  const nav = createNavigation();
  nav.render();
  nav.navigate("/ua/services/chatbots", "/en");
  nav.replayEffect();
  nav.navigate(null, "/en");
  nav.navigate("", "/en");
  assert.deepEqual(nav.events, initialCommands);
  assert.equal(nav.browser.__hoverMetaPixel.lastPath, "/ua");
  nav.navigate("/en");
  assert.deepEqual(nav.events, [...initialCommands, pageView]);
});

test("the route tracker queues views while the real SDK is still loading", () => {
  const nav = createNavigation();
  delete nav.browser.fbq.callMethod;
  nav.render();
  nav.navigate("/ua/services/chatbots");
  nav.replayEffect();
  nav.navigate("/en/services/chatbots");
  assert.deepEqual(nav.commands(), [...initialCommands, pageView, pageView]);
  assert.equal(nav.scripts.length, 1);
});

test("a missing, non-function or throwing advertising API never interrupts navigation", () => {
  for (const unavailable of [undefined, null, {}]) {
    const nav = createNavigation();
    nav.render();
    nav.browser.fbq = unavailable;
    assert.doesNotThrow(() => nav.navigate("/en"));
    assert.doesNotThrow(() => nav.replayEffect());
    assert.deepEqual(nav.events, initialCommands);
  }
  const nav = createNavigation();
  nav.render();
  const attempts = [];
  nav.browser.fbq = (...args) => { attempts.push(args); throw new Error("SDK blocked"); };
  assert.doesNotThrow(() => nav.navigate("/en"));
  assert.doesNotThrow(() => nav.replayEffect());
  assert.doesNotThrow(() => nav.remount());
  assert.deepEqual(attempts, [pageView]);
  assert.equal(nav.browser.__hoverMetaPixel.lastPath, "/en", "An SDK exception must not permit duplicate retries");
});

test("a blocked bootstrap remains harmless and navigation never initializes an uninstalled Pixel", () => {
  const pixel = createPixelBrowser("/ua", { blockedLoader: true });
  assert.deepEqual(pixel.scripts, []);
  assert.equal(pixel.browser.__hoverMetaPixel, undefined);
  assert.doesNotThrow(pixel.bootstrap);
  const nav = createNavigation();
  nav.render();
  delete nav.browser.__hoverMetaPixel;
  assert.doesNotThrow(() => nav.navigate("/en"));
  assert.deepEqual(nav.events, initialCommands);
  assert.doesNotThrow(() => loadModule("meta-pixel.tsx", {
    react: { useEffect() {} }, "next/navigation": { usePathname: () => "/ua" },
  }));
});

test("initial and navigation events carry only PageView commands without lead or form data", () => {
  const nav = createNavigation();
  nav.render();
  nav.navigate("/ua/services/chatbots");
  nav.navigate("/en");
  assert.deepEqual(nav.events, [...initialCommands, pageView, pageView]);
  for (const event of nav.events.slice(1)) assert.deepEqual(event, pageView);
  assert.doesNotMatch(appSource("meta-pixel.tsx"), /contact-schema|contact-form|contact-request|FormData|\.search|\.hash/);
  assert.doesNotMatch(config.META_PIXEL_BOOTSTRAP, /['"]Lead['"]|trackCustom|user_data|external_id|em:|ph:/);
});

for (const locale of ["ua", "en"]) {
  test(`${locale}: actual root layout renders the Pixel once in head, fallback only in body and no tracking-image preload`, async () => {
    let navigationMounts = 0;
    const RootLayout = loadModule("layout.tsx", {
      "react/jsx-runtime": jsxRuntime,
      "./globals.css": {},
      "./scroll-restoration": { ScrollRestoration: () => null },
      "./site-page-end": { SitePageEnd: () => null },
      "./request-locale": { getRequestLocale: async () => locale, getRequestIndexing: async () => ({ index: true }) },
      "./site-config": { SITE_ORIGIN: "https://byhover.studio" },
      "./floating-telegram": { FloatingTelegram: () => null },
      "./meta-pixel-config": config,
      "./meta-pixel": { MetaPixelPageViews() { navigationMounts += 1; return null; } },
    }).default;
    const html = renderToStaticMarkup(await RootLayout({ children: createElement("main", null, "Page content") }));
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "";
    assert.match(html, new RegExp(`<html lang="${locale === "ua" ? "uk" : "en"}"`));
    assert.equal(navigationMounts, 1);
    assert.equal((html.match(/id="meta-pixel-tag"/g) ?? []).length, 1);
    assert.ok(head.includes(config.META_PIXEL_BOOTSTRAP));
    assert.doesNotMatch(body, /id="meta-pixel-tag"/);
    assert.equal((body.match(/<noscript>/g) ?? []).length, 1);
    const fallback = body.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? "";
    assert.equal(fallback, config.META_PIXEL_NOSCRIPT);
    assert.doesNotMatch(head, /<noscript|facebook\.com\/tr/);
    assert.doesNotMatch(html, /<link\b[^>]*(?:facebook\.com\/tr|fbevents\.js)/);
    assert.equal((html.match(/<img\b/g) ?? []).length, 1);
    assert.match(fallback, /height="1" width="1" style="display:none"/);
    assert.match(fallback, /alt=""/);
    const imageUrl = new URL(fallback.match(/src="([^"]+)"/)[1].replaceAll("&amp;", "&"));
    assert.equal(imageUrl.origin + imageUrl.pathname, "https://www.facebook.com/tr");
    assert.deepEqual([...imageUrl.searchParams], [["id", config.META_PIXEL_ID], ["ev", "PageView"], ["noscript", "1"]]);
    assert.equal((head.match(/id="google-ads-loader"/g) ?? []).length, 1);
    assert.equal((head.match(/id="google-ads-tag"/g) ?? []).length, 1);
  });
}
