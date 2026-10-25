import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const compiled = new Map();
function loadModule(file, imports = {}, globals = {}) {
  if (!compiled.has(file)) compiled.set(file, ts.transpileModule(readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText);
  const exports = {};
  vm.runInNewContext(compiled.get(file), {
    exports, require(name) { assert.ok(name in imports, `Unexpected runtime import: ${name}`); return imports[name]; },
    Error, TypeError, SyntaxError, DOMException, AbortController, ...globals,
  }, { filename: file });
  return exports;
}
const services = loadModule("services.ts");
const schema = loadModule("contact-schema.ts", { "./services": services });
const expectedEvent = ["event", "conversion", { send_to: "AW-18530491505/Phc_CPDUmKcdEPG4g4RF", value: 1, currency: "UAH" }];
const validFields = { name: "Example Client", email: "client@example.com", company: "Example Company", budgetId: "not-sure", message: "Please help us launch our new service.", website: "" };
const plain = value => JSON.parse(JSON.stringify(value));
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
function find(tree, predicate) {
  if (Array.isArray(tree)) { for (const child of tree) { const found = find(child, predicate); if (found) return found; } }
  else if (tree && typeof tree === "object") { if (predicate(tree)) return tree; return find(tree.props?.children, predicate); }
}

// Run the actual form, schema, one-stage request helper and Google helper.
// Only React/DOM, the Turnstile component boundary and network are substituted.
function createForm({ locale = "ua", serviceId = "chatbots", responses = [], tracking = "ready", publicKey = "test-public-key" } = {}) {
  const calls = [], events = [], timers = new Map(); let timerId = 0, uuidCount = 0;
  const window = {
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; }, clearTimeout(id) { timers.delete(id); },
  };
  if (tracking !== "missing") window.gtag = (...args) => { events.push(plain(args)); if (tracking === "throwing") throw new Error("Tracker unavailable"); };
  const globals = {
    window, process: { env: { NEXT_PUBLIC_TURNSTILE_SITE_KEY: publicKey } },
    crypto: { randomUUID() { return `00000000-0000-4000-8000-${String(++uuidCount).padStart(12, "0")}`; } },
    fetch: async (...args) => {
      const index = calls.length; calls.push(args);
      assert.equal(args[0], "/api/contact", "The browser may contact only the local form API");
      assert.ok(index < responses.length, "No real requests or automatic retries are permitted");
      const next = responses[index]; return typeof next === "function" ? next(...args) : next;
    },
    FormData: class { constructor(form) { this.values = form.values; } get(name) { return this.values[name] ?? null; } },
    HTMLElement: class {}, requestAnimationFrame(callback) { callback(); return 1; },
  };
  const request = loadModule("contact-request.ts", {}, globals);
  const conversion = loadModule("google-ads-conversion.ts", {}, globals);
  const hooks = []; let hookIndex = 0, needsRender = false, effects = [];
  const jsx = (type, props, key) => ({ type, props, key });
  const changed = (before, after) => !before || after?.some((value, index) => !Object.is(value, before[index]));
  const { ContactForm } = loadModule("contact-form.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState(initial) {
        const index = hookIndex++; if (!(index in hooks)) hooks[index] = typeof initial === "function" ? initial() : initial;
        return [hooks[index], next => { hooks[index] = typeof next === "function" ? next(hooks[index]) : next; needsRender = true; }];
      },
      useRef(current) { const index = hookIndex++; return hooks[index] ??= { current }; },
      useCallback(callback, dependencies) {
        const index = hookIndex++; if (changed(hooks[index]?.dependencies, dependencies)) hooks[index] = { callback, dependencies };
        return hooks[index].callback;
      },
      useEffect(effect, dependencies) {
        const index = hookIndex++, previous = hooks[index];
        if (changed(previous?.dependencies, dependencies)) effects.push(() => { previous?.cleanup?.(); hooks[index] = { dependencies, cleanup: effect() }; });
      },
    },
    "next/link": { default: "link" }, "@/components/ui/native-select": { NativeSelect: "select", NativeSelectOption: "option" },
    "./client-experience-config": { contactIntegrationStatus: "connected", privacyPublicationStatus: "published" },
    "./contact-settings": { contactEmail: "test@example.com" }, "./ui-arrow": { UiArrow: "svg-arrow" },
    "./contact-turnstile": { ContactTurnstile: "turnstile" }, "./contact-request": request,
    "./contact-schema": schema, "./services": services, "./google-ads-conversion": conversion,
  }, globals);
  function render() {
    let tree, attempts = 0;
    do { hookIndex = 0; needsRender = false; effects = []; tree = ContactForm({ locale, initialService: serviceId }); assert.ok(++attempts < 4, "Render must settle"); } while (needsRender);
    for (const effect of effects) effect(); return tree;
  }
  function captureSubmit(fields = {}) {
    const form = find(render(), node => node.type === "form"); assert.ok(form, "Only an editable form can submit");
    const event = { preventDefault() {}, currentTarget: { values: { ...validFields, ...fields }, elements: { namedItem() { return null; } } } };
    return () => form.props.onSubmit(event);
  }
  function widget() { const result = find(render(), node => node.type === "turnstile"); assert.ok(result); return result; }
  return {
    calls, events, render, captureSubmit,
    submit(fields = {}) { return captureSubmit(fields)(); }, solve(token = "test-token") { widget().props.onToken(token); },
    resetKey() { return widget().props.resetKey; },
    expireRequest() { assert.equal(timers.size, 1); for (const callback of [...timers.values()]) callback(); },
    assertSuccess() { assert.equal(render().props.className, "form-success"); }, assertEditable() { assert.equal(render().type, "form"); },
    reset() { find(render(), node => node.type === "button").props.onClick(); },
    submitted(index = 0) { return JSON.parse(calls[index][1].body); }, uuidCount() { return uuidCount; },
  };
}

for (const locale of ["ua", "en"]) {
  test(`${locale}: mount, missing token and expired token never POST or count`, async () => {
    const form = createForm({ locale }); form.render(); form.render();
    await form.submit(); form.solve("solved-then-expired"); form.solve(null); await form.submit();
    assert.equal(form.calls.length, 0); assert.equal(form.uuidCount(), 0); assert.deepEqual(form.events, []);
  });

  test(`${locale}: missing public key disables sending and cannot be bypassed with a token callback`, async () => {
    const form = createForm({ locale, publicKey: null });
    assert.equal(find(form.render(), node => node.props?.className === "send-button").props.disabled, true);
    form.solve(); await form.submit(); assert.equal(form.calls.length, 0); assert.deepEqual(form.events, []);
  });

  test(`${locale}: accepted server receipt counts once despite pending duplicate, rerenders or stale handler`, async () => {
    let accept; const pending = new Promise(resolve => { accept = resolve; });
    const form = createForm({ locale, responses: [() => pending] }); form.solve(); const submit = form.captureSubmit();
    const first = submit(); await submit(); assert.equal(form.calls.length, 1); assert.deepEqual(form.events, []);
    assert.equal(find(form.render(), node => node.props?.className === "send-button").props.disabled, true);
    accept(json({ ok: true }, 202)); await first; form.assertSuccess(); form.render(); await submit();
    assert.equal(form.calls.length, 1); assert.deepEqual(form.events, [expectedEvent]); assert.equal(form.uuidCount(), 1);
    assert.equal(form.submitted().turnstileToken, "test-token"); assert.equal(form.submitted().locale, locale);
  });

  test(`${locale}: client validation neither posts nor counts, and correction can use the unconsumed token`, async () => {
    const form = createForm({ locale, responses: [json({ ok: true }, 202)] }); form.solve();
    await form.submit({ email: "invalid", message: "" }); assert.equal(form.calls.length, 0); assert.deepEqual(form.events, []);
    assert.equal(find(form.render(), node => node.props?.name === "email").props["aria-invalid"], true);
    await form.submit(); form.assertSuccess(); assert.deepEqual(form.events, [expectedEvent]);
  });

  const failures = [
    ["false acknowledgement", () => json({ ok: false })], ["truthy acknowledgement", () => json({ ok: "true" })],
    ["missing acknowledgement", () => json({ message: "received" })], ["empty response", () => new Response(null, { status: 204 })],
    ["malformed JSON", () => new Response("<html>Server error</html>")],
    ["failed challenge", () => json({ ok: false, code: "BOT_VERIFICATION_FAILED" }, 403)],
    ["rate limit", () => json({ ok: false, code: "RATE_LIMITED" }, 429)], ["non-JSON rate limit", () => new Response("Too Many Requests", { status: 429 })],
    ["verification unavailable", () => json({ ok: false, code: "VERIFICATION_UNAVAILABLE" }, 503)],
    ["mail rejected", () => json({ ok: false, code: "UPSTREAM_REJECTED" }, 503)],
    ["mail timeout", () => json({ ok: false, code: "UPSTREAM_TIMEOUT" }, 503)],
    ["HTTP error claiming success", () => json({ ok: true }, 503)],
    ["server validation", () => json({ ok: false, code: "VALIDATION_ERROR", fieldErrors: { email: "invalid" } }, 422)],
    ["network failure", () => { throw new TypeError("Network unavailable"); }],
  ];
  for (const [label, failed] of failures) test(`${locale}: ${label} cannot count and requires a fresh token before retry`, async () => {
    const form = createForm({ locale, responses: [failed, json({ ok: true }, 202)] }); form.solve("first-token");
    const resetKey = form.resetKey(); await form.submit(); form.assertEditable();
    assert.equal(form.calls.length, 1); assert.deepEqual(form.events, []); assert.equal(form.resetKey(), resetKey + 1);
    await form.submit(); assert.equal(form.calls.length, 1, "A consumed token cannot be reused"); assert.deepEqual(form.events, []);
    form.solve("fresh-token"); await form.submit(); form.assertSuccess(); assert.equal(form.calls.length, 2);
    assert.equal(form.submitted(1).turnstileToken, "fresh-token"); assert.deepEqual(form.events, [expectedEvent]);
  });

  test(`${locale}: an in-flight timeout never counts and an explicit retry needs another token`, async () => {
    const form = createForm({ locale, responses: [(_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    }), json({ ok: true }, 202)] });
    form.solve(); const pending = form.submit(); form.expireRequest(); await pending;
    form.assertEditable(); assert.deepEqual(form.events, []); await form.submit(); assert.equal(form.calls.length, 1);
    form.solve("new-token"); await form.submit(); form.assertSuccess(); assert.deepEqual(form.events, [expectedEvent]);
  });

  test(`${locale}: retry UUID follows canonical enquiry data and NEW ENQUIRY creates a new identity`, async () => {
    const networkError = () => { throw new TypeError("Network unavailable"); };
    const form = createForm({ locale, responses: [networkError, networkError, json({ ok: true }, 202), json({ ok: true }, 202)] });
    form.solve("token-1"); await form.submit({ name: " Example Client " });
    form.solve("token-2"); await form.submit();
    assert.equal(form.submitted(0).submissionId, form.submitted(1).submissionId, "Whitespace normalization and a new token must not change retry identity");
    assert.equal(form.submitted(0).name, "Example Client");
    form.solve("token-3"); await form.submit({ message: "A changed enquiry message." }); form.assertSuccess();
    assert.notEqual(form.submitted(2).submissionId, form.submitted(1).submissionId, "Changed canonical data requires a new key");
    form.reset(); form.assertEditable(); await form.submit({ message: "A changed enquiry message." }); assert.equal(form.calls.length, 3);
    form.solve("token-4"); await form.submit({ message: "A changed enquiry message." }); form.assertSuccess();
    assert.notEqual(form.submitted(3).submissionId, form.submitted(2).submissionId, "A deliberately new enquiry must not reuse the previous key");
    assert.equal(form.uuidCount(), 3); assert.deepEqual(form.events, [expectedEvent, expectedEvent]);
  });

  test(`${locale}: all six service forms use the same protected request and fixed conversion payload`, async () => {
    for (const service of services.getServices(locale)) {
      const form = createForm({ locale, serviceId: service.id, responses: [json({ ok: true }, 202)] }); form.solve(); await form.submit();
      form.assertSuccess(); assert.equal(form.submitted().serviceId, service.id); assert.equal(form.calls.length, 1); assert.deepEqual(form.events, [expectedEvent]);
    }
  });

  for (const tracking of ["missing", "throwing"]) test(`${locale}: ${tracking} Google tracker cannot change receipt or trigger another submission`, async () => {
    const form = createForm({ locale, tracking, responses: [json({ ok: true }, 202)] }); form.solve(); const submit = form.captureSubmit();
    await submit(); form.assertSuccess(); await submit(); assert.equal(form.calls.length, 1);
    assert.deepEqual(form.events, tracking === "throwing" ? [expectedEvent] : []);
  });
}

test("conversion helper is safe during SSR and sends only fixed non-personal event fields", () => {
  assert.doesNotThrow(() => loadModule("google-ads-conversion.ts").reportContactConversion());
  const events = []; loadModule("google-ads-conversion.ts", {}, { window: { gtag: (...args) => events.push(plain(args)) } }).reportContactConversion();
  assert.deepEqual(events, [expectedEvent]); assert.deepEqual(Object.keys(events[0][2]).sort(), ["currency", "send_to", "value"]);
});
