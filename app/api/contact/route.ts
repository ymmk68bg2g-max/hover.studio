import { validateContactPayload } from "../../contact-schema";
import { contactServerConfig, contactSubmissionId, contactTurnstileToken, sendContactEmail, verifyContactToken } from "../../contact-server";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
} as const;

function response(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
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
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
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
    if (honeypot !== undefined && (typeof honeypot !== "string" || honeypot.trim())) {
      return response({ ok: false, code: "VALIDATION_ERROR" }, 422);
    }
  }

  const parsed = validateContactPayload(input);
  if (!parsed.ok) {
    return response({ ok: false, code: "VALIDATION_ERROR", fieldErrors: parsed.fieldErrors }, 422);
  }

  const config = contactServerConfig();
  if (!config) {
    return response({ ok: false, code: "NOT_CONFIGURED" }, 503);
  }
  const envelope = input as Record<string, unknown>;
  const submissionId = contactSubmissionId(envelope.submissionId);
  if (!submissionId) {
    return response({ ok: false, code: "INVALID_SUBMISSION_ID" }, 400);
  }
  const token = contactTurnstileToken(envelope.turnstileToken);
  if (!token) {
    return response({ ok: false, code: "BOT_VERIFICATION_FAILED" }, 403);
  }
  const verification = await verifyContactToken(token, config);
  if (!verification.ok) return response({ ok: false, code: verification.code }, verification.status);
  const delivery = await sendContactEmail(parsed.data, submissionId, config);
  if (!delivery.ok) return response({ ok: false, code: delivery.code }, delivery.status);
  return response({ ok: true }, 202);
}

export function GET() {
  return response({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
}
