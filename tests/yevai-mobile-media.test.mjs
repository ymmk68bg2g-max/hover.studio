import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import postcss from "postcss";

const source = readFileSync(new URL("../app/case-study.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const mobileStyles = new Map();
postcss.parse(css).walkAtRules("media", media => {
  if (!/\(\s*max-width\s*:\s*760px\s*\)/i.test(media.params)) return;
  media.walkRules(rule => {
    for (const selector of rule.selectors) {
      const declarations = mobileStyles.get(selector) ?? new Map();
      rule.walkDecls(declaration => declarations.set(declaration.prop, declaration.value));
      mobileStyles.set(selector, declarations);
    }
  });
});

test("YevAI hero uses the widescreen desktop capture on every viewport", () => {
  assert.doesNotMatch(source, /mobile-cover-clean\.webp/);
  assert.match(source, /className="case-cover-picture"[\s\S]*?src=\{project\.preview\}/);
});

test("YevAI hero and context media stay widescreen and uncropped on mobile", () => {
  assert.match(mobileStyles.get(".case-cover-yevai")?.get("aspect-ratio") ?? "", /^16\s*\/\s*9$/);
  assert.equal(mobileStyles.get(".case-cover-yevai img")?.get("object-fit"), "contain");
  assert.match(mobileStyles.get(".yevai-screen.case-context-visual")?.get("aspect-ratio") ?? "", /^16\s*\/\s*9$/);
  assert.equal(mobileStyles.get(".yevai-screen.case-context-visual img")?.get("object-fit"), "contain");
});
