import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  server: { middlewareMode: true, hmr: false, ws: false },
});
const { POST } = await vite.ssrLoadModule("/app/api/contact/route.ts");
const { isFormSubmitAccepted, isFormSubmitEndpoint } = await vite.ssrLoadModule(
  "/app/contact-delivery.ts",
);

after(async () => {
  await vite.close();
});

const formSubmitEndpoint = "https://formsubmit.co/ajax/byhover.studio@gmail.com";
const siteOrigin = "https://hover-studio.example";

function validPayload(overrides = {}) {
  return {
    locale: "en",
    name: "Alex Example",
    email: "alex@example.com",
    company: "Example Company",
    serviceId: "landing-pages",
    budgetId: "tier-1",
    message: "Please help us launch our new service.",
    ...overrides,
  };
}

function contactRequest(payload = validPayload(), origin = siteOrigin) {
  return new Request(`${siteOrigin}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(payload),
  });
}

function configureDelivery(t, endpoint = formSubmitEndpoint, token) {
  const previousEndpoint = process.env.HOVER_CONTACT_FORM_ENDPOINT;
  const previousToken = process.env.HOVER_CONTACT_FORM_TOKEN;
  if (endpoint === null) delete process.env.HOVER_CONTACT_FORM_ENDPOINT;
  else process.env.HOVER_CONTACT_FORM_ENDPOINT = endpoint;
  if (token === undefined) delete process.env.HOVER_CONTACT_FORM_TOKEN;
  else process.env.HOVER_CONTACT_FORM_TOKEN = token;
  t.after(() => {
    if (previousEndpoint === undefined) delete process.env.HOVER_CONTACT_FORM_ENDPOINT;
    else process.env.HOVER_CONTACT_FORM_ENDPOINT = previousEndpoint;
    if (previousToken === undefined) delete process.env.HOVER_CONTACT_FORM_TOKEN;
    else process.env.HOVER_CONTACT_FORM_TOKEN = previousToken;
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function assertApiResponse(response, status, body) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await response.json(), body);
}

test("cancels an oversized streamed body before consuming the remaining chunks", async (t) => {
  configureDelivery(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("An oversized request must not be delivered");
  });
  let chunksRead = 0;
  let cancelled = false;
  const totalChunks = 8;
  const stream = new ReadableStream({
    pull(controller) {
      chunksRead += 1;
      controller.enqueue(new Uint8Array(8_000).fill(32));
      if (chunksRead === totalChunks) controller.close();
    },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const request = new Request(`${siteOrigin}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: siteOrigin },
    body: stream,
    duplex: "half",
  });
  assert.equal(request.headers.has("content-length"), false);

  await assertApiResponse(await POST(request), 413, { ok: false, code: "PAYLOAD_TOO_LARGE" });
  assert.equal(cancelled, true);
  assert.ok(chunksRead < totalChunks, "The server must stop reading before the full upload arrives");
  assert.equal(fetch.mock.callCount(), 0);
});

test("decodes split UTF-8 characters and accepts a valid body at the 20,000-byte limit", async (t) => {
  configureDelivery(t);
  const payload = validPayload({
    locale: "ua",
    name: "Ім’я О’Браєн",
    message: "Український текст з апострофом ’ та емодзі ☀️. ".repeat(70),
  });
  const encoder = new TextEncoder();
  const serialized = JSON.stringify(payload);
  const bytes = encoder.encode(serialized + " ".repeat(20_000 - encoder.encode(serialized).byteLength));
  assert.equal(bytes.byteLength, 20_000);
  let offset = 0;
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      if (offset === bytes.byteLength) return controller.close();
      const end = Math.min(offset + 17, bytes.byteLength);
      controller.enqueue(bytes.slice(offset, end));
      offset = end;
    },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const request = new Request(`${siteOrigin}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: siteOrigin },
    body: stream,
    duplex: "half",
  });

  const response = await POST(request);
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.code, "BROWSER_DELIVERY_REQUIRED");
  assert.equal(result.delivery.payload.name, payload.name);
  assert.equal(result.delivery.payload["Повідомлення / Message"], payload.message.trim());
  assert.equal(cancelled, false);
});

test("rejects a missing request body as invalid JSON without delivery", async (t) => {
  configureDelivery(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("An empty request must not be delivered");
  });
  const request = new Request(`${siteOrigin}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: siteOrigin },
  });

  await assertApiResponse(await POST(request), 400, { ok: false, code: "INVALID_JSON" });
  assert.equal(fetch.mock.callCount(), 0);
});

for (const [label, endpoint] of [
  ["missing", null],
  ["empty", "  "],
  ["insecure", "http://formsubmit.co/ajax/byhover.studio@gmail.com"],
  ["invalid", "not an endpoint"],
]) {
  test(`does not fetch with a ${label} delivery endpoint`, async (t) => {
    configureDelivery(t, endpoint);
    const fetch = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("An unconfigured endpoint must not be contacted");
    });

    await assertApiResponse(await POST(contactRequest()), 503, {
      ok: false,
      code: "NOT_CONFIGURED",
    });
    assert.equal(fetch.mock.callCount(), 0);
  });
}

for (const [label, payload, origin, status, expected] of [
  ["another origin", validPayload(), "https://unrelated.example", 403,
    { ok: false, code: "FORBIDDEN" }],
  ["a populated honeypot", validPayload({ website: " https://spam.example " }), siteOrigin, 422,
    { ok: false, code: "VALIDATION_ERROR" }],
  ["an invalid email", validPayload({ email: "invalid" }), siteOrigin, 422,
    { ok: false, code: "VALIDATION_ERROR", fieldErrors: { email: "invalid" } }],
]) {
  test(`rejects ${label} before fetching`, async (t) => {
    configureDelivery(t);
    const fetch = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("An invalid request must not be delivered");
    });

    await assertApiResponse(await POST(contactRequest(payload, origin)), status, expected);
    assert.equal(fetch.mock.callCount(), 0);
  });
}

for (const [locale, serviceId, budgetId, serviceLabel, budgetLabel] of [
  ["en", "landing-pages", "tier-1", "Landing Page", "$850–$1,350"],
  ["ua", "business-websites", "tier-2", "Бізнес-сайт", "55–80 ТИС. ГРН"],
  ["en", "not-sure", "not-sure", "Not sure yet", "Not sure yet"],
  ["ua", "not-sure", "not-sure", "Потрібна консультація", "Ще не визначився"],
]) {
  test(`prepares readable ${locale} ${serviceId} fields without sending or claiming receipt`, async (t) => {
    configureDelivery(t, ` ${formSubmitEndpoint} `, "must-not-leak-to-formsubmit");
    const fetch = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("FormSubmit must be contacted only by the browser");
    });
    const payload = validPayload({ locale, serviceId, budgetId, company: "", website: "" });

    await assertApiResponse(await POST(contactRequest(payload)), 200, {
      ok: false,
      code: "BROWSER_DELIVERY_REQUIRED",
      delivery: {
        provider: "formsubmit",
        endpoint: formSubmitEndpoint,
        payload: {
          _subject: `HOVER.STUDIO — Нова заявка / ${serviceLabel}`,
          _template: "table",
          _captcha: "false",
          _url: `${siteOrigin}/ua#contact`,
          _replyto: payload.email,
          name: payload.name,
          email: payload.email,
          "Компанія / Company": "—",
          "Послуга / Service": serviceLabel,
          "Бюджет / Budget": budgetLabel,
          "Мова / Language": locale.toUpperCase(),
          "Повідомлення / Message": payload.message,
        },
      },
    });
    assert.equal(fetch.mock.callCount(), 0);
  });
}

for (const [label, error, code] of [
  ["an abort", new DOMException("The operation was aborted", "AbortError"), "UPSTREAM_TIMEOUT"],
  ["a network failure", new Error("Network unavailable"), "UPSTREAM_UNAVAILABLE"],
]) {
  test(`maps ${label} to a non-successful delivery response`, async (t) => {
    configureDelivery(t, "https://webhook.example/contact");
    const fetch = t.mock.method(globalThis, "fetch", async () => { throw error; });

    await assertApiResponse(await POST(contactRequest()), 503, { ok: false, code });
    assert.equal(fetch.mock.callCount(), 1);
  });
}

test("preserves generic HTTPS webhook payloads and bearer token authentication", async (t) => {
  const endpoint = "https://webhook.example/contact";
  configureDelivery(t, endpoint, "  secret-token  ");
  const fetch = t.mock.method(globalThis, "fetch", async () => jsonResponse({ ok: true }));
  const payload = validPayload({ locale: "ua", serviceId: "business-websites", budgetId: "tier-2" });

  await assertApiResponse(await POST(contactRequest(payload)), 202, { ok: true });
  assert.equal(fetch.mock.callCount(), 1);
  const [actualEndpoint, options] = fetch.mock.calls[0].arguments;
  assert.equal(String(actualEndpoint), endpoint);
  assert.deepEqual(JSON.parse(options.body), payload);
  const headers = new Headers(options.headers);
  assert.equal(headers.get("authorization"), "Bearer secret-token");
  assert.equal(headers.has("origin"), false);
  assert.equal(headers.has("referer"), false);
});

test("requires the generic webhook's boolean ok contract", async (t) => {
  configureDelivery(t, "https://webhook.example/contact");
  t.mock.method(globalThis, "fetch", async () => jsonResponse({ success: "true", ok: "true" }));

  await assertApiResponse(await POST(contactRequest()), 503, {
    ok: false,
    code: "UPSTREAM_REJECTED",
  });
});

test("does not mistake truthy values or lookalike hosts for FormSubmit acceptance", () => {
  for (const success of [false, "false", 1, "1", {}, [], undefined]) {
    assert.equal(isFormSubmitAccepted({ success }), false);
  }
  assert.equal(isFormSubmitEndpoint(new URL(formSubmitEndpoint)), true);
  for (const endpoint of [
    "https://formsubmit.co.attacker.example/ajax/contact",
    "https://webhook.example/ajax/contact",
    "https://formsubmit.co/contact",
    "https://formsubmit.co:8443/ajax/contact",
    "https://user:password@formsubmit.co/ajax/contact",
    "https://formsubmit.co/ajax/",
    "https://formsubmit.co/ajax/contact/another-path",
  ]) {
    assert.equal(isFormSubmitEndpoint(new URL(endpoint)), false);
  }
});
