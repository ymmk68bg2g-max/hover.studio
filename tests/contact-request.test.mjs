import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("../app/contact-request.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const payload = {
  locale: "en", name: "Alex Example", email: "alex@example.com", company: "Example",
  serviceId: "chatbots", budgetId: "not-sure", message: "Please help with our Telegram bot.", website: "",
  turnstileToken: "test-turnstile-token", submissionId: "4c7c4dbc-fd90-4d71-9664-31b269055ff6",
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const plain = value => JSON.parse(JSON.stringify(value));
function harness(response) {
  const calls = [], exports = {};
  vm.runInNewContext(compiled, {
    exports, SyntaxError, DOMException,
    require(name) { throw new Error(`Unexpected runtime import: ${name}`); },
    fetch: async (...args) => {
      calls.push(args); assert.equal(calls.length, 1, "Only one local API request is permitted; no external handoff or retry");
      assert.equal(args[0], "/api/contact"); return typeof response === "function" ? response(...args) : response;
    },
  }, { filename: "contact-request.ts" });
  return { ...exports, calls };
}

test("request sends the complete UTF-8 submission once to the local API and preserves its signal", async () => {
  const app = harness(json({ ok: true }, 202)); const controller = new AbortController();
  const unicode = { ...payload, name: "Ім’я О’Браєн", message: "Привіт! ☀️ <plain text>" };
  assert.deepEqual(plain(await app.submitContactRequest(unicode, controller.signal)), { status: 202, result: { ok: true } });
  const [, options] = app.calls[0]; assert.equal(options.method, "POST");
  assert.equal(new Headers(options.headers).get("content-type"), "application/json");
  assert.deepEqual(JSON.parse(options.body), unicode); assert.equal(options.signal, controller.signal);
  assert.equal(app.CONTACT_REQUEST_TIMEOUT_MS, 45_000);
});

for (const [status, body] of [
  [403, { ok: false, code: "BOT_VERIFICATION_FAILED" }], [429, { ok: false, code: "RATE_LIMITED" }],
  [422, { ok: false, code: "VALIDATION_ERROR", fieldErrors: { email: "invalid" } }],
  [503, { ok: false, code: "VERIFICATION_UNAVAILABLE" }], [503, { ok: false, code: "UPSTREAM_REJECTED" }],
  [503, { ok: true }],
]) test(`API HTTP ${status} response is preserved for the form to interpret`, async () => {
  const app = harness(json(body, status));
  assert.deepEqual(plain(await app.submitContactRequest(payload, new AbortController().signal)), { status, result: body });
  assert.equal(app.calls.length, 1);
});

test("a legacy browser-delivery instruction cannot cause an external request", async () => {
  const instruction = { ok: false, code: "BROWSER_DELIVERY_REQUIRED", delivery: { endpoint: "https://untrusted.example/send", payload: {} } };
  const app = harness(json(instruction));
  const result = await app.submitContactRequest(payload, new AbortController().signal);
  assert.equal(result.status, 200); assert.equal(result.result.ok, false); assert.equal(app.calls.length, 1);
});

for (const [label, response, status] of [
  ["malformed JSON", () => new Response("<html>Error</html>"), 200],
  ["non-JSON rate limit", () => new Response("Too Many Requests", { status: 429 }), 429],
  ["empty body", () => new Response(null, { status: 204 }), 204],
  ["null", () => json(null), 200], ["array", () => json([{ ok: true }]), 200], ["primitive", () => json("ok"), 200],
]) test(`${label} returns a null result while retaining HTTP status`, async () => {
  const app = harness(response);
  assert.deepEqual(plain(await app.submitContactRequest(payload, new AbortController().signal)), { status, result: null });
  assert.equal(app.calls.length, 1);
});

test("network and body-download failures propagate without an automatic retry", async () => {
  for (const response of [() => { throw new TypeError("Network unavailable"); }, () => ({ status: 200, json: async () => { throw new TypeError("Connection interrupted"); } })]) {
    const app = harness(response);
    await assert.rejects(app.submitContactRequest(payload, new AbortController().signal), TypeError);
    assert.equal(app.calls.length, 1);
  }
});

test("an abort is preserved during fetch and an interrupted response body", async () => {
  const fetchAbort = harness((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  const controller = new AbortController(); const pending = fetchAbort.submitContactRequest(payload, controller.signal); controller.abort();
  await assert.rejects(pending, error => error.name === "AbortError"); assert.equal(fetchAbort.calls.length, 1);
  const bodyController = new AbortController();
  const bodyAbort = harness(() => ({ status: 200, json: async () => { bodyController.abort(); throw new SyntaxError("Interrupted body"); } }));
  await assert.rejects(bodyAbort.submitContactRequest(payload, bodyController.signal), error => error.name === "AbortError");
  assert.equal(bodyAbort.calls.length, 1);
});
