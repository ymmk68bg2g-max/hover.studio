import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const compiled = new Map();
function loadModule(file, imports = {}, globals = {}) {
  if (!compiled.has(file)) compiled.set(file, ts.transpileModule(
    readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    },
  ).outputText);
  const exports = {};
  vm.runInNewContext(compiled.get(file), {
    exports,
    require(name) {
      if (name in imports) return imports[name];
      throw new Error(`Unexpected import: ${name}`);
    },
    Error, TypeError, SyntaxError, DOMException, AbortController, URL, URLSearchParams,
    ...globals,
  }, { filename: file });
  return exports;
}

const services = loadModule("services.ts");
const schema = loadModule("contact-schema.ts", { "./services": services });
const delivery = loadModule("contact-delivery.ts", { "./services": services });
const expectedEvent = ["event", "conversion", {
  send_to: "AW-18530491505/Phc_CPDUmKcdEPG4g4RF", value: 1, currency: "UAH",
}];
const validFields = {
  name: "Example Client", email: "client@example.com", company: "Example Company",
  budgetId: "not-sure", message: "Please help us launch our new service.", website: "",
};
const providerEndpoint = "https://formsubmit.co/ajax/test@example.com";
const preparation = overrides => ({
  ok: false, code: "BROWSER_DELIVERY_REQUIRED",
  delivery: { provider: "formsubmit", endpoint: providerEndpoint, payload: { name: validFields.name, email: validFields.email, message: validFields.message } },
  ...overrides,
});
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const plain = value => JSON.parse(JSON.stringify(value));
function find(tree, predicate) {
  if (Array.isArray(tree)) {
    for (const child of tree) { const result = find(child, predicate); if (result) return result; }
  } else if (tree && typeof tree === "object") {
    if (predicate(tree)) return tree;
    return find(tree.props?.children, predicate);
  }
  return undefined;
}

// The real form, validator, conversion helper and two-stage request client run
// together. Only React/DOM boundaries and fetch are replaced; no request can
// escape this queue or reach Google/FormSubmit.
function createForm({ locale = "ua", serviceId = "chatbots", responses = [], tracking = "ready" } = {}) {
  const calls = [], events = [], timers = new Map();
  let timerId = 0;
  const window = {
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
  };
  if (tracking !== "missing") window.gtag = (...args) => {
    events.push(plain(args));
    if (tracking === "throwing") throw new Error("Analytics unavailable");
  };
  const globals = {
    window,
    fetch: async (...args) => {
      const index = calls.length;
      calls.push(args);
      assert.ok(index < responses.length, "No real network requests or unexpected delivery retries are allowed");
      const next = responses[index];
      return typeof next === "function" ? next(...args) : next;
    },
    FormData: class { constructor(form) { this.values = form.values; } get(name) { return this.values[name] ?? null; } },
    HTMLElement: class {}, requestAnimationFrame(callback) { callback(); return 1; },
  };
  const request = loadModule("contact-request.ts", { "./contact-delivery": delivery }, globals);
  const conversion = loadModule("google-ads-conversion.ts", {}, globals);
  const hooks = [];
  let hookIndex = 0, needsRender = false, pendingEffects = [];
  const jsx = (type, props, key) => ({ type, props, key });
  const { ContactForm } = loadModule("contact-form.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState(initial) {
        const index = hookIndex++;
        if (!(index in hooks)) hooks[index] = typeof initial === "function" ? initial() : initial;
        return [hooks[index], next => {
          hooks[index] = typeof next === "function" ? next(hooks[index]) : next;
          needsRender = true;
        }];
      },
      useRef(current) { const index = hookIndex++; return hooks[index] ??= { current }; },
      useEffect(effect, dependencies) {
        const index = hookIndex++;
        const previous = hooks[index];
        if (!previous || dependencies?.some((value, key) => !Object.is(value, previous.dependencies?.[key]))) {
          pendingEffects.push(() => {
            previous?.cleanup?.();
            hooks[index] = { dependencies, cleanup: effect() };
          });
        }
      },
    },
    "next/link": { default: "link" },
    "@/components/ui/native-select": { NativeSelect: "select", NativeSelectOption: "option" },
    "./client-experience-config": { contactIntegrationStatus: "ready", privacyPublicationStatus: "published" },
    "./contact-settings": { contactEmail: "test@example.com" },
    "./ui-arrow": { UiArrow: "svg-arrow" },
    "./contact-request": request, "./contact-schema": schema, "./services": services,
    "./google-ads-conversion": conversion,
  }, globals);
  function render() {
    let tree, attempts = 0;
    do {
      hookIndex = 0; needsRender = false; pendingEffects = [];
      tree = ContactForm({ locale, initialService: serviceId });
      assert.ok(++attempts < 4, "Form rendering must settle");
    } while (needsRender);
    for (const effect of pendingEffects) effect();
    return tree;
  }
  function captureSubmit(fields = {}) {
    const form = find(render(), node => node.type === "form");
    assert.ok(form, "Only an editable form can submit");
    const event = { preventDefault() {}, currentTarget: { values: { ...validFields, ...fields }, elements: { namedItem() { return null; } } } };
    return () => form.props.onSubmit(event);
  }
  return {
    calls, events, render, captureSubmit,
    submit(fields = {}) { return captureSubmit(fields)(); },
    expireRequest() {
      assert.equal(timers.size, 1, "Delivery must have one bounded request timer");
      for (const callback of Array.from(timers.values())) callback();
    },
    assertSuccess() { assert.equal(render().props.className, "form-success"); },
    assertEditable() { assert.equal(render().type, "form"); },
    reset() { find(render(), node => node.type === "button").props.onClick(); },
  };
}

for (const locale of ["ua", "en"]) {
  test(`${locale}: mount and ordinary rerenders never report a conversion`, () => {
    const form = createForm({ locale });
    for (let index = 0; index < 3; index++) form.render();
    assert.deepEqual(form.events, []);
    assert.equal(form.calls.length, 0);
  });

  for (const status of [200, 202, 299]) test(`${locale}: confirmed HTTP ${status} receipt sends exactly one fixed conversion without PII`, async () => {
    const form = createForm({ locale, responses: [json({ ok: true }, status)] });
    const submit = form.captureSubmit();
    await submit();
    form.assertSuccess();
    assert.deepEqual(form.events, [expectedEvent]);
    assert.equal(form.calls.length, 1);
    const payload = JSON.parse(form.calls[0][1].body);
    assert.equal(payload.locale, locale);
    assert.equal(payload.email, validFields.email, "Tracking must not alter the delivery payload");
    for (let index = 0; index < 3; index++) form.render();
    await submit();
    assert.deepEqual(form.events, [expectedEvent], "A rerender or stale successful handler cannot count again");
    assert.equal(form.calls.length, 1, "A stale successful handler cannot deliver the enquiry again");
  });

  for (const accepted of [true, "true"]) test(`${locale}: preparation is not success; provider ${JSON.stringify(accepted)} acceptance completes one conversion`, async () => {
    let resolveProvider;
    const pendingProvider = new Promise(resolve => { resolveProvider = resolve; });
    const form = createForm({ locale, responses: [json(preparation()), () => pendingProvider] });
    const submit = form.captureSubmit();
    const first = submit();
    const duplicate = submit();
    assert.equal(form.calls.length, 1, "The synchronous ref blocks a duplicate before React rerenders");
    await duplicate;
    await new Promise(setImmediate);
    assert.equal(form.calls.length, 2);
    assert.deepEqual(form.events, [], "API preparation does not confirm receipt");
    assert.equal(find(form.render(), node => node.props?.className === "send-button").props.disabled, true);
    await form.submit();
    assert.equal(form.calls.length, 2, "The pending form must not retry delivery");
    resolveProvider(json({ success: accepted }));
    await first;
    form.assertSuccess();
    assert.deepEqual(form.events, [expectedEvent]);
    assert.equal(String(form.calls[1][0]), providerEndpoint);
    assert.equal(form.calls[1][1].method, "POST");
    await submit();
    assert.equal(form.calls.length, 2);
    assert.deepEqual(form.events, [expectedEvent]);
  });

  test(`${locale}: validation neither delivers nor counts, and correcting fields permits a real attempt`, async () => {
    const form = createForm({ locale, responses: [json({ ok: true })] });
    await form.submit({ email: "invalid", message: "" });
    form.assertEditable();
    assert.equal(form.calls.length, 0);
    assert.deepEqual(form.events, []);
    assert.equal(find(form.render(), node => node.props?.name === "email").props["aria-invalid"], true);
    await form.submit();
    form.assertSuccess();
    assert.deepEqual(form.events, [expectedEvent]);
  });

  const failures = [
    ["false success", () => [json({ ok: false })]],
    ["truthy string success", () => [json({ ok: "true" })]],
    ["missing success", () => [json({ message: "Received" })]],
    ["empty HTTP 204 body", () => [new Response(null, { status: 204 })]],
    ["malformed API JSON", () => [new Response("<html>Unavailable</html>")]],
    ["HTTP redirect claiming success", () => [json({ ok: true }, 302)]],
    ["HTTP 503 claiming success", () => [json({ ok: true }, 503)]],
    ["server validation 422", () => [json({ ok: false, code: "VALIDATION_ERROR", fieldErrors: { email: "invalid" } }, 422)]],
    ["upstream timeout", () => [json({ ok: false, code: "UPSTREAM_TIMEOUT" }, 504)]],
    ["contradictory preparation", () => [json(preparation({ ok: true }))]],
    ["incomplete preparation", () => [json(preparation({ delivery: undefined }))]],
    ["provider false", () => [json(preparation()), json({ success: false })]],
    ["provider string false", () => [json(preparation()), json({ success: "false" })]],
    ["provider activation pending", () => [json(preparation()), json({ success: "false", message: "This form needs activation" })]],
    ["provider HTTP error claiming acceptance", () => [json(preparation()), json({ success: "true" }, 503)]],
    ["provider malformed JSON", () => [json(preparation()), new Response("<html>Unavailable</html>")]],
    ["API network rejection", () => [() => { throw new TypeError("Failed to fetch"); }]],
    ["provider network rejection", () => [json(preparation()), () => { throw new TypeError("Failed to fetch"); }]],
  ];
  for (const [label, failedResponses] of failures) test(`${locale}: ${label} never counts; an explicit retry may succeed once`, async () => {
    const failures = failedResponses();
    const form = createForm({ locale, responses: [...failures, json({ ok: true })] });
    await form.submit();
    form.assertEditable();
    assert.deepEqual(form.events, []);
    assert.equal(form.calls.length, failures.length, "No automatic delivery retry is allowed");
    form.render();
    assert.deepEqual(form.events, []);
    await form.submit();
    form.assertSuccess();
    assert.deepEqual(form.events, [expectedEvent]);
    assert.equal(form.calls.length, failures.length + 1);
  });

  for (const stage of ["API", "provider"]) test(`${locale}: an in-flight ${stage} timeout never counts and releases the submission guard`, async () => {
    const waitForAbort = (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    });
    const failedResponses = stage === "API" ? [waitForAbort] : [json(preparation()), waitForAbort];
    const form = createForm({ locale, responses: [...failedResponses, json({ ok: true })] });
    const pending = form.submit();
    await new Promise(setImmediate);
    assert.deepEqual(form.events, []);
    form.expireRequest();
    await pending;
    form.assertEditable();
    assert.deepEqual(form.events, []);
    assert.equal(form.calls.length, failedResponses.length);
    await form.submit();
    form.assertSuccess();
    assert.deepEqual(form.events, [expectedEvent]);
  });

  for (const tracking of ["missing", "throwing"]) test(`${locale}: ${tracking} analytics cannot change confirmed receipt or repeat delivery`, async () => {
    const form = createForm({ locale, tracking, responses: [json({ ok: true })] });
    const submit = form.captureSubmit();
    await submit();
    form.assertSuccess();
    assert.equal(form.calls.length, 1);
    assert.deepEqual(form.events, tracking === "throwing" ? [expectedEvent] : []);
    await submit();
    assert.equal(form.calls.length, 1);
    assert.deepEqual(form.events, tracking === "throwing" ? [expectedEvent] : []);
  });

  test(`${locale}: NEW ENQUIRY resets the guard without counting until another confirmed submission`, async () => {
    const form = createForm({ locale, responses: [json({ ok: true }), json({ ok: true })] });
    await form.submit();
    form.assertSuccess();
    form.reset();
    form.assertEditable();
    form.render();
    assert.deepEqual(form.events, [expectedEvent], "Reset and rerender are not conversions");
    assert.equal(form.calls.length, 1);
    await form.submit();
    form.assertSuccess();
    assert.deepEqual(form.events, [expectedEvent, expectedEvent]);
    assert.equal(form.calls.length, 2);
  });

  test(`${locale}: all six shared service forms use the same conversion payload`, async () => {
    for (const service of services.getServices(locale)) {
      const form = createForm({ locale, serviceId: service.id, responses: [json({ ok: true })] });
      await form.submit();
      form.assertSuccess();
      assert.deepEqual(form.events, [expectedEvent]);
      assert.equal(JSON.parse(form.calls[0][1].body).serviceId, service.id);
    }
  });
}

test("conversion helper is harmless during server rendering without window", () => {
  const { reportContactConversion } = loadModule("google-ads-conversion.ts");
  assert.doesNotThrow(() => reportContactConversion());
});

test("conversion helper sends only the fixed destination/value/currency and no personal form fields", () => {
  const events = [];
  const { reportContactConversion } = loadModule("google-ads-conversion.ts", {}, {
    window: { gtag: (...args) => events.push(plain(args)) },
  });
  reportContactConversion();
  assert.deepEqual(events, [expectedEvent]);
  assert.deepEqual(Object.keys(events[0][2]).sort(), ["currency", "send_to", "value"]);
});
