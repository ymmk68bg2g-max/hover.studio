# Contact form delivery

Recipient and public contact email: `byhover.studio@gmail.com`.

The shared form on UA/EN home, service and project pages posts to `/api/contact`.
The server validates the payload and prepares the delivery request. The browser
then sends it directly to FormSubmit over HTTPS using its documented AJAX flow.
The provider POST uses `URLSearchParams` (form encoding) and only an `Accept`
header, so it does not need the extra JSON CORS preflight. UA/EN text, readable
field labels and Reply-To are preserved. The same flow applies at every viewport.
Preparation is not a success response and does not send an email. The shared
hosting server does not proxy FormSubmit requests; its requests encountered a
provider rate limit during setup. There is one browser delivery attempt, with no
automatic retry or fallback that could duplicate an enquiry.
The overall client deadline is 45 seconds, including preparation and reading
the provider response. A slow response after 15 seconds can still succeed.
Aborted or interrupted response bodies propagate as timeout/network errors;
only malformed JSON is normalized to a rejected response. An unknown outcome
does not trigger an automatic resend and does not clear the visitor's entries.
Only an explicit provider acceptance produces the success state; activation-pending,
rejected, invalid, timed-out and unavailable upstream responses preserve the form data.
Acceptance confirms processing by the delivery service, not arrival in the inbox.

## Runtime configuration

Set `HOVER_CONTACT_FORM_ENDPOINT` in the hosting environment to:

`https://formsubmit.co/ajax/byhover.studio@gmail.com`

On Sites, use the runtime environment settings and then publish a saved version.
For a future Vercel deployment, set the same variable in the Vercel project.
No Gmail password or API key is required for this FormSubmit transport.
`HOVER_CONTACT_FORM_TOKEN` is optional for a custom HTTPS webhook; it is not sent to FormSubmit.

## Recipient activation

FormSubmit requires the recipient to click **Activate Form** in its email.
Check Spam if the message is missing. Both language versions share the canonical
UA contact URL for this registration. A recipient or origin change may require new activation.

Test with a clearly labelled technical enquiry after activation, then confirm
receipt in the Gmail inbox. Do not treat an HTTP 200 or an upstream `"success":"false"`
response as successful delivery.

FormSubmit documentation: https://formsubmit.co/documentation
Activation help: https://formsubmit.co/help
AJAX transport: https://formsubmit.co/ajax-documentation
