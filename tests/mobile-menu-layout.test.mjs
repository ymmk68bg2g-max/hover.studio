import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const chrome = readFileSync(new URL("../app/site-chrome.tsx", import.meta.url), "utf8");

test("the approved full-viewport menu scrolls independently and retains safe-area padding", () => {
  const menu = css.match(/\.mobile-menu\s*\{([^}]+)\}/)?.[1];
  assert.ok(menu);
  assert.match(menu, /position:\s*fixed/);
  assert.match(menu, /top:\s*0/);
  assert.match(menu, /height:\s*100vh/);
  assert.match(menu, /height:\s*100dvh/);
  assert.match(menu, /min-height:\s*0/);
  assert.match(menu, /overflow-y:\s*auto/);
  assert.match(menu, /overscroll-behavior:\s*contain/);
  assert.match(menu, /padding:\s*7rem/);
  for (const edge of ["bottom", "left", "right"]) assert.match(menu, new RegExp(`env\\(safe-area-inset-${edge}\\)`));
  assert.match(css, /@media \(max-width:\s*1100px\) and \(max-height:\s*600px\)\s*\{\s*\.mobile-menu\s*\{[^}]*padding-top:\s*6rem/);
});

test("the curtain covers browser edge areas while the fixed close control stays above menu content", () => {
  const header = css.match(/\.site-header\s*\{([^}]+)\}/)?.[1];
  const menu = css.match(/\.mobile-menu\s*\{([^}]+)\}/)?.[1];
  const curtain = css.match(/\.mobile-menu-backdrop\s*\{([^}]+)\}/)?.[1];
  assert.match(header, /position:\s*fixed/);
  const z = rule => Number(rule.match(/z-index:\s*(\d+)/)?.[1]);
  assert.ok(z(header) > z(menu) && z(menu) > z(curtain));
  assert.match(curtain, /inset:\s*0/);
  assert.match(curtain, /height:\s*100lvh/);
  assert.match(curtain, /pointer-events:\s*none/);
  assert.match(menu, /pointer-events:\s*none/);
  assert.match(css, /\.mobile-menu\.is-open\s*\{[^}]*pointer-events:\s*auto/);
  assert.match(css, /@media \(min-width:\s*1101px\)\s*\{\s*\.mobile-menu,\s*\.mobile-menu-backdrop\s*\{[^}]*display:\s*none/);
});

test("mobile menu locks both document and body scrolling", () => {
  assert.match(chrome, /document\.documentElement\.style\.overflow\s*=\s*"hidden"/);
  assert.match(chrome, /document\.body\.style\.overflow\s*=\s*"hidden"/);
  assert.match(chrome, /document\.documentElement\.style\.overflow\s*=\s*previousDocumentOverflowRef\.current/);
  assert.match(chrome, /document\.body\.style\.overflow\s*=\s*previousBodyOverflowRef\.current/);
  assert.match(chrome, /isolated\.forEach\(\(\{ element, inert \}\) => \{ element\.inert = inert/);
  assert.match(chrome, /event\.key !== "Escape"/);
  assert.match(chrome, /toggle\?\.focus\(\{ preventScroll: true \}\)/);
});
