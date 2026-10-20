import type { ContactField } from "./contact-schema";
import { isFormSubmitAccepted, isFormSubmitEndpoint, needsFormSubmitActivation } from "./contact-delivery";

export const CONTACT_REQUEST_TIMEOUT_MS = 45_000;

type ContactResult = {
  ok?: unknown;
  code?: unknown;
  fieldErrors?: Partial<Record<ContactField, string>>;
  delivery?: unknown;
};

function preparedDelivery(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const instruction = value as Record<string, unknown>;
  if (instruction.provider !== "formsubmit" || typeof instruction.endpoint !== "string") return null;
  try {
    if (!isFormSubmitEndpoint(new URL(instruction.endpoint))) return null;
  } catch {
    return null;
  }
  const payload = instruction.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)
    || !Object.values(payload).every((value) => typeof value === "string")) return null;
  return { endpoint: instruction.endpoint, payload: payload as Record<string, string> };
}

async function responseJson(response: Response, signal: AbortSignal) {
  try {
    return await response.json();
  } catch (error) {
    // A timeout or interrupted download is different from malformed JSON.
    if (signal.aborted) throw new DOMException("The operation was aborted", "AbortError");
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

export async function submitContactRequest(
  payload: unknown,
  signal: AbortSignal,
): Promise<{ status: number; result: ContactResult | null }> {
  const prepared = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  const result = await responseJson(prepared, signal) as ContactResult | null;
  if (!prepared.ok || result?.code !== "BROWSER_DELIVERY_REQUIRED") {
    return { status: prepared.status, result };
  }

  const delivery = preparedDelivery(result.delivery);
  if (!delivery || result.ok === true) {
    return { status: 503, result: { ok: false, code: "UPSTREAM_REJECTED" } };
  }

  // A form-encoded POST avoids the JSON CORS preflight on mobile connections.
  // Keep one delivery attempt and wait for the provider's explicit confirmation.
  const upstream = await fetch(delivery.endpoint, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    headers: { Accept: "application/json" },
    body: new URLSearchParams(delivery.payload),
    signal,
  });
  const body = await responseJson(upstream, signal) as { success?: unknown; message?: unknown } | null;
  if (needsFormSubmitActivation(body)) {
    return { status: 503, result: { ok: false, code: "ACTIVATION_REQUIRED" } };
  }
  if (!upstream.ok || !isFormSubmitAccepted(body)) {
    return { status: 503, result: { ok: false, code: "UPSTREAM_REJECTED" } };
  }
  return { status: 202, result: { ok: true } };
}
