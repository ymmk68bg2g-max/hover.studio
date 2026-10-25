import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const compiled = new Map();
function load(file, imports, globals) {
  if (!compiled.has(file)) compiled.set(file, ts.transpileModule(readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText);
  const exports = {};
  vm.runInNewContext(compiled.get(file), {
    exports, require(name) { assert.ok(name in imports, `Unexpected import: ${name}`); return imports[name]; },
    Error, SyntaxError, AbortController, ...globals,
  }, { filename: file });
  return exports;
}
const services = load("services.ts", {}, {});
const id = "4c7c4dbc-fd90-4d71-9664-31b269055ff6";
const config = { turnstileSecret: "unit-test-cf-secret", resendApiKey: "unit-test-resend-key" };
const data = { locale: "ua", name: "Ім’я О’Браєн", email: "client@example.com", company: "", serviceId: "chatbots", budgetId: "not-sure", message: "Привіт! <script>alert('plain text')</script>" };
const plain = value => JSON.parse(JSON.stringify(value));
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
function harness(responses = [], env = {}) {
  const calls = [], timers = new Map(); let timer = 0;
  const server = load("contact-server.ts", { "./services": services }, {
    process: { env },
    setTimeout(callback, milliseconds) { timers.set(++timer, { callback, milliseconds }); return timer; },
    clearTimeout(id) { timers.delete(id); },
    fetch: async (...args) => {
      const index = calls.length; calls.push(args);
      assert.ok(index < responses.length, "No real requests or automatic retries are allowed");
      const next = responses[index]; return typeof next === "function" ? next(...args) : next;
    },
  });
  return { ...server, calls, timers };
}

test("configuration reads only the two private credentials and trims them", () => {
  assert.equal(harness().contactServerConfig(), null);
  assert.equal(harness([], { TURNSTILE_SECRET_KEY: "secret" }).contactServerConfig(), null);
  assert.equal(harness([], { RESEND_API_KEY: "key" }).contactServerConfig(), null);
  assert.equal(harness([], { TURNSTILE_SECRET_KEY: " ", RESEND_API_KEY: "key" }).contactServerConfig(), null);
  assert.deepEqual(plain(harness([], { TURNSTILE_SECRET_KEY: " secret ", RESEND_API_KEY: " key " }).contactServerConfig()), { turnstileSecret: "secret", resendApiKey: "key" });
});

test("UUID and token envelope validation limits untrusted provider inputs", () => {
  const app = harness(); assert.equal(app.contactSubmissionId(id.toUpperCase()), id);
  for (const value of [undefined, null, {}, "", " " + id, id + "\n", "00000000-0000-0000-0000-000000000000", "x".repeat(1000)]) assert.equal(app.contactSubmissionId(value), null);
  assert.equal(app.contactTurnstileToken(" token "), "token"); assert.equal(app.contactTurnstileToken("a".repeat(2048)).length, 2048);
  for (const value of [undefined, null, {}, [], true, "", " \n ", "a".repeat(2049)]) assert.equal(app.contactTurnstileToken(value), null);
  assert.equal(app.calls.length, 0);
});

test("a mail retry has the same body and idempotency key without tokens or timestamps", async () => {
  const app = harness([json({ id: "mail-id" }), json({ id: "mail-id" })]);
  assert.deepEqual(plain(await app.sendContactEmail(data, id, config)), { ok: true });
  assert.deepEqual(plain(await app.sendContactEmail(data, id, config)), { ok: true });
  assert.equal(app.calls[0][1].body, app.calls[1][1].body);
  for (const [url, options] of app.calls) {
    assert.equal(url, "https://api.resend.com/emails"); assert.equal(options.method, "POST");
    assert.equal(new Headers(options.headers).get("idempotency-key"), `contact/${id}`);
    const body = JSON.parse(options.body); assert.ok(body.text.includes(data.message)); assert.ok(body.text.includes("Чат-боти"));
    assert.equal(body.reply_to, data.email); assert.equal(body.html, undefined); assert.doesNotMatch(options.body, /unit-test-cf-secret|unit-test-resend-key/);
  }
  assert.equal(app.timers.size, 0);
});

for (const [label, response] of [
  ["missing id", () => json({ ok: true })], ["empty id", () => json({ id: "  " })], ["non-string id", () => json({ id: 123 })],
  ["null body", () => json(null)], ["array body", () => json([{ id: "mail-id" }])],
  ["malformed JSON", () => new Response("not JSON")],
  ["HTTP rejection claiming success", () => json({ id: "mail-id" }, 500)],
  ["idempotency conflict", () => json({ name: "invalid_idempotent_request", message: "private details" }, 409)],
  ["redirect", () => json({ id: "mail-id" }, 302)], ["empty 204", () => new Response(null, { status: 204 })],
]) test(`Resend ${label} is never reported as receipt and is not retried`, async () => {
  const app = harness([response]);
  assert.deepEqual(plain(await app.sendContactEmail(data, id, config)), { ok: false, status: 503, code: "UPSTREAM_REJECTED" });
  assert.equal(app.calls.length, 1); assert.equal(app.timers.size, 0);
});

test("network failures during mail fetch or body download remain non-successful", async () => {
  for (const response of [() => { throw new TypeError("private network error"); }, () => ({ ok: true, json: async () => { throw new TypeError("private download error"); } })]) {
    const app = harness([response]);
    assert.deepEqual(plain(await app.sendContactEmail(data, id, config)), { ok: false, status: 503, code: "UPSTREAM_UNAVAILABLE" });
    assert.equal(app.calls.length, 1); assert.equal(app.timers.size, 0);
  }
});

for (const [stage, timeout, expected] of [
  ["verification", 8000, { ok: false, status: 503, code: "VERIFICATION_UNAVAILABLE" }],
  ["delivery", 12000, { ok: false, status: 503, code: "UPSTREAM_TIMEOUT" }],
]) test(`${stage} timeout aborts the actual upstream request and clears its timer`, async () => {
  const app = harness([(_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  })]);
  const pending = stage === "verification" ? app.verifyContactToken("test-token", config) : app.sendContactEmail(data, id, config);
  assert.equal(app.timers.size, 1); const entry = [...app.timers.values()][0]; assert.equal(entry.milliseconds, timeout); entry.callback();
  assert.deepEqual(plain(await pending), expected);
  assert.equal(app.calls[0][1].signal.aborted, true); assert.equal(app.timers.size, 0); assert.equal(app.calls.length, 1);
});

test("verification sends only the secret and token, with no enquiry fields or forged browser IP", async () => {
  const app = harness([json({ success: true, action: "contact", hostname: "byhover.studio" })]);
  assert.deepEqual(plain(await app.verifyContactToken("test-token", config)), { ok: true });
  const [url, options] = app.calls[0]; assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  assert.deepEqual(JSON.parse(options.body), { secret: "unit-test-cf-secret", response: "test-token" });
  assert.doesNotMatch(options.body, /client@example|reply_to|remoteip/); assert.equal(app.timers.size, 0);
});
