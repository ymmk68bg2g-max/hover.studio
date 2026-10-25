import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const compiled = new Map();
function load(file, imports, globals) {
  if (!compiled.has(file)) compiled.set(file, ts.transpileModule(
    readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText);
  const exports = {};
  vm.runInNewContext(compiled.get(file), {
    exports, require(name) { assert.ok(name in imports, `Unexpected import: ${name}`); return imports[name]; },
    URL, Response, TextDecoder, Error, SyntaxError, AbortController, ...globals,
  }, { filename: file });
  return exports;
}
const services = load("services.ts", {}, {});
const schema = load("contact-schema.ts", { "./services": services }, {});
const origin = "https://byhover.studio";
const submissionId = "4c7c4dbc-fd90-4d71-9664-31b269055ff6";
const siteverify = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const resend = "https://api.resend.com/emails";
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const acceptedToken = overrides => json({ success: true, hostname: "byhover.studio", action: "contact", ...overrides });
function payload(overrides = {}) {
  return {
    locale: "en", name: "Alex Example", email: "alex@example.com", company: "Example Company",
    serviceId: "landing-pages", budgetId: "tier-1", message: "Please help us launch our new service.",
    website: "", turnstileToken: "test-challenge-token", submissionId, ...overrides,
  };
}
function request(body = payload(), headers = {}, url = `${origin}/api/contact`) {
  return new Request(url, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: new URL(url).origin, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
function harness(responses = [], env = {}) {
  const calls = [], timers = new Map();
  let timer = 0;
  const globals = {
    process: { env: { TURNSTILE_SECRET_KEY: "test-only-secret", RESEND_API_KEY: "test-only-mail-key", ...env } },
    setTimeout(callback, milliseconds) { timers.set(++timer, { callback, milliseconds }); return timer; },
    clearTimeout(id) { timers.delete(id); },
    fetch: async (...args) => {
      const index = calls.length; calls.push(args);
      assert.ok(index < responses.length, "Real requests, unexpected endpoints and automatic retries are forbidden");
      const next = responses[index]; return typeof next === "function" ? next(...args) : next;
    },
  };
  const server = load("contact-server.ts", { "./services": services }, globals);
  const route = load("api/contact/route.ts", { "../../contact-schema": schema, "../../contact-server": server }, globals);
  return { ...route, calls, timers };
}
async function assertResponse(response, status, expected) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type"), /application\/json/);
  const body = await response.json(); assert.deepEqual(body, expected);
  assert.equal("delivery" in body, false, "Provider instructions must never be exposed to the browser");
  assert.doesNotMatch(JSON.stringify(body), /test-only-secret|test-only-mail-key|api\.resend|formsubmit|test-challenge-token/);
}

test("cancels an oversized streamed upload before reading all chunks or contacting a provider", async () => {
  const app = harness(); let chunksRead = 0, cancelled = false;
  const stream = new ReadableStream({
    pull(controller) { chunksRead++; controller.enqueue(new Uint8Array(8000).fill(32)); if (chunksRead === 8) controller.close(); },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const streamed = new Request(`${origin}/api/contact`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: stream, duplex: "half",
  });
  await assertResponse(await app.POST(streamed), 413, { ok: false, code: "PAYLOAD_TOO_LARGE" });
  assert.equal(cancelled, true); assert.ok(chunksRead < 8); assert.equal(app.calls.length, 0);
});

test("accepts a 20,000-byte upload with split UTF-8 characters and sends the normalized plain text", async () => {
  const app = harness([acceptedToken(), json({ id: "mail-id" })]);
  const fields = payload({ locale: "ua", name: "Ім’я О’Браєн", message: "Український текст з апострофом ’ та емодзі ☀️. ".repeat(70) });
  const encoder = new TextEncoder(); const serialized = JSON.stringify(fields);
  const bytes = encoder.encode(serialized + " ".repeat(20_000 - encoder.encode(serialized).byteLength)); let offset = 0;
  const stream = new ReadableStream({ pull(controller) {
    if (offset === bytes.length) return controller.close();
    const end = Math.min(offset + 17, bytes.length); controller.enqueue(bytes.slice(offset, end)); offset = end;
  } }, { highWaterMark: 0 });
  await assertResponse(await app.POST(new Request(`${origin}/api/contact`, {
    method: "POST", headers: { Origin: origin, "Content-Type": "Application/JSON; charset=utf-8" }, body: stream, duplex: "half",
  })), 202, { ok: true });
  assert.equal(app.calls.length, 2); const email = JSON.parse(app.calls[1][1].body);
  assert.ok(email.text.includes(fields.name)); assert.ok(email.text.includes(fields.message.trim()));
});

for (const [label, fields, headers, status, body] of [
  ["cross-origin", payload(), { Origin: "https://other.example" }, 403, { ok: false, code: "FORBIDDEN" }],
  ["null origin", payload(), { Origin: "null" }, 403, { ok: false, code: "FORBIDDEN" }],
  ["wrong content type", payload(), { "Content-Type": "text/plain" }, 415, { ok: false, code: "UNSUPPORTED_MEDIA_TYPE" }],
  ["lookalike JSON type", payload(), { "Content-Type": "application/json-evil" }, 415, { ok: false, code: "UNSUPPORTED_MEDIA_TYPE" }],
  ["malformed JSON", "{", {}, 400, { ok: false, code: "INVALID_JSON" }],
  ["filled honeypot", payload({ website: "spam" }), {}, 422, { ok: false, code: "VALIDATION_ERROR" }],
  ["non-string honeypot", payload({ website: {} }), {}, 422, { ok: false, code: "VALIDATION_ERROR" }],
  ["invalid email", payload({ email: "bad" }), {}, 422, { ok: false, code: "VALIDATION_ERROR", fieldErrors: { email: "invalid" } }],
  ["missing submission UUID", payload({ submissionId: undefined }), {}, 400, { ok: false, code: "INVALID_SUBMISSION_ID" }],
  ["malformed submission UUID", payload({ submissionId: "not-a-uuid" }), {}, 400, { ok: false, code: "INVALID_SUBMISSION_ID" }],
  ["missing token", payload({ turnstileToken: undefined }), {}, 403, { ok: false, code: "BOT_VERIFICATION_FAILED" }],
  ["empty token", payload({ turnstileToken: "  " }), {}, 403, { ok: false, code: "BOT_VERIFICATION_FAILED" }],
  ["overlong token", payload({ turnstileToken: "a".repeat(2049) }), {}, 403, { ok: false, code: "BOT_VERIFICATION_FAILED" }],
  ["non-string token", payload({ turnstileToken: {} }), {}, 403, { ok: false, code: "BOT_VERIFICATION_FAILED" }],
]) test(`${label} is rejected before any provider request`, async () => {
  const app = harness(); await assertResponse(await app.POST(request(fields, headers)), status, body); assert.equal(app.calls.length, 0);
});

test("missing Origin and missing request body never reach a provider", async () => {
  const app = harness();
  await assertResponse(await app.POST(new Request(`${origin}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) })), 403, { ok: false, code: "FORBIDDEN" });
  await assertResponse(await app.POST(new Request(`${origin}/api/contact`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" } })), 400, { ok: false, code: "INVALID_JSON" });
  assert.equal(app.calls.length, 0);
});

for (const key of ["TURNSTILE_SECRET_KEY", "RESEND_API_KEY"]) for (const value of [undefined, "", "  "]) {
  test(`missing/empty ${key} fails closed without using legacy delivery`, async () => {
    const app = harness([], { [key]: value, HOVER_CONTACT_FORM_ENDPOINT: "https://formsubmit.co/ajax/legacy", HOVER_CONTACT_FORM_TOKEN: "legacy-key" });
    await assertResponse(await app.POST(request()), 503, { ok: false, code: "NOT_CONFIGURED" }); assert.equal(app.calls.length, 0);
  });
}

for (const [label, result] of [
  ["failed", { success: false }], ["truthy", { success: "true" }],
  ["wrong action", { action: "login" }], ["missing action", { action: undefined }],
  ["foreign hostname", { hostname: "evil.example" }], ["lookalike hostname", { hostname: "byhover.studio.evil.example" }],
  ["localhost", { hostname: "localhost" }], ["preview hostname", { hostname: "hover-studio-preview.vercel.app" }],
  ["expired or replayed", { success: false, "error-codes": ["timeout-or-duplicate"] }],
]) test(`a ${label} verification cannot trigger mail delivery`, async () => {
  const app = harness([acceptedToken(result)]);
  await assertResponse(await app.POST(request()), 403, { ok: false, code: "BOT_VERIFICATION_FAILED" });
  assert.equal(app.calls.length, 1); assert.equal(app.calls[0][0], siteverify); assert.equal(app.timers.size, 0);
});

for (const [label, response] of [
  ["HTTP error", () => json({ success: true, hostname: "byhover.studio", action: "contact" }, 503)],
  ["invalid JSON", () => new Response("<html>Unavailable</html>")],
  ["null body", () => json(null)], ["array body", () => json([])],
  ["network error", () => { throw new TypeError("No network"); }],
]) test(`verification ${label} fails closed and exposes no provider detail`, async () => {
  const app = harness([response]);
  await assertResponse(await app.POST(request()), 503, { ok: false, code: "VERIFICATION_UNAVAILABLE" });
  assert.equal(app.calls.length, 1); assert.equal(app.timers.size, 0);
});

for (const locale of ["ua", "en"]) test(`${locale} delivers only after verification, with fixed addresses and no browser handoff`, async () => {
  const app = harness([acceptedToken({ hostname: "www.byhover.studio" }), json({ id: "resend-mail-id" })]);
  await assertResponse(await app.POST(request(payload({ locale, from: "attacker@example.com", to: "victim@example.com" }))), 202, { ok: true });
  assert.deepEqual(app.calls.map(([url]) => url), [siteverify, resend]);
  const [verify, mail] = app.calls.map(([, options]) => options);
  assert.deepEqual(JSON.parse(verify.body), { secret: "test-only-secret", response: "test-challenge-token" });
  assert.equal(new Headers(mail.headers).get("authorization"), "Bearer test-only-mail-key");
  assert.equal(new Headers(mail.headers).get("idempotency-key"), `contact/${submissionId}`);
  const email = JSON.parse(mail.body);
  assert.equal(email.from, "HOVER.STUDIO <notifications@forms.byhover.studio>");
  assert.deepEqual(email.to, ["byhover.studio@gmail.com"]); assert.equal(email.reply_to, payload().email);
  assert.equal("html" in email, false); assert.equal("turnstileToken" in email, false);
  assert.doesNotMatch(mail.body, /test-challenge-token|test-only-secret/);
  for (const options of [verify, mail]) { assert.equal(options.cache, "no-store"); assert.equal(options.redirect, "error"); assert.equal(options.signal.aborted, false); }
  assert.equal(app.timers.size, 0);
});

for (const locale of ["ua", "en"]) test(`${locale}: all six service IDs reach the actual protected server mail path`, async () => {
  for (const service of services.getServices(locale)) {
    const app = harness([acceptedToken(), json({ id: "accepted-service-mail" })]);
    await assertResponse(await app.POST(request(payload({ locale, serviceId: service.id }))), 202, { ok: true });
    assert.deepEqual(app.calls.map(([url]) => url), [siteverify, resend]);
    const email = JSON.parse(app.calls[1][1].body);
    assert.ok(email.subject.endsWith(service.formLabel)); assert.ok(email.text.includes(`Послуга / Service: ${service.formLabel}`));
  }
});

test("GET returns a no-store method error without fetching", async () => {
  const app = harness(); await assertResponse(app.GET(), 405, { ok: false, code: "METHOD_NOT_ALLOWED" }); assert.equal(app.calls.length, 0);
});

test("route holds success until Resend acknowledges the verified enquiry", async () => {
  let resolveMail; const pendingMail = new Promise(resolve => { resolveMail = resolve; });
  const app = harness([acceptedToken(), () => pendingMail]); let settled = false;
  const response = app.POST(request()).then(result => { settled = true; return result; });
  await new Promise(setImmediate); assert.equal(app.calls.length, 2); assert.equal(settled, false);
  resolveMail(json({ id: "accepted-id" })); await assertResponse(await response, 202, { ok: true });
});

test("provider diagnostics and credentials stay inside the server boundary", async () => {
  const app = harness([acceptedToken(), json({ error: "private provider diagnostic" }, 401)]);
  await assertResponse(await app.POST(request()), 503, { ok: false, code: "UPSTREAM_REJECTED" }); assert.equal(app.calls.length, 2);
});
