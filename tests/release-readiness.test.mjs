import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const productionOrigin = "https://byhover.studio";
const previewOrigin = "https://hover-studio.pipistrello-26.chatgpt.site";
const locales = ["ua", "en"];
const serviceSlugs = ["landing-pages", "business-websites", "corporate-websites", "digital-experience", "website-care"];
const projectImages = {
  solarcity: "/previews/solarcity-corporate.png",
  solarfamily: "/previews/solarfamily-published.webp",
  yevai: "/previews/yevai-real.jpg",
  "ai-commercial-blueprint": "/previews/ai-commercial-blueprint-cover.png",
};
const routes = locales.flatMap(locale => [
  { path: `/${locale}`, locale, suffix: "", kind: "home" },
  ...serviceSlugs.map(slug => ({ path: `/${locale}/services/${slug}`, locale, suffix: `/services/${slug}`, kind: "service" })),
  ...Object.keys(projectImages).map(slug => ({ path: `/${locale}/work/${slug}`, locale, suffix: `/work/${slug}`, kind: "case", image: projectImages[slug] })),
  { path: `/${locale}/privacy`, locale, suffix: "/privacy", kind: "privacy" },
]);
const environment = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const executionContext = { waitUntil() {}, passThroughOnException() {} };
const workerPromise = import(new URL(`../dist/server/index.js?release=${process.pid}-${Date.now()}`, import.meta.url).href)
  .then(module => module.default);

async function request(path, { origin = productionOrigin, headers = {} } = {}) {
  const worker = await workerPromise;
  const response = await worker.fetch(new Request(new URL(path, origin), {
    headers: { accept: "text/html", host: new URL(origin).host, ...headers },
  }), environment, executionContext);
  const body = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  return { response, body };
}

function attributes(tag) {
  return Object.fromEntries(Array.from(tag.matchAll(/([\w:-]+)="([^"]*)"/g), match => [match[1].toLowerCase(), match[2]]));
}

function tags(body, name) {
  return Array.from(body.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi")), match => attributes(match[0]));
}

function meta(body, name) {
  return tags(body, "meta").find(tag => tag.name === name || tag.property === name)?.content;
}

test("all 22 production routes render explicit document language, approved canonicals and reciprocal language pairs", async () => {
  assert.equal(routes.length, 22);
  for (const route of routes) {
    const other = route.locale === "ua" ? "en" : "ua";
    const { response, body } = await request(route.path, { headers: {
      cookie: `hover_locale=${other}`,
      "accept-language": other === "ua" ? "uk-UA" : "en",
      "cf-ipcountry": other === "ua" ? "UA" : "US",
    } });
    assert.equal(response.status, 200, route.path);
    assert.match(body, new RegExp(`<html\\b[^>]*lang="${route.locale === "ua" ? "uk" : "en"}"`), `${route.path}: explicit route overrides preference and country`);
    assert.equal((body.match(/<h1\b/g) ?? []).length, 1, `${route.path}: one meaningful page heading`);
    assert.match(body, /<title>[^<]+<\/title>/, route.path);
    const links = tags(body, "link");
    assert.equal(links.find(tag => tag.rel === "canonical")?.href, productionOrigin + route.path, `${route.path}: approved canonical`);
    for (const [language, prefix] of [["en", "/en"], ["uk-UA", "/ua"]]) {
      assert.equal(links.find(tag => tag.rel === "alternate" && tag.hreflang === language)?.href, productionOrigin + prefix + route.suffix, `${route.path}: reciprocal ${language}`);
    }
    assert.equal(meta(body, "robots"), route.kind === "privacy" ? "noindex, nofollow" : "index, follow", `${route.path}: intentional index policy`);
    assert.equal(response.headers.get("x-robots-tag"), null, `${route.path}: production is not accidentally blocked by preview policy`);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff", route.path);
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin", route.path);
  }
});

test("indexable pages expose localized social metadata with existing approved images", async () => {
  for (const route of routes.filter(route => route.kind !== "privacy")) {
    const { body } = await request(route.path);
    const title = body.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.equal(meta(body, "og:url"), productionOrigin + route.path, route.path);
    assert.equal(meta(body, "og:title"), title, `${route.path}: social title follows the page`);
    assert.equal(meta(body, "og:locale"), route.locale === "ua" ? "uk_UA" : "en_US", route.path);
    assert.ok(meta(body, "og:description")?.length > 20, `${route.path}: meaningful description`);
    const expectedImage = route.image ?? "/images/yevheniy-polosenko.webp";
    assert.equal(meta(body, "og:image"), productionOrigin + expectedImage, route.path);
    assert.equal(meta(body, "twitter:image"), productionOrigin + expectedImage, route.path);
    await access(new URL(`../public${expectedImage}`, import.meta.url));
  }
});

test("preview requests remain noindex while retaining production canonical and social URLs", async () => {
  for (const path of ["/ua", "/en", "/ua/services/landing-pages", "/en/work/solarcity", "/ua/privacy"]) {
    const { response, body } = await request(path, { origin: previewOrigin });
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", path);
    assert.equal(meta(body, "robots"), "noindex, nofollow", path);
    assert.equal(tags(body, "link").find(tag => tag.rel === "canonical")?.href, productionOrigin + path, path);
    if (!path.endsWith("/privacy")) assert.equal(meta(body, "og:url"), productionOrigin + path, path);
  }
});

test("robots varies by actual host and sitemap lists the 20 approved indexable locale routes", async () => {
  const production = await request("/robots.txt");
  const preview = await request("/robots.txt", { origin: previewOrigin });
  assert.equal(production.response.status, 200);
  assert.match(production.body, /User-Agent: \*/i);
  assert.match(production.body, /Allow: \/(?:\r?\n|$)/);
  assert.doesNotMatch(production.body, /Disallow: \//);
  assert.match(preview.body, /Disallow: \/(?:\r?\n|$)/);
  for (const result of [production, preview]) assert.ok(result.body.includes(`Sitemap: ${productionOrigin}/sitemap.xml`));
  for (const origin of [productionOrigin, previewOrigin]) {
    const { response, body } = await request("/sitemap.xml", { origin });
    assert.equal(response.status, 200);
    const urls = Array.from(body.matchAll(/<loc>([^<]+)<\/loc>/g), match => match[1]);
    const expected = routes.filter(route => route.kind !== "privacy").map(route => productionOrigin + route.path);
    assert.equal(urls.length, 20);
    assert.deepEqual([...urls].sort(), expected.sort());
    assert.doesNotMatch(body, /pipistrello|\/privacy/);
  }
});

test("unknown pages and missing assets stay 404 with noindex, while www redirects preserve path and query", async () => {
  for (const path of ["/ua/not-a-real-page", "/en/not-a-real-page", "/fr", "/ua/work/unknown", "/en/services/unknown", "/no/such/path", "/assets/prelaunch-does-not-exist.png"]) {
    const { response, body } = await request(path);
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", path);
    // Vinext emits its own noindex marker for a 404 before inherited metadata.
    // The worker's explicit noindex/nofollow header is the authoritative guard.
    assert.ok(tags(body, "meta").some(tag => tag.name === "robots" && /(?:^|,\s*)noindex(?:,|$)/.test(tag.content ?? "")), path);
    assert.ok(body.includes(path.startsWith("/ua/") ? "Цю сторінку не знайдено." : "This page couldn’t be found."), `${path}: localized recovery content`);
    assert.doesNotMatch(body, /class="hero-title"|data-scroll-region="work"/, `${path}: no successful homepage fallback`);
  }
  const { response } = await request("/ua/work/solarcity?ref=prelaunch%20check", { origin: "https://www.byhover.studio" });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), `${productionOrigin}/ua/work/solarcity?ref=prelaunch%20check`);
});

test("root locale selection preserves saved choice and explicit routes do not redirect with conflicting preferences", async () => {
  for (const [headers, expected] of [
    [{}, "en"],
    [{ "accept-language": "uk-UA,uk;q=0.9" }, "ua"],
    [{ "accept-language": "en", "cf-ipcountry": "UA" }, "ua"],
    [{ cookie: "hover_locale=en", "accept-language": "uk", "cf-ipcountry": "UA" }, "en"],
    [{ cookie: "hover_locale=ua", "accept-language": "en", "cf-ipcountry": "US" }, "ua"],
  ]) {
    const { response } = await request("/", { headers });
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), `${productionOrigin}/${expected}`);
  }
});
