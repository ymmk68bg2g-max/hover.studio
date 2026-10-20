import { isServiceSlug, type ServiceSlug } from "./services";

export const budgetIds = ["tier-1", "tier-2", "tier-3", "tier-4", "not-sure"] as const;

export type BudgetId = (typeof budgetIds)[number];
export type ContactServiceId = ServiceSlug | "not-sure";
export type ContactField = "name" | "email" | "company" | "serviceId" | "budgetId" | "message";

export type ContactPayload = {
  locale: "en" | "ua";
  name: string;
  email: string;
  company: string;
  serviceId: ContactServiceId;
  budgetId: BudgetId;
  message: string;
};

export type ContactValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; fieldErrors: Partial<Record<ContactField, string>> };

const limits = {
  name: 120,
  email: 254,
  company: 160,
  message: 4000,
} as const;

export function isBudgetId(value: string): value is BudgetId {
  return (budgetIds as readonly string[]).includes(value);
}

export function isContactServiceId(value: string): value is ContactServiceId {
  return value === "not-sure" || isServiceSlug(value);
}

function stringValue(input: Record<string, unknown>, key: string) {
  return typeof input[key] === "string" ? input[key].trim() : "";
}

export function validateContactPayload(input: unknown): ContactValidationResult {
  const source = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
  const locale = stringValue(source, "locale");
  const name = stringValue(source, "name");
  const email = stringValue(source, "email");
  const company = stringValue(source, "company");
  const requestedServiceId = stringValue(source, "serviceId");
  const requestedBudgetId = stringValue(source, "budgetId");
  const serviceId = isContactServiceId(requestedServiceId) ? requestedServiceId : undefined;
  const budgetId = isBudgetId(requestedBudgetId) ? requestedBudgetId : undefined;
  const message = stringValue(source, "message");
  const fieldErrors: Partial<Record<ContactField, string>> = {};

  if (!name || name.length > limits.name) fieldErrors.name = "invalid";
  if (!email || email.length > limits.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "invalid";
  }
  if (company.length > limits.company) fieldErrors.company = "invalid";
  if (!serviceId) fieldErrors.serviceId = "invalid";
  if (!budgetId) fieldErrors.budgetId = "invalid";
  if (!message || message.length > limits.message) fieldErrors.message = "invalid";

  if (Object.keys(fieldErrors).length > 0 || (locale !== "en" && locale !== "ua") || !serviceId || !budgetId) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      locale,
      name,
      email,
      company,
      serviceId,
      budgetId,
      message,
    },
  };
}
