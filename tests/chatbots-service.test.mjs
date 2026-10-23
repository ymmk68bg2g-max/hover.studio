import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const modules = new Map();
function loadModule(file, imports = {}) {
  const source = readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name in imports) return imports[name];
      if (modules.has(name)) return modules.get(name);
      throw new Error(`Unexpected import: ${name}`);
    },
  }, { filename: file });
  return exports;
}

const services = loadModule("services.ts");
modules.set("./services", services);
const schema = loadModule("contact-schema.ts");
const delivery = loadModule("contact-delivery.ts");

const oldSlugs = ["landing-pages", "business-websites", "corporate-websites", "digital-experience", "website-care"];
const oldPrices = {
  ua: ["ВІД 35 000 ГРН", "ВІД 55 000 ГРН", "ВІД 80 000 ГРН", "ІНДИВІДУАЛЬНО", "ВІД 8 000 ГРН / МІСЯЦЬ"],
  en: ["FROM $850", "FROM $1,350", "FROM $1,950", "CUSTOM", "FROM $200 / MONTH"],
};
const validPayload = locale => ({
  locale,
  name: "Example",
  email: "example@example.com",
  company: "",
  serviceId: "chatbots",
  budgetId: "not-sure",
  message: "We would like to discuss a Telegram bot.",
});

for (const locale of ["ua", "en"]) {
  test(`${locale}: chatbots follows the five existing services and retains their prices`, () => {
    const records = services.getServices(locale);
    assert.deepEqual(Array.from(records, record => record.slug), [...oldSlugs, "chatbots"]);
    assert.deepEqual(Array.from(records.slice(0, 5), record => record.price), oldPrices[locale]);
    assert.equal(records[5].id, "chatbots");
    assert.equal(records[5].number, "06");
    assert.equal(records[5].name, locale === "ua" ? "Чат-боти та інтеграції" : "Chatbots & Integrations");
    const prices = services.getChatbotsPrices(locale);
    assert.equal(prices.guided, locale === "ua" ? "ВІД 15 000 ГРН" : "FROM $450");
    assert.equal(prices.manager, locale === "ua" ? "ВІД 25 000 ГРН" : "FROM $750");
    assert.equal(records[5].price, prices.guided);
    assert.equal(services.getServiceContactHref(locale, "chatbots"), `/${locale}?service=chatbots#contact`);
    assert.equal(services.getServiceHref(locale, "chatbots"), `/${locale}/services/chatbots`);
  });

  test(`${locale}: shared server validation and delivery template accept the stable service ID`, () => {
    const parsed = schema.validateContactPayload(validPayload(locale));
    assert.equal(parsed.ok, true);
    assert.equal(parsed.data.serviceId, "chatbots");
    const prepared = delivery.formSubmitPayload(parsed.data, `https://example.com/${locale}#contact`);
    const label = locale === "ua" ? "Чат-боти та інтеграції" : "Chatbots & Integrations";
    assert.equal(prepared["Послуга / Service"], label);
    assert.ok(prepared._subject.endsWith(label));
    assert.equal(prepared["Мова / Language"], locale.toUpperCase());
    const invalid = schema.validateContactPayload({ ...validPayload(locale), serviceId: label });
    assert.equal(invalid.ok, false);
    assert.equal(invalid.fieldErrors.serviceId, "invalid");
  });
}

test("service identity rejects unknown values", () => {
  assert.equal(services.isServiceSlug("chatbots"), true);
  for (const value of ["Chatbots & Integrations", "ai-chatbots", "", null, 6]) {
    assert.equal(services.isServiceSlug(value), false);
  }
});

test("mounted form updates only the selected service when a CTA changes preselection", () => {
  let hookIndex = 0;
  let needsRender = false;
  const hooks = [];
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
      useRef(current) {
        const index = hookIndex++;
        return hooks[index] ??= { current };
      },
      useEffect() {},
    },
    "next/link": { default: "link" },
    "@/components/ui/native-select": { NativeSelect: "select", NativeSelectOption: "option" },
    "./client-experience-config": { contactIntegrationStatus: "ready", privacyPublicationStatus: "published" },
    "./contact-settings": { contactEmail: "example@example.com" },
    "./ui-arrow": { UiArrow: "svg-arrow" },
    "./contact-request": { CONTACT_REQUEST_TIMEOUT_MS: 1000, submitContactRequest: () => { throw new Error("Must not send"); } },
    "./contact-schema": schema,
  });
  function render(initialService, preselectionKey) {
    let tree;
    let attempts = 0;
    do {
      hookIndex = 0;
      needsRender = false;
      tree = ContactForm({ locale: "en", initialService, preselectionKey });
      assert.ok(++attempts < 4, "preselection update must settle");
    } while (needsRender);
    return tree;
  }
  function fields(tree, result = new Map()) {
    if (Array.isArray(tree)) tree.forEach(node => fields(node, result));
    else if (tree && typeof tree === "object") {
      if (tree.props?.name) result.set(tree.props.name, tree);
      fields(tree.props?.children, result);
    }
    return result;
  }
  const before = fields(render("landing-pages"));
  assert.equal(before.get("serviceId").props.value, "landing-pages");
  before.get("serviceId").props.onChange({ target: { value: "website-care" } });
  assert.equal(fields(render("landing-pages")).get("serviceId").props.value, "website-care");
  const after = fields(render("chatbots"));
  assert.equal(after.get("serviceId").props.value, "chatbots");
  for (const name of ["name", "email", "company", "message"]) {
    assert.equal(after.get(name).type, before.get(name).type);
    assert.equal(after.get(name).key, before.get(name).key);
    assert.equal(after.get(name).props.value, undefined, `${name} stays independent of service state`);
    assert.equal(after.get(name).props.defaultValue, undefined, `${name} is not reset by preselection`);
  }
  assert.equal(fields(render(undefined)).get("serviceId").props.value, "chatbots", "removing the route hint preserves the current choice");
  const servicePage = fields(render("chatbots", "/en/services/chatbots?"));
  servicePage.get("serviceId").props.onChange({ target: { value: "business-websites" } });
  assert.equal(fields(render("chatbots", "/en/services/chatbots?")).get("serviceId").props.value, "business-websites", "manual selection stays until the navigation context changes");
  const afterCta = fields(render("chatbots", "/en?service=chatbots"));
  assert.equal(afterCta.get("serviceId").props.value, "chatbots", "a service CTA reapplies the same service hint in its new navigation context");
  for (const name of ["name", "email", "company", "message"]) {
    assert.equal(afterCta.get(name).type, before.get(name).type);
    assert.equal(afterCta.get(name).key, before.get(name).key);
    assert.equal(afterCta.get(name).props.value, undefined, `${name} stays independent of navigation context`);
    assert.equal(afterCta.get(name).props.defaultValue, undefined, `${name} is not reset by navigation context`);
  }
  afterCta.get("serviceId").props.onChange({ target: { value: "website-care" } });
  assert.equal(fields(render(undefined, "/en?")).get("serviceId").props.value, "website-care", "a context without a hint preserves the manually selected service");
});
