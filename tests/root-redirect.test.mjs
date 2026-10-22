import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

async function destination({ cookie, headers = {}, params = {} } = {}) {
  const exports = {};
  const redirectSignal = new Error("Next redirect");
  let redirectedTo;
  vm.runInNewContext(source, {
    exports,
    URLSearchParams,
    require(name) {
      if (name === "next/headers") return {
        cookies: async () => ({ get: key => key === "hover_locale" && cookie !== undefined ? { value: cookie } : undefined }),
        headers: async () => new Headers(headers),
      };
      if (name === "next/navigation") return {
        redirect(target) {
          redirectedTo = target;
          throw redirectSignal;
        },
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  }, { filename: "app/page.tsx" });
  await assert.rejects(exports.default({ searchParams: Promise.resolve(params) }), error => error === redirectSignal);
  assert.equal(typeof redirectedTo, "string");
  return new URL(redirectedTo, "https://byhover.studio");
}

test("root redirect keeps ad attribution, repeated parameters and empty values", async () => {
  const target = await destination({
    cookie: "ua",
    params: {
      gclid: "TEST-CLICK.1+2",
      utm_source: "google",
      utm_campaign: "Дизайн & запуск",
      utm_term: ["first phrase", "second+phrase"],
      empty: "",
      missing: undefined,
    },
  });
  assert.equal(target.pathname, "/ua");
  assert.equal(target.searchParams.get("gclid"), "TEST-CLICK.1+2");
  assert.equal(target.searchParams.get("utm_source"), "google");
  assert.equal(target.searchParams.get("utm_campaign"), "Дизайн & запуск");
  assert.deepEqual(target.searchParams.getAll("utm_term"), ["first phrase", "second+phrase"]);
  assert.equal(target.searchParams.has("empty"), true);
  assert.equal(target.searchParams.get("empty"), "");
  assert.equal(target.searchParams.has("missing"), false);
});

test("query values cannot change the locale path, host or fragment", async () => {
  const target = await destination({
    cookie: "en",
    headers: { "x-vercel-ip-country": "UA", "accept-language": "uk-UA" },
    params: {
      gclid: "click&extra=value#fragment",
      next: "https://elsewhere.example/ua?x=1",
      "key&=+#": ["", "100% / + # ? & ="],
    },
  });
  assert.equal(target.origin, "https://byhover.studio");
  assert.equal(target.pathname, "/en");
  assert.equal(target.hash, "");
  assert.equal(target.searchParams.get("gclid"), "click&extra=value#fragment");
  assert.equal(target.searchParams.has("extra"), false);
  assert.equal(target.searchParams.get("next"), "https://elsewhere.example/ua?x=1");
  assert.deepEqual(target.searchParams.getAll("key&=+#"), ["", "100% / + # ? & ="]);
});

const localeCases = [
  { name: "saved UA overrides English request", cookie: "ua", headers: { "accept-language": "en-US" }, expected: "/ua" },
  { name: "saved EN overrides UA location", cookie: "en", headers: { "cf-ipcountry": "UA", "accept-language": "uk-UA" }, expected: "/en" },
  { name: "Cloudflare UA location", headers: { "cf-ipcountry": "UA" }, expected: "/ua" },
  { name: "Vercel UA location fallback", headers: { "x-vercel-ip-country": "UA" }, expected: "/ua" },
  { name: "Cloudflare location precedes Vercel", headers: { "cf-ipcountry": "US", "x-vercel-ip-country": "UA" }, expected: "/en" },
  { name: "Ukrainian language fallback", cookie: "invalid", headers: { "accept-language": "en-US, uk-UA;q=0.9" }, expected: "/ua" },
  { name: "fresh English default", headers: { "accept-language": "en-US" }, expected: "/en" },
];

for (const { name, expected, ...request } of localeCases) {
  test(`${name}: locale choice stays unchanged and empty query adds no question mark`, async () => {
    const target = await destination(request);
    assert.equal(target.pathname, expected);
    assert.equal(target.search, "");
    assert.equal(target.href, `https://byhover.studio${expected}`);
  });
}

test("undefined values and empty arrays do not create a query string", async () => {
  const target = await destination({ params: { missing: undefined, empty: [] } });
  assert.equal(target.href, "https://byhover.studio/en");
});
