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
const { submitContactRequest, CONTACT_REQUEST_TIMEOUT_MS } = await vite.ssrLoadModule("/app/contact-request.ts");

after(async () => {
  await vite.close();
});

const formSubmitEndpoint = "https://formsubmit.co/ajax/byhover.studio@gmail.com";
const input = {
  locale: "en",
  name: "Alex Example",
  email: "alex@example.com",
  company: "Example Company",
  serviceId: "landing-pages",
  budgetId: "tier-1",
  message: "Please help us launch our new service.",
  website: "",
};
const deliveryPayload = {
  _subject: "HOVER.STUDIO — Нова заявка / Landing Page",
  _template: "table",
  _captcha: "false",
  _url: "https://hover-studio.example/ua#contact",
  _replyto: input.email,
  name: input.name,
  email: input.email,
  "Компанія / Company": input.company,
  "Послуга / Service": "Landing Page",
  "Бюджет / Budget": "$850–$1,350",
  "Мова / Language": "EN",
  "Повідомлення / Message": input.message,
};

function deliveryInstruction(deliveryOverrides = {}, resultOverrides = {}) {
  return {
    ok: false,
    code: "BROWSER_DELIVERY_REQUIRED",
    delivery: {
      provider: "formsubmit",
      endpoint: formSubmitEndpoint,
      payload: { ...deliveryPayload },
      ...deliveryOverrides,
    },
    ...resultOverrides,
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockSequence(t, responses) {
  let index = 0;
  return t.mock.method(globalThis, "fetch", async (...args) => {
    assert.ok(index < responses.length, "Unexpected fetch: no retries or extra requests are allowed");
    const next = responses[index++];
    return typeof next === "function" ? next(...args) : next;
  });
}

for (const success of [true, "true"]) {
  test(`reports success only after browser FormSubmit accepts ${JSON.stringify(success)}`, async (t) => {
    const controller = new AbortController();
    let releaseProvider;
    const providerResponse = new Promise((resolve) => { releaseProvider = resolve; });
    t.after(() => releaseProvider(jsonResponse({ success: false })));
    const fetch = mockSequence(t, [jsonResponse(deliveryInstruction()), () => providerResponse]);
    let finished = false;
    const pending = submitContactRequest(input, controller.signal).then((result) => {
      finished = true;
      return result;
    });

    await new Promise(setImmediate);
    assert.equal(fetch.mock.callCount(), 2, "The validated instruction must start browser delivery");
    assert.equal(finished, false, "Preparing delivery must never show success");
    releaseProvider(jsonResponse({ success }));
    assert.deepEqual(await pending, { status: 202, result: { ok: true } });

    const [apiEndpoint, apiOptions] = fetch.mock.calls[0].arguments;
    assert.equal(apiEndpoint, "/api/contact");
    assert.equal(apiOptions.method, "POST");
    assert.equal(new Headers(apiOptions.headers).get("content-type"), "application/json");
    assert.deepEqual(JSON.parse(apiOptions.body), input);
    assert.equal(apiOptions.signal, controller.signal);

    const [providerEndpoint, providerOptions] = fetch.mock.calls[1].arguments;
    assert.equal(String(providerEndpoint), formSubmitEndpoint);
    assert.equal(providerOptions.method, "POST");
    assert.equal(providerOptions.mode, "cors");
    assert.equal(providerOptions.credentials, "omit");
    assert.equal(providerOptions.signal, controller.signal);
    assert.ok(providerOptions.body instanceof URLSearchParams);
    assert.deepEqual(Object.fromEntries(providerOptions.body), deliveryPayload);
    assert.deepEqual(Object.fromEntries(new Headers(providerOptions.headers)), {
      accept: "application/json",
    });
    assert.equal(fetch.mock.callCount(), 2);
  });
}

test("round-trips Unicode and punctuation through a safelisted form-encoded browser request", async (t) => {
  const payload = {
    ...deliveryPayload,
    _replyto: "alex+project@example.com",
    "Компанія / Company": "Київ & Partners + 100%",
    "Бюджет / Budget": "35–55 ТИС. ГРН",
    "Повідомлення / Message": "Привіт! 🚀\nA&B = C+D; 50%? #details /quote",
  };
  const fetch = mockSequence(t, [jsonResponse(deliveryInstruction({ payload })), jsonResponse({ success: "true" })]);

  assert.deepEqual(await submitContactRequest(input, new AbortController().signal), {
    status: 202,
    result: { ok: true },
  });
  const [endpoint, options] = fetch.mock.calls[1].arguments;
  assert.ok(options.body instanceof URLSearchParams);
  assert.deepEqual(Object.fromEntries(new Headers(options.headers)), { accept: "application/json" });
  const request = new Request(endpoint, options);
  assert.equal(request.headers.get("content-type").split(";", 1)[0], "application/x-www-form-urlencoded");
  assert.deepEqual(Object.fromEntries(new URLSearchParams(await request.text())), payload);
  assert.equal(fetch.mock.callCount(), 2);
});

test("permits a two-stage LTE delivery exceeding 15 seconds within the bounded 45-second budget", async (t) => {
  assert.equal(CONTACT_REQUEST_TIMEOUT_MS, 45_000);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), CONTACT_REQUEST_TIMEOUT_MS);
  t.after(() => clearTimeout(deadline));
  const delayed = (milliseconds, response) => () => new Promise(resolve => {
    setTimeout(() => resolve(response), milliseconds);
  });
  const fetch = mockSequence(t, [
    delayed(8_000, jsonResponse(deliveryInstruction())),
    delayed(18_000, jsonResponse({ success: "true" })),
  ]);
  let finished = false;
  const pending = submitContactRequest(input, controller.signal).then(result => {
    finished = true;
    return result;
  });

  assert.equal(fetch.mock.callCount(), 1);
  t.mock.timers.tick(8_000);
  await new Promise(setImmediate);
  assert.equal(fetch.mock.callCount(), 2);
  t.mock.timers.tick(7_001);
  assert.equal(controller.signal.aborted, false);
  assert.equal(finished, false, "The old 15-second deadline must not terminate an in-flight enquiry");
  t.mock.timers.tick(10_999);

  assert.deepEqual(await pending, { status: 202, result: { ok: true } });
  assert.equal(controller.signal.aborted, false);
  assert.equal(fetch.mock.callCount(), 2);
});

for (const [label, status, body] of [
  ["field validation errors", 422, { ok: false, code: "VALIDATION_ERROR", fieldErrors: { email: "invalid" } }],
  ["an API failure", 503, { ok: false, code: "NOT_CONFIGURED" }],
  ["a failed HTTP response containing a delivery instruction", 503, deliveryInstruction()],
  ["a successful generic webhook", 202, { ok: true }],
  ["an unrecognized instruction code", 200, deliveryInstruction({}, { code: "OTHER_CODE" })],
]) {
  test(`does not contact FormSubmit after ${label}`, async (t) => {
    const fetch = mockSequence(t, [jsonResponse(body, status)]);

    assert.deepEqual(await submitContactRequest(input, new AbortController().signal), { status, result: body });
    assert.equal(fetch.mock.callCount(), 1);
  });
}

test("does not treat malformed API JSON as acceptance or start provider delivery", async (t) => {
  const fetch = mockSequence(t, [new Response("<html>Unavailable</html>", { status: 502 })]);

  const response = await submitContactRequest(input, new AbortController().signal);
  assert.notEqual(response.result?.ok, true);
  assert.equal(fetch.mock.callCount(), 1);
});

test("rejects a contradictory preparation response that already claims success", async (t) => {
  const fetch = mockSequence(t, [jsonResponse(deliveryInstruction({}, { ok: true }))]);

  assert.deepEqual(await submitContactRequest(input, new AbortController().signal), {
    status: 503,
    result: { ok: false, code: "UPSTREAM_REJECTED" },
  });
  assert.equal(fetch.mock.callCount(), 1);
});

for (const [label, providerResponse] of [
  ["the truthy string false", () => jsonResponse({ success: "false" })],
  ["boolean false", () => jsonResponse({ success: false })],
  ["a missing success field", () => jsonResponse({ message: "Received" })],
  ["a truthy numeric success field", () => jsonResponse({ success: 1 })],
  ["malformed provider JSON", () => new Response("<html>Unavailable</html>")],
  ["a null provider body", () => jsonResponse(null)],
  ["an HTTP error claiming acceptance", () => jsonResponse({ success: "true" }, 502)],
  ["HTTP 429 rate limiting", () => jsonResponse({ success: "false", message: "Rate limit exceeded. Please try again later." }, 429)],
]) {
  test(`preserves failure for ${label} without retrying`, async (t) => {
    const fetch = mockSequence(t, [jsonResponse(deliveryInstruction()), providerResponse]);

    assert.deepEqual(await submitContactRequest(input, new AbortController().signal), {
      status: 503,
      result: { ok: false, code: "UPSTREAM_REJECTED" },
    });
    assert.equal(fetch.mock.callCount(), 2);
  });
}

test("keeps FormSubmit activation pending instead of claiming receipt", async (t) => {
  const fetch = mockSequence(t, [jsonResponse(deliveryInstruction()), jsonResponse({
    success: "false",
    message: "This form needs Activation. We've sent you an email containing an 'Activate Form' link.",
  })]);

  assert.deepEqual(await submitContactRequest(input, new AbortController().signal), {
    status: 503,
    result: { ok: false, code: "ACTIVATION_REQUIRED" },
  });
  assert.equal(fetch.mock.callCount(), 2);
});

for (const [label, overrides] of [
  ["another provider", { provider: "other" }],
  ["HTTP", { endpoint: "http://formsubmit.co/ajax/contact" }],
  ["a lookalike hostname", { endpoint: "https://formsubmit.co.attacker.example/ajax/contact" }],
  ["an unrelated host", { endpoint: "https://webhook.example/ajax/contact" }],
  ["a non-default port", { endpoint: "https://formsubmit.co:8443/ajax/contact" }],
  ["URL credentials", { endpoint: "https://user:password@formsubmit.co/ajax/contact" }],
  ["the wrong path", { endpoint: "https://formsubmit.co/contact" }],
  ["an empty AJAX recipient", { endpoint: "https://formsubmit.co/ajax/" }],
  ["an extra path segment", { endpoint: "https://formsubmit.co/ajax/contact/another-path" }],
  ["an invalid URL", { endpoint: "not an endpoint" }],
  ["a missing endpoint", { endpoint: undefined }],
  ["a null payload", { payload: null }],
  ["a string payload", { payload: "message" }],
  ["an array payload", { payload: ["message"] }],
  ["a non-string payload field", { payload: { ...deliveryPayload, name: { nested: "value" } } }],
]) {
  test(`rejects a browser delivery instruction containing ${label}`, async (t) => {
    const fetch = mockSequence(t, [jsonResponse(deliveryInstruction(overrides))]);

    assert.deepEqual(await submitContactRequest(input, new AbortController().signal), {
      status: 503,
      result: { ok: false, code: "UPSTREAM_REJECTED" },
    });
    assert.equal(fetch.mock.callCount(), 1);
  });
}

for (const [label, error] of [
  ["an abort", new DOMException("The operation was aborted", "AbortError")],
  ["a network or CORS failure", new TypeError("Failed to fetch")],
]) {
  for (const stage of ["API validation", "browser delivery"]) {
    test(`propagates ${label} during ${stage} to the form's existing error handler`, async (t) => {
      const failure = () => { throw error; };
      const responses = stage === "API validation"
        ? [failure]
        : [jsonResponse(deliveryInstruction()), failure];
      const fetch = mockSequence(t, responses);

      await assert.rejects(submitContactRequest(input, new AbortController().signal), (caught) => caught === error);
      assert.equal(fetch.mock.callCount(), responses.length);
    });
  }
}

for (const [label, error] of [
  ["an AbortError", new DOMException("The response body was aborted", "AbortError")],
  ["a network TypeError", new TypeError("The response body connection failed")],
]) {
  for (const stage of ["API validation", "browser delivery"]) {
    test(`propagates ${label} while reading the ${stage} body`, async (t) => {
      const brokenResponse = new Response(new ReadableStream({
        start(controller) { controller.error(error); },
      }), { headers: { "Content-Type": "application/json" } });
      const responses = stage === "API validation"
        ? [brokenResponse]
        : [jsonResponse(deliveryInstruction()), brokenResponse];
      const fetch = mockSequence(t, responses);

      await assert.rejects(submitContactRequest(input, new AbortController().signal), caught => caught === error);
      assert.equal(fetch.mock.callCount(), responses.length);
    });
  }
}

for (const stage of ["API validation", "browser delivery"]) {
  test(`preserves cancellation when a ${stage} body read fails after the signal is aborted`, async (t) => {
    const controller = new AbortController();
    const response = jsonResponse({});
    t.mock.method(response, "json", async () => {
      controller.abort();
      throw new SyntaxError("Truncated response after cancellation");
    });
    const responses = stage === "API validation"
      ? [response]
      : [jsonResponse(deliveryInstruction()), response];
    const fetch = mockSequence(t, responses);

    await assert.rejects(submitContactRequest(input, controller.signal), { name: "AbortError" });
    assert.equal(fetch.mock.callCount(), responses.length);
  });
}
