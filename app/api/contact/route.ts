import { validateContactPayload } from "../../contact-schema";
import { formSubmitPayload, isFormSubmitEndpoint } from "../../contact-delivery";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
} as const;

function response(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

async function limitedRequestText(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return { tooLarge: false, text: "" } as const;

  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 20_000) {
        await reader.cancel("Contact request exceeds the byte limit").catch(() => undefined);
        return { tooLarge: true } as const;
      }
      text += decoder.decode(value, { stream: true });
    }
    return { tooLarge: false, text: text + decoder.decode() } as const;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return response({ ok: false, code: "FORBIDDEN" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return response({ ok: false, code: "UNSUPPORTED_MEDIA_TYPE" }, 415);
  }

  let input: unknown;
  try {
    const body = await limitedRequestText(request);
    if (body.tooLarge) return response({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);
    input = JSON.parse(body.text);
  } catch {
    return response({ ok: false, code: "INVALID_JSON" }, 400);
  }

  if (input && typeof input === "object" && !Array.isArray(input)) {
    const honeypot = (input as Record<string, unknown>).website;
    if (typeof honeypot === "string" && honeypot.trim()) {
      return response({ ok: false, code: "VALIDATION_ERROR" }, 422);
    }
  }

  const parsed = validateContactPayload(input);
  if (!parsed.ok) {
    return response({ ok: false, code: "VALIDATION_ERROR", fieldErrors: parsed.fieldErrors }, 422);
  }

  const configuredEndpoint = process.env.HOVER_CONTACT_FORM_ENDPOINT?.trim();
  if (!configuredEndpoint) {
    return response({ ok: false, code: "NOT_CONFIGURED" }, 503);
  }

  let endpoint: URL;
  try {
    endpoint = new URL(configuredEndpoint);
    if (endpoint.protocol !== "https:") throw new Error("Secure endpoint required");
  } catch {
    return response({ ok: false, code: "NOT_CONFIGURED" }, 503);
  }

  // The shared form uses one canonical URL in both languages, so activation is shared.
  const formUrl = new URL("/ua#contact", request.url).href;
  if (isFormSubmitEndpoint(endpoint)) {
    // FormSubmit's supported AJAX transport sends from the visitor's browser.
    // This prepares a validated request; only the provider can confirm receipt.
    return response({
      ok: false,
      code: "BROWSER_DELIVERY_REQUIRED",
      delivery: {
        provider: "formsubmit",
        endpoint: endpoint.href,
        payload: formSubmitPayload(parsed.data, formUrl),
      },
    }, 200);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  const token = process.env.HOVER_CONTACT_FORM_TOKEN?.trim();

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: controller.signal,
    });
    const upstreamBody = await upstream.json().catch(() => null) as { ok?: unknown } | null;
    if (!upstream.ok || upstreamBody?.ok !== true) {
      return response({ ok: false, code: "UPSTREAM_REJECTED" }, 503);
    }
    return response({ ok: true }, 202);
  } catch (error) {
    return response(
      { ok: false, code: error instanceof Error && error.name === "AbortError" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE" },
      503,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function GET() {
  return response({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
}
