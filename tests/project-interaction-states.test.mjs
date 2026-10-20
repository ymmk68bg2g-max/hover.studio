import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

function blockFor(selector) {
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const rule = rules.find(([, selectors]) => selectors.split(",").some(value => value.trim() === selector));
  assert.ok(rule, `Missing CSS block for ${selector}`);
  return rule[2];
}

function mediaRanges(header) {
  const ranges = [];
  let cursor = 0;

  while ((cursor = css.indexOf(header, cursor)) !== -1) {
    const open = css.indexOf("{", cursor);
    let depth = 1;
    let end = open + 1;

    while (depth > 0 && end < css.length) {
      if (css[end] === "{") depth += 1;
      if (css[end] === "}") depth -= 1;
      end += 1;
    }

    ranges.push([open, end]);
    cursor = end;
  }

  return ranges;
}

test("uses a custom immediate tap response for project links", () => {
  assert.match(css, /a,\s*\nbutton \{[\s\S]*?-webkit-tap-highlight-color:\s*transparent;/);
  assert.match(css, /a,\s*\nbutton \{[\s\S]*?touch-action:\s*manipulation;/);
  assert.match(css, /\.project-main > a:active h2,[\s\S]*?color:\s*var\(--active\);/);
  assert.match(css, /\.project-actions a:active,[\s\S]*?border-color:\s*var\(--active\);[\s\S]*?color:\s*var\(--active\);/);
  assert.doesNotMatch(css, /\.project:active/);

  assert.doesNotMatch(blockFor(".project-copy h2"), /transition:[^;]*color/);
  assert.doesNotMatch(blockFor(".project-actions a"), /transition:[^;]*(?:color|border-color)/);
  assert.doesNotMatch(blockFor(".next-project strong"), /transition:[^;]*color/);
});

test("keeps project hover effects on real hover pointers only", () => {
  const ranges = mediaRanges("@media (hover: hover) and (pointer: fine)");
  const selectors = [
    ".project-media.has-real-preview:hover img",
    ".project:hover .project-copy h2",
    ".project:hover .project-meta > p",
    ".project-actions a:hover",
    ".next-project a:hover strong",
  ];

  for (const selector of selectors) {
    const index = css.indexOf(selector);
    assert.notEqual(index, -1, `Missing hover rule for ${selector}`);
    assert.ok(
      ranges.some(([start, end]) => index > start && index < end),
      `${selector} must stay inside the fine-pointer media query`,
    );
  }

  assert.match(css, /\.project-main > a:focus-visible h2/);
  assert.match(css, /\.project-actions a:focus-visible/);
  assert.match(css, /\.next-project a:focus-visible strong/);
});
