import type { ContactField, ContactPayload } from "./contact-schema";

export const CONTACT_REQUEST_TIMEOUT_MS = 45_000;

export type ContactSubmission = ContactPayload & {
  website?: string;
  turnstileToken: string;
  submissionId: string;
};

export type ContactResult = {
  ok?: unknown;
  code?: "VALIDATION_ERROR" | "BOT_VERIFICATION_FAILED" | "INVALID_SUBMISSION_ID"
    | "RATE_LIMITED" | "NOT_CONFIGURED" | "VERIFICATION_UNAVAILABLE"
    | "UPSTREAM_TIMEOUT" | "UPSTREAM_REJECTED" | "UPSTREAM_UNAVAILABLE"
    | "SUBMISSION_IN_PROGRESS";
  fieldErrors?: Partial<Record<ContactField, string>>;
};

async function responseJson(response: Response, signal: AbortSignal): Promise<ContactResult | null> {
  try {
    const result: unknown = await response.json();
    return result && typeof result === "object" && !Array.isArray(result) ? result as ContactResult : null;
  } catch (error) {
    // A timeout or interrupted download is different from malformed JSON.
    if (signal.aborted) throw new DOMException("The operation was aborted", "AbortError");
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

export async function submitContactRequest(
  payload: ContactSubmission,
  signal: AbortSignal,
): Promise<{ status: number; result: ContactResult | null }> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  return { status: response.status, result: await responseJson(response, signal) };
}
