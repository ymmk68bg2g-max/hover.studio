import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import postcss from "postcss";

const locales = ["en", "ua"];
const serviceSlugs = [
  "landing-pages",
  "business-websites",
  "corporate-websites",
  "digital-experience",
  "website-care",
];
const projectSlugs = ["solarcity", "solarfamily", "yevai", "ai-commercial-blueprint"];
const environment = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};
const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

const workerPromise = (() => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return import(workerUrl.href).then(({ default: worker }) => worker);
})();

function stripScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function occurrences(source, value) {
  return source.split(value).length - 1;
}

function selectedService(html) {
  const select = html.match(/<select\b[^>]*name="serviceId"[^>]*>[\s\S]*?<\/select>/)?.[0] ?? "";
  const option = select.match(/<option\b[^>]*selected=""[^>]*>/)?.[0] ?? "";
  return option.match(/\bvalue="([^"]*)"/)?.[1];
}

async function render(pathname) {
  const worker = await workerPromise;
  const response = await worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    environment,
    executionContext,
  );
  return {
    response,
    html: stripScripts(await response.text()),
  };
}

test("renders localized homepage metadata", async () => {
  const { response, html } = await render("/en");

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /<title>HOVER\.STUDIO — Design that responds<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/byhover\.studio\/en"\/>/);
});

test("redirects the root route to the default locale", async () => {
  const { response } = await render("/");

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "http://localhost/en");
});

test("translated pages expose the same unique scroll regions and all three language controls", async () => {
  const paths = ["", ...serviceSlugs.map(slug => `/services/${slug}`), ...projectSlugs.map(slug => `/work/${slug}`), "/privacy"];
  for (const path of paths) {
    const pages = await Promise.all(locales.map(locale => render(`/${locale}${path}`)));
    const regions = pages.map(({ html }) => Array.from(html.matchAll(/data-scroll-region="([^"]+)"/g), match => match[1]));
    assert.deepEqual(regions[0], regions[1], `${path || "/"}: language-independent regions`);
    assert.equal(new Set(regions[0]).size, regions[0].length, `${path || "/"}: unique regions`);
    assert.ok(regions[0].length >= 3, path || "/");
    assert.deepEqual(regions[0].slice(-2), ["contact", "footer"], path || "/");
    for (const { html } of pages) assert.equal(occurrences(html, 'data-language-switch="true"'), 3, path || "/");
  }
});

test("privacy routes render matching published policies without draft status", async () => {
  const expectations = {
    ua: {
      title: "Політика конфіденційності",
      retention: "14 днів після останнього повідомлення",
      otherLocale: "/en/privacy",
    },
    en: {
      title: "Privacy Policy",
      retention: "14 days after the last message",
      otherLocale: "/ua/privacy",
    },
  };

  for (const locale of locales) {
    const route = `/${locale}/privacy`;
    const { response, html } = await render(route);
    const expected = expectations[locale];

    assert.equal(response.status, 200, route);
    assert.ok(html.includes('data-document-status="published"'), route);
    assert.doesNotMatch(html, /ЧЕРНЕТКА|Чернетка|чернетка|чернеткою|DRAFT|Draft|draft|privacy-page__status/, route);
    assert.ok(html.includes(expected.title), route);
    assert.ok(html.includes("Полосенко Євгеній Володимирович"), route);
    assert.ok(html.includes("byhover.studio@gmail.com"), route);
    assert.doesNotMatch(html, /hello@byhover\.studio/, route);
    assert.ok(html.includes(expected.retention), route);
    assert.ok(html.includes(`href="${expected.otherLocale}"`), `${route}: language route`);
    assert.equal(occurrences(html, 'class="privacy-page__section"'), 9, route);
    assert.doesNotMatch(html, /privacy-page__section--pending|Information required for the final policy|Що потрібно підтвердити для фінальної версії/, route);
    assert.match(html, /<meta name="robots" content="noindex, nofollow"\/>/, route);
  }
});

test("every public page inherits one homepage contact section and one shared footer", async () => {
  const routes = [
    ...locales,
    ...locales.flatMap((locale) => serviceSlugs.map((slug) => `${locale}/services/${slug}`)),
    ...locales.flatMap((locale) => projectSlugs.map((slug) => `${locale}/work/${slug}`)),
    ...locales.map((locale) => `${locale}/privacy`),
    ...locales.map((locale) => `${locale}/not-a-real-page`),
    "not-a-real-page",
    "fr",
    "fr/not-a-real-page",
  ].map((route) => `/${route}`);

  for (const route of routes) {
    const { response, html } = await render(route);
    const isNotFound = route === "/fr" || route.includes("not-a-real-page");
    const locale = route.startsWith("/ua") ? "ua" : "en";
    const isHome = route === `/${locale}`;
    const footer = html.match(/<footer\b[^>]*data-site-footer="true"[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? "";

    assert.doesNotMatch(footer, /LINKEDIN|ЧЕРНЕТКА|DRAFT/, `${route}: footer labels`);

    assert.equal(response.status, isNotFound ? 404 : 200, route);
    assert.equal(occurrences(html, "data-site-header=\"true\""), 1, route);
    assert.equal(occurrences(html, "data-site-footer=\"true\""), 1, route);
    assert.equal((html.match(/<main\b/g) ?? []).length, 1, route);
    assert.equal(occurrences(html, 'data-site-page-end="true"'), 1, route);
    assert.equal(occurrences(html, 'id="contact"'), 1, route);
    assert.equal(occurrences(html, 'class="contact-form"'), 1, route);
    const contactLabel = isHome
      ? locale === "ua" ? "09 / СТАРТ" : "09 / START"
      : locale === "ua" ? "ОБГОВОРІМО ПРОЄКТ" : "LET’S DISCUSS YOUR PROJECT";
    assert.ok(html.includes(contactLabel), `${route}: localized contact label`);
    assert.ok(html.indexOf('id="contact"') < html.indexOf('<footer'), `${route}: contact precedes footer`);
    assert.doesNotMatch(html, /class="service-start"|class="case-cta"/, `${route}: no duplicate start block`);
    const contact = html.match(/<section id="contact"[\s\S]*?<\/section>/)?.[0] ?? "";
    assert.ok(contact.includes('href="mailto:byhover.studio@gmail.com"'), `${route}: contact email`);
    for (const field of ["name", "email", "company", "serviceId", "budgetId", "message"]) {
      assert.ok(contact.includes(`name="${field}"`), `${route}: contact ${field}`);
    }
    assert.ok(contact.includes(`href="/${locale}/privacy"`), `${route}: form privacy language`);
    assert.doesNotMatch(
      html,
      /service-page-header|service-page-footer|case-header|case-footer|privacy-page__header|privacy-page__footer|not-found-page__header/,
      route,
    );
    assert.doesNotMatch(html, /<a\b[^>]*>\s*INSTAGRAM\s*<\/a>/i, route);
    for (const anchor of ["work", "services", "about", "contact"]) {
      const href = isHome || anchor === "contact" ? `#${anchor}` : `/${locale}#${anchor}`;
      assert.ok(footer.includes(`href="${href}"`), `${route}: footer ${href}`);
    }
  }
});

test("service routes preserve content CTAs and use the shared service context", async () => {
  const subheadings = {
    en: [
      "Agreed scope may include",
      "Agreed separately when needed",
      "How the work is shaped",
      "Timeline &amp; budget",
    ],
    ua: [
      "Погоджений обсяг може охоплювати",
      "За потреби погоджуємо окремо",
      "Як формується робота",
      "Строки й бюджет",
    ],
  };

  for (const locale of locales) {
    const otherLocale = locale === "en" ? "ua" : "en";
    for (const slug of serviceSlugs) {
      const route = `/${locale}/services/${slug}`;
      const { html } = await render(route);

      assert.match(html, /data-header-context="service"/, route);
      assert.match(
        html,
        new RegExp(`<a[^>]*href="/${locale}#services"[^>]*data-header-action="true"[^>]*>`),
        route,
      );
      assert.match(html, /<a class="service-primary-cta" href="#contact">/, route);
      assert.equal(selectedService(html), slug, `${route}: preselected service`);
      assert.equal(occurrences(html, "service-content-subheading"), 4, route);
      assert.match(html, new RegExp(`<a class="mobile-context-action [^"]*" href="/${locale}#services"`), route);
      for (const heading of subheadings[locale]) assert.ok(html.includes(heading), `${route}: ${heading}`);
      assert.ok(html.includes(`href="/${otherLocale}/services/${slug}"`), `${route}: language route`);
      assert.match(
        html,
        new RegExp(`<a href="/${locale}#services" class="is-active"[^>]*aria-current="location"`),
        `${route}: active Services item`,
      );
    }
  }
});

test("project routes expose full navigation and the shared project return action", async () => {
  const liveUrls = {
    yevai: "https://yevai.dev/",
    "ai-commercial-blueprint": "https://ai-commercial-blueprint.pipistrello-26.chatgpt.site/",
  };

  for (const locale of locales) {
    const otherLocale = locale === "en" ? "ua" : "en";
    for (const slug of projectSlugs) {
      const route = `/${locale}/work/${slug}`;
      const { html } = await render(route);

      assert.match(html, /data-header-context="project"/, route);
      assert.match(
        html,
        new RegExp(`<a[^>]*href="/${locale}#work"[^>]*data-header-action="true"[^>]*>`),
        route,
      );
      for (const anchor of ["work", "services", "about", "contact"]) {
        const href = anchor === "contact" ? "#contact" : `/${locale}#${anchor}`;
        assert.ok(html.includes(`href="${href}"`), `${route}: #${anchor}`);
      }
      assert.match(html, new RegExp(`<a class="mobile-context-action [^"]*" href="/${locale}#work"`), route);
      assert.ok(html.includes(`href="/${otherLocale}/work/${slug}"`), `${route}: language route`);
      assert.match(
        html,
        new RegExp(`<a href="/${locale}#work" class="is-active"[^>]*aria-current="location"`),
        `${route}: active Work item`,
      );
      const hero = html.match(/<section class="case-hero"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
      const liveStatus = locale === "ua" ? "САЙТ ПРАЦЮЄ" : "WEBSITE LIVE";
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${route}: one page heading`);
      assert.equal(occurrences(html, 'class="case-live-status"'), 1, `${route}: one shared live status`);
      assert.equal(occurrences(html, liveStatus), 1, `${route}: status copy is not duplicated`);
      assert.match(hero, /<p class="case-live-status">[\s\S]*?<\/p>/, `${route}: live status belongs to the hero`);
      const status = hero.match(/<p class="case-live-status">[\s\S]*?<\/p>/)?.[0] ?? "";
      const indicators = status.match(/<svg\b[^>]*class="case-live-indicator"[^>]*>[\s\S]*?<\/svg>/g) ?? [];
      assert.equal(indicators.length, 1, `${route}: one SVG live indicator`);
      assert.equal(occurrences(html, 'class="case-live-indicator"'), 1, `${route}: indicator is not duplicated`);
      assert.match(indicators[0], /viewBox="-3 -3 6 6"/);
      assert.match(indicators[0], /\bwidth="6"/);
      assert.match(indicators[0], /\bheight="6"/);
      assert.match(indicators[0], /aria-hidden="true"/);
      const circles = indicators[0].match(/<circle\b[^>]*>/g) ?? [];
      assert.equal(circles.length, 2, `${route}: one ring and one dot`);
      for (const circle of circles) {
        assert.match(circle, /\bcx="0"/);
        assert.match(circle, /\bcy="0"/);
      }
      assert.match(circles[0], /class="case-live-ring"/);
      assert.match(circles[0], /\br="4"/);
      assert.match(circles[1], /\br="3"/);
      assert.match(circles[1], /fill="#258451"/);
      assert.doesNotMatch(status, /<i\b/);
      assert.ok(hero.includes(liveStatus), `${route}: localized live status`);
      assert.ok(hero.indexOf('class="case-live-status"') > hero.indexOf("</h1>"), `${route}: status follows the project title`);
      assert.ok(html.indexOf('class="case-live-status"') < html.indexOf('class="case-cover '), `${route}: status precedes the cover`);
      if (liveUrls[slug]) assert.ok(html.includes(liveUrls[slug]), `${route}: live project URL`);
    }
  }
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /\.case-live-status\s+i(?:::after)?\s*\{/);
  const pulse = postcss.parse(css).nodes.find(node => node.type === "atrule" && node.name === "keyframes" && node.params === "case-live-pulse");
  assert.ok(pulse, "Live ring has a radius animation");
  const radii = [];
  pulse.walkDecls(declaration => {
    assert.notEqual(declaration.prop, "transform", "Live ring expands without moving its center");
    if (declaration.prop === "r") radii.push(declaration.value);
  });
  assert.deepEqual(radii, ["4px", "11px"]);
});

test("SolarCity presents the completed corporate website, motion studies and original assets in both languages", async () => {
  for (const locale of locales) {
    const { response, html } = await render(`/${locale}/work/solarcity`);
    assert.equal(response.status, 200);
    assert.match(html, /case-page-solarcity/);
    const caseContent = (html.match(/<main id="main">[\s\S]*?<\/main>/)?.[0] ?? "")
      .replace(/<!--[\s\S]*?-->/g, "");
    assert.ok(caseContent.includes(locale === "ua" ? "КОРПОРАТИВНИЙ САЙТ" : "CORPORATE WEBSITE"));
    assert.doesNotMatch(caseContent, /LANDING PAGE|ЛЕНДИНГ|Additional pages are planned|Додаткові сторінки заплановані|planned|запланован/i);
    const kicker = (html.match(/<div class="case-kicker">[\s\S]*?<\/div>/)?.[0] ?? "")
      .replace(/<!--[\s\S]*?-->/g, "");
    assert.ok(kicker.includes(`<span>${locale === "ua" ? "РЕАЛІЗОВАНИЙ ПРОЄКТ" : "COMPLETED PROJECT"}</span><span>${locale === "ua" ? "ФЛАГМАНСЬКИЙ КЕЙС" : "FLAGSHIP CASE"} / <span class="sc-kicker-motion">WEB &amp; MOTION</span></span>`));
    const cover = html.match(/<section class="case-cover [^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
    assert.ok(cover.includes("/previews/solarcity-corporate.png"), "SolarCity cover uses the completed corporate website screenshot");
    const result = caseContent.match(/<article[^>]*data-scroll-region="case-section-8"[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
    assert.ok(result.includes(`<span>09 / ${locale === "ua" ? "РЕЗУЛЬТАТ" : "RESULT"}</span>`));
    assert.doesNotMatch(html, /case-placeholder|EDITABLE PLACEHOLDER|РЕДАГОВАНИЙ PLACEHOLDER/);
    for (let index = 0; index < 9; index++) assert.equal(occurrences(html, `data-scroll-region="case-section-${index}"`), 1);
    const context = caseContent.match(/<article[^>]*data-scroll-region="case-section-0"[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
    assert.match(context, /data-solarcity-context/);
    const hotspots = (context.match(/<button\b[^>]*>/g) ?? [])
      .filter(button => /class="[^"]*\bsch-marker\b/.test(button));
    assert.equal(hotspots.length, 4, "Context exposes four interactive infrastructure hotspots");
    for (const button of hotspots) assert.match(button, /aria-pressed="(?:true|false)"/);
    assert.equal(hotspots.filter(button => button.includes('aria-pressed="true"')).length, 1);
    const challenge = caseContent.match(/<article[^>]*data-scroll-region="case-section-1"[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
    const description = challenge.match(/<p\b[^>]*class="[^"]*\bsc-challenge-description\b[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    assert.ok(description?.[1].trim(), "Challenge includes a short explanatory paragraph");
    assert.ok(challenge.indexOf("sc-challenge-description") > challenge.indexOf('class="case-text-lead"'));
    const taskListStart = challenge.match(/<div\b[^>]*class="[^"]*\bcase-task-list\b[^"]*"[^>]*>/)?.index ?? -1;
    assert.ok(taskListStart >= 0, "Challenge keeps its task-list wrapper");
    assert.ok(challenge.indexOf("sc-challenge-description") < taskListStart);
    const art = caseContent.match(/<article[^>]*data-scroll-region="case-section-3"[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
    assert.match(art, /data-solarcity-hero/);
    assert.ok(art.includes(locale === "ua" ? "Будуємо" : "We build"), "Art direction includes the original HERO heading");
    assert.equal(occurrences(art, 'class="sh-signal"'), 5, "Live HERO includes all five infrastructure signals");
    assert.match(art, /class="[^"]*\bsh-pause\b[^"]*"/);
    assert.doesNotMatch(art, /<figure\b[^>]*class="sc-screen(?:\s[^"]*)?"/);
    assert.match(html, /data-solarcity-motion/);
    assert.match(html, /role="tablist"/);
    assert.match(html, /type="range"/);
    assert.match(html, /data-running="false"/);
    assert.ok(html.includes("/case/solarcity/hybrid-complex.webp"));
    assert.ok(html.includes("/case/solarcity/energy-campus.webp"));
    const responsive = caseContent.match(/<article[^>]*data-scroll-region="case-section-6"[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
    assert.ok(responsive.includes('class="sc-devices-stage"'));
    const devices = (responsive.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? [])
      .filter(button => /class="[^"]*\bsc-device\b/.test(button));
    assert.equal(devices.length, 2, "Case responsive section shows only tablet and phone");
    assert.match(devices[0], /\bsc-device-tablet\b/);
    assert.match(devices[1], /\bsc-device-phone\b/);
    assert.doesNotMatch(responsive, /class="[^"]*\b(?:featured-screen|sc-device-desktop)\b/);
    const caseTabletFrame = devices[0].match(/<svg\b[^>]*role="img"[^>]*>/)?.[0] ?? "";
    assert.ok(caseTabletFrame.includes('viewBox="0 0 930 1248"'), "Tablet crop excludes browser controls");
    assert.ok(caseTabletFrame.includes('width="930"'));
    assert.ok(caseTabletFrame.includes('height="1248"'));
    const caseTabletImage = devices[0].match(/<image\b[^>]*href="\/case\/solarcity\/featured-tablet-hybrid\.jpg"[^>]*>/)?.[0] ?? "";
    assert.ok(caseTabletImage.includes('width="930"'));
    assert.ok(caseTabletImage.includes('height="1280"'));
    assert.doesNotMatch(responsive, /data-solarcity-language-patch/, "Case tablet uses its supplied language pill without an overlay");
    assert.ok(devices[1].includes('src="/case/solarcity/responsive-mobile.png"'));
    assert.ok(devices[1].includes('width="717"'));
    assert.ok(devices[1].includes('height="1299"'));
    const gallery = caseContent.match(/<article[^>]*data-scroll-region="case-section-7"[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
    assert.ok(gallery.includes('class="sc-gallery"'));
    const frames = Array.from(gallery.matchAll(/<span class="sc-gallery-frame">([\s\S]*?)<\/span>/g), match => match[1]);
    assert.equal(frames.length, 2, "Selected screens show two complete screenshots");
    for (const [index, src, height] of [
      [0, "/case/solarcity/energy-scenarios.png", 1131],
      [1, "/case/solarcity/selected-development.png", 1133],
    ]) {
      assert.ok(frames[index].includes(`src="${src}"`));
      assert.ok(frames[index].includes('width="2048"'));
      assert.ok(frames[index].includes(`height="${height}"`));
    }
    assert.match(frames[0], /<img\b[^>]*src="\/case\/solarcity\/energy-scenarios\.png"/);
    assert.doesNotMatch(frames[0], /<svg\b|data-solarcity-language-patch/, "Supplied desktop bitmap renders directly without an overlay");
    assert.equal((gallery.match(/aria-haspopup="dialog"/g) ?? []).length, 2, "Both full screens can be enlarged");
    assert.doesNotMatch(gallery, /sc-screen-grid|featured-stage/);
    assert.ok(html.includes(`href="https://solarcity-concept-01.pipistrello-26.chatgpt.site/${locale === "en" ? "en/" : ""}"`));
    const homepage = await render(`/${locale}`);
    const homepageDevices = {};
    for (const className of ["featured-screen", "featured-tablet", "featured-phone"]) {
      assert.equal(occurrences(homepage.html, `class="${className}"`), 1, `${locale}: homepage retains ${className}`);
      homepageDevices[className] = homepage.html.match(new RegExp(`<button\\b[^>]*class="${className}"[^>]*>([\\s\\S]*?)<\\/button>`))?.[1] ?? "";
    }
    assert.ok(homepageDevices["featured-screen"].includes('src="/case/solarcity/energy-scenarios.png"'), "Homepage and case gallery share the supplied desktop screenshot");
    assert.ok(homepageDevices["featured-screen"].includes('width="2048"'));
    assert.ok(homepageDevices["featured-screen"].includes('height="1131"'));
    for (const [className, src, width, sourceHeight, cropHeight] of [
      ["featured-tablet", "/case/solarcity/featured-tablet-hybrid.jpg", 930, 1280, 1248],
      ["featured-phone", "/case/solarcity/featured-mobile-scale.png", 1014, 2048, 1800],
    ]) {
      const frame = homepageDevices[className].match(/<svg\b[^>]*role="img"[^>]*>/)?.[0] ?? "";
      assert.ok(frame.includes(`viewBox="0 0 ${width} ${cropHeight}"`), `${className}: crop excludes browser controls`);
      assert.ok(frame.includes(`width="${width}"`));
      assert.ok(frame.includes(`height="${cropHeight}"`));
      const bitmap = (homepageDevices[className].match(/<image\b[^>]*>/g) ?? []).find(image => image.includes(`href="${src}"`)) ?? "";
      assert.ok(bitmap.includes(`width="${width}"`));
      assert.ok(bitmap.includes(`height="${sourceHeight}"`));
    }
    assert.doesNotMatch(homepage.html, /data-solarcity-language-patch/, `${locale}: homepage has no added language overlays`);
  }
  const assets = [
    "previews/solarcity-corporate.png",
    ...["energy-campus.webp", "hybrid-complex.webp", "featured-desktop.png", "featured-tablet-hybrid.jpg", "featured-mobile-scale.png", "selected-development.png", "selected-scale.png", "responsive-mobile.png", "energy-scenarios.png"]
      .map(name => `case/solarcity/${name}`),
  ];
  const contents = await Promise.all(assets.map(name => readFile(new URL(`../public/${name}`, import.meta.url))));
  for (const content of contents) assert.ok(content.length > 1000);
  const galleryCss = await readFile(new URL("../app/solarcity-screen-gallery.css", import.meta.url), "utf8");
  const screenshotStyles = {};
  postcss.parse(galleryCss).walkRules(rule => {
    for (const selector of [".sc-gallery-frame > img"]) {
      if (rule.selectors.includes(selector)) {
        const declarations = screenshotStyles[selector] ??= {};
        rule.walkDecls(declaration => { declarations[declaration.prop] = declaration.value; });
      }
    }
  });
  for (const selector of [".sc-gallery-frame > img"]) {
    assert.equal(screenshotStyles[selector]?.width, "100%", selector);
    assert.equal(screenshotStyles[selector]?.height, "auto", selector);
    assert.equal(screenshotStyles[selector]?.["object-fit"], "contain", selector);
  }
  const caseCss = await readFile(new URL("../app/solarcity-case.css", import.meta.url), "utf8");
  const journeyRules = {};
  postcss.parse(caseCss).walkRules(rule => {
    for (const selector of rule.selectors) {
      if ([".case-page-solarcity .sc-journey", ".sc-journey > li", ".sc-journey > li:last-child"].includes(selector)) {
        const declarations = journeyRules[selector] ??= {};
        rule.walkDecls(declaration => { declarations[declaration.prop] = declaration.value; });
      }
    }
  });
  const outerTop = journeyRules[".case-page-solarcity .sc-journey"]?.["border-top"];
  assert.ok(outerTop === undefined || ["0", "0px", "none"].includes(outerTop), "Structure has no top outer divider");
  assert.equal(journeyRules[".sc-journey > li"]?.["border-bottom"], "1px solid var(--line)", "Structure retains its internal dividers");
  assert.ok(["0", "0px", "none"].includes(journeyRules[".sc-journey > li:last-child"]?.["border-bottom"]), "Structure has no bottom outer divider");
});

test("the shared form preserves homepage query preselection and 404 language fallback", async () => {
  for (const locale of locales) {
    const { html } = await render(`/${locale}?service=corporate-websites`);
    assert.equal(selectedService(html), "corporate-websites", locale);
    const invalid = await render(`/${locale}?service=unknown-service`);
    assert.equal(selectedService(invalid.html), "", locale);
  }
  const worker = await workerPromise;
  const response = await worker.fetch(
    new Request("http://localhost/not-a-real-page", { headers: { accept: "text/html", cookie: "hover_locale=ua" } }),
    environment,
    executionContext,
  );
  const html = stripScripts(await response.text());
  assert.equal(response.status, 404);
  assert.ok(html.includes("ОБГОВОРІМО ПРОЄКТ"));
  assert.ok(html.includes('href="/ua/privacy"'));
});

test("service content subheading role stays scoped to the approved sans-serif treatment", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const declarations = {};
  postcss.parse(css).walkRules((rule) => {
    if (rule.parent.type === "root" && rule.selectors.includes(".service-content-subheading")) {
      rule.walkDecls((declaration) => { declarations[declaration.prop] = declaration.value; });
    }
  });

  assert.match(declarations["font-family"], /^"Inter Tight"/);
  assert.equal(declarations["font-size"], "var(--content-subheading-size)");
  assert.equal(declarations["font-weight"], "500");
  assert.equal(declarations.color, "var(--ink)");
  for (const property of ["text-transform", "opacity", "height"]) assert.equal(declarations[property], undefined);
  assert.match(css, /\.service-content-group\s*\{[^}]*grid-template-rows:\s*subgrid/s);
  const mobile = postcss.parse(css).nodes.find(node => node.type === "atrule" && node.params === "(max-width: 760px)" && node.toString().includes("--content-subheading-size"));
  assert.match(mobile.toString(), /--content-subheading-size:\s*1\.1875rem/);
});

test("all project overviews expose the same six localized facts in a stable order", async () => {
  const expectedLabels = {
    ua: ["КЛІЄНТ", "СФЕРА", "ТИП САЙТУ", "ПОСЛУГИ", "МОВИ САЙТУ", "РІК"],
    en: ["CLIENT", "INDUSTRY", "WEBSITE TYPE", "SERVICES", "WEBSITE LANGUAGES", "YEAR"],
  };
  const clients = { solarcity: "SolarCity", solarfamily: "SolarFamily", yevai: "YevAI.dev", "ai-commercial-blueprint": "YevAI.dev" };
  for (const locale of locales) {
    for (const slug of projectSlugs) {
      const route = `/${locale}/work/${slug}`;
      const { html } = await render(route);
      const overview = (html.match(/<section class="case-facts"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "").replace(/<!--[\s\S]*?-->/g, "");
      const labels = Array.from(overview.matchAll(/<span class="content-meta">([^<]+)<\/span>/g), match => match[1]);
      const values = Array.from(overview.matchAll(/<p class="content-body">([^<]+)<\/p>/g), match => match[1]);
      const numbers = Array.from(overview.matchAll(/class="featured-phase-index" aria-hidden="true">([^<]+)<\/span>/g), match => match[1]);
      assert.deepEqual(labels, expectedLabels[locale], `${route}: shared labels and order`);
      assert.deepEqual(numbers, ["01", "02", "03", "04", "05", "06"], `${route}: six numbered cells`);
      assert.equal(values.length, 6, `${route}: every fact has a value`);
      assert.equal(values[0], clients[slug], `${route}: client identity`);
      assert.equal(values[4], slug === "ai-commercial-blueprint" ? "UA" : "UA / EN", `${route}: website languages`);
      assert.equal(values[5], "2026", `${route}: production year retained in the overview`);
    }
  }
});

test("Blueprint renders a complete localized product-landing case with real materials and no placeholder status", async () => {
  for (const locale of locales) {
    const { response, html } = await render(`/${locale}/work/ai-commercial-blueprint`);
    assert.equal(response.status, 200);
    assert.match(html, /class="case-page case-page-blueprint"/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    const content = html.slice(html.indexOf('<section class="case-sections">'), html.indexOf('<div class="case-live">'));
    const regions = Array.from(content.matchAll(/data-scroll-region="(case-section-\d+)"/g), match => match[1]);
    assert.deepEqual(regions, Array.from({ length: 9 }, (_, index) => `case-section-${index}`));
    assert.doesNotMatch(content, /case-placeholder|CASE MATERIAL|PLACEHOLDER|Detailed case material|Детальні матеріали кейсу|ЧЕРНЕТКА|DRAFT|COMING SOON|PRE-LAUNCH/);
    assert.ok(content.includes(locale === "ua" ? "Зробити зміст цифрового продукту" : "Make the content of a digital product clear"));
    assert.ok(content.includes('class="case-task-list case-task-progress"'));
    assert.equal((content.match(/class="case-task-row"/g) ?? []).length, 4);
    assert.match(content, /data-blueprint-preview/);
    assert.ok(content.includes("Book"));
    assert.ok(content.includes("Production Edition"));
    for (const asset of ["ai-commercial-blueprint-hero-stack.webp", "commercial-pipeline-master.png", "ai-commercial-blueprint-cover-master.png"]) {
      assert.ok(content.includes(`/case/blueprint/${asset}`), asset);
    }
    assert.ok(html.includes('src="/previews/ai-commercial-blueprint-cover.png"'));
    assert.ok(html.includes('href="https://ai-commercial-blueprint.pipistrello-26.chatgpt.site/"'));
    assert.ok(html.includes(locale === "ua" ? "МОВИ САЙТУ" : "WEBSITE LANGUAGES"));
    assert.ok(html.includes('href="/' + (locale === "ua" ? "en" : "ua") + '/work/ai-commercial-blueprint"'));
  }
});
