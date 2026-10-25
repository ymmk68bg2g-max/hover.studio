# Contact form delivery and protection

The shared ContactForm covers every UA and EN page. The browser makes one JSON
POST to /api/contact. It never sends enquiries directly to a mail provider.
There is no FormSubmit instruction or delivery fallback.

## Production settings

| Variable | Use | Visibility |
| --- | --- | --- |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Cloudflare Managed Turnstile sitekey | Public Config |
| TURNSTILE_SECRET_KEY | Siteverify credential | Server Secret |
| RESEND_API_KEY | Sending access restricted to forms.byhover.studio | Server Secret |

Recipient: byhover.studio@gmail.com. Verified sender:
HOVER.STUDIO <notifications@forms.byhover.studio>. The visitor's validated email
is Reply-To. Neither address is controlled by the submitted payload.
The old HOVER_CONTACT_FORM_ENDPOINT and HOVER_CONTACT_FORM_TOKEN are no longer
read. Never place secrets in public variables, logs or source control.

## Request flow

1. Validate same-origin JSON, a maximum 20,000-byte body, honeypot and fields.
2. Require a UUID submission ID and a nonempty Turnstile token up to 2,048 chars.
3. Validate Siteverify on the server: strict success, action contact, hostname
   byhover.studio or www.byhover.studio. Missing/invalid tokens fail closed.
4. Send plain text through Resend using a private credential. A stable
   contact/<submission UUID> idempotency key prevents duplicate email delivery
   when unchanged data is explicitly retried after an uncertain response.
5. Return 202 and strict ok:true only after Resend accepts and returns an ID.
   Provider acceptance does not guarantee inbox placement.
6. Display confirmation and report the configured Google Ads conversion once.

Each request attempt consumes the browser token and refreshes its challenge.
Errors preserve fields. Verification failure, HTTP 429, missing configuration,
timeouts and provider errors never show success or report conversions.
No automatic delivery retry runs. Changed data or NEW ENQUIRY gets a new UUID.

## Platform rate limit

All languages use the same endpoint. Scope a Vercel WAF rule to POST AND exact
path /api/contact. Start with a fixed 600-second window, 20 requests per IP and
Log. Log does not block. Review matches, test preview enforcement, then publish
HTTP 429 enforcement and tune against legitimate shared-IP traffic. Vercel
counters are per region, not a strict global distributed quota.

Firewall configuration is separate from Git deployment. Track reviewed draft
and manual publication status separately from the application release.

## Verification and migration

Automated tests use isolated fake Siteverify/Resend responses, never production
success bypasses. Preview without settings fails closed. The production host
allowlist has no localhost, preview-host or wildcard exception.
Obtain authorization before real test enquiries or Google Ads conversion
events. After the new delivery is confirmed, deactivate the old FormSubmit
form so its previously public endpoint is retired.

References:
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- https://formsubmit.co/help
