import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../app/site-chrome.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } },
).outputText;

function controls({ locale = "ua", href = "/en/work/yevai", prepared = "/en/work/yevai?view=details#contact", blockedStorage = false } = {}) {
  const calls = [];
  const states = [];
  let stateIndex = 0;
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const context = vm.createContext({
    exports,
    localStorage: {
      setItem(key, value) {
        calls.push(["storage", key, value]);
        if (blockedStorage) throw new Error("Storage blocked");
      },
    },
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (name === "react") return {
        useCallback: callback => callback,
        useEffect: () => {},
        useLayoutEffect: () => {},
        useMemo: callback => callback(),
        useRef: current => ({ current }),
        useState: initial => {
          const index = stateIndex++;
          states[index] = initial;
          return [initial, value => { states[index] = value; calls.push(["state", index, value]); }];
        },
      };
      if (name === "react-dom") return { flushSync: callback => { calls.push(["flush"]); callback(); } };
      if (name === "next/link") return { default: "mock-link" };
      if (name === "next/navigation") return { useRouter: () => ({
        push: (target, options) => calls.push(["push", target, options.scroll]),
      }) };
      if (name === "./client-experience-config") return { privacyPublicationStatus: "published" };
      if (name === "./wordmark") return { Wordmark: "wordmark" };
      if (name === "./scroll-restoration") return {
        navigateToAnchor: () => { throw new Error("Language controls must not use anchor navigation"); },
        prepareLanguageNavigation: target => {
          calls.push(["prepare", target, states[0], states[1]]);
          return prepared;
        },
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  vm.runInContext(source, context);
  const props = { locale, pageKind: "project", languageHref: href };
  const header = exports.SiteHeader(props);
  const footer = exports.SiteFooter(props);
  function walk(node, predicate, results = []) {
    if (Array.isArray(node)) node.forEach(child => walk(child, predicate, results));
    else if (node && typeof node === "object") {
      if (predicate(node)) results.push(node);
      walk(node.props?.children, predicate, results);
    }
    return results;
  }
  const languageComponents = walk([header, footer], node => node.type?.name === "LanguageLink");
  const links = languageComponents.map(component => component.type(component.props));
  const toggle = walk(header, node => node.props?.className === "menu-toggle")[0];
  return { calls, states, links, header, footer, walk, openMenu: () => toggle.props.onClick(), clearCalls: () => { calls.length = 0; } };
}

function click(overrides = {}) {
  return {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault() { this.defaultPrevented = true; },
    ...overrides,
  };
}

for (const locale of ["ua", "en"]) {
  test(`${locale}: the menu location is localized and the footer exposes only the verified social link`, () => {
    const p = controls({ locale });
    const foot = p.walk(p.header, node => node.props?.className === "mobile-menu-foot")[0];
    const label = p.walk(foot, node => node.type === "span")[0];
    assert.equal(label.props.children, locale === "ua" ? "КИЇВ / УКРАЇНА" : "KYIV / UKRAINE");
    const social = p.walk(p.footer, node => node.type === "nav" && node.props?.["aria-label"] === (locale === "ua" ? "Соціальні посилання" : "Social links"))[0];
    const links = p.walk(social, node => node.type === "a");
    assert.equal(links.length, 1);
    assert.equal(links[0].props.href, "https://www.upwork.com/freelancers/~0156b684b62004c2df");
    assert.equal(links[0].props.children, "UPWORK");
  });

  test(`${locale}: header, mobile menu, and footer share language navigation without router scrolling`, () => {
    const other = locale === "ua" ? "en" : "ua";
    const p = controls({ locale, href: `/${other}/work/yevai` });
    assert.equal(p.links.length, 3);
    assert.deepEqual(p.links.map(link => link.props.className), ["language", "mobile-language", "footer-link"]);
    for (const link of p.links) {
      assert.equal(link.props.href, `/${other}/work/yevai`);
      assert.equal(link.props.scroll, false);
      assert.equal(link.props["data-language-switch"], true);
    }
  });
}

for (const [index, label] of [[0, "header"], [1, "mobile menu"]]) {
  test(`${label} releases the open menu before capturing language position`, () => {
    const p = controls();
    p.openMenu();
    assert.equal(p.states[0], true);
    p.clearCalls();
    const event = click();
    p.links[index].props.onClick(event);

    assert.deepEqual(p.calls, [
      ["flush"],
      ["state", 0, false],
      ["state", 1, "closing"],
      ["prepare", "/en/work/yevai", false, "closing"],
      ["storage", "hover_locale", "en"],
      ["push", "/en/work/yevai?view=details#contact", false],
    ]);
    assert.equal(event.defaultPrevented, true);
  });
}

test("footer forwards the prepared query and hash without rebuilding the destination", () => {
  const p = controls({ prepared: "/en/work/yevai?campaign=one%20two#services" });
  const event = click();
  p.links[2].props.onClick(event);

  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(p.calls, [
    ["prepare", "/en/work/yevai", false, "closed"],
    ["storage", "hover_locale", "en"],
    ["push", "/en/work/yevai?campaign=one%20two#services", false],
  ]);
});

test("all language controls leave modified and already-handled clicks untouched", () => {
  const p = controls();
  p.openMenu();
  p.clearCalls();
  for (const link of p.links) {
    for (const override of [
      { button: 1 }, { metaKey: true }, { ctrlKey: true },
      { shiftKey: true }, { altKey: true }, { defaultPrevented: true },
    ]) {
      const event = click(override);
      link.props.onClick(event);
      assert.equal(event.defaultPrevented, Boolean(override.defaultPrevented));
    }
  }
  assert.deepEqual(p.calls, []);
  assert.equal(p.states[0], true, "Modified clicks must not close the existing page's menu");
});

test("a blocked preference store cannot prevent language navigation", () => {
  const p = controls({ blockedStorage: true });
  const event = click();
  assert.doesNotThrow(() => p.links[2].props.onClick(event));
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(p.calls.at(-1), ["push", "/en/work/yevai?view=details#contact", false]);
});

test("an unsupported language target keeps the link's native fallback", () => {
  const p = controls({ prepared: null });
  const event = click();
  p.links[2].props.onClick(event);
  assert.equal(event.defaultPrevented, false);
  assert.deepEqual(p.calls, [["prepare", "/en/work/yevai", false, "closed"]]);
});
