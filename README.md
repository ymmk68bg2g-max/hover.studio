# HOVER.STUDIO — native Next.js for GitHub → Vercel

Separate Next.js 16.3.8 package derived from corrected v134: original commit
`8c7774c61603f62598d6ac6afa2ed68cd380f138`, corrected Sites base commit
`c366727263702d9bcc9e01c30b976f7abfd0f34f` (published there as v135).
It does not use the Sites/Vinext build or Cloudflare Worker. Local verification
is in `HOVER_VERCEL/verification.json`.

## GitHub and Vercel settings

1. Extract this ZIP and put its contents at repository root: `app`, `public`,
   `package.json` and `vercel.json` must be at the root.
2. Import that repository in Vercel. Framework: **Next.js**; Node: **24.x**;
   Root Directory: **.**; Install Command: **npm ci**; Build Command:
   **npm run build**. Keep the default framework output directory. No static export.
3. Set this exact existing variable in each intended Vercel environment:

   `HOVER_CONTACT_FORM_ENDPOINT=https://formsubmit.co/ajax/byhover.studio@gmail.com`

   Recipient and FormSubmit provider are unchanged. No Gmail password,
   Cloudflare credential, database binding or API key is needed. Leave
   `HOVER_CONTACT_FORM_TOKEN` unset for FormSubmit. Never expose a private token
   using `NEXT_PUBLIC_`. `.env.example` contains only the public endpoint.
4. Create a preview and perform browser QA before production promotion.
   This archive does not push to GitHub, deploy, connect domains, change DNS/MX
   or send a form. Environment changes apply to subsequent deployments.

FormSubmit recipient/origin activation is external to this archive. A new
Vercel origin may need activation by the recipient. No enquiry was submitted
while preparing this package. A build/HTTP pass does not confirm email delivery.

## Local commands

Install Node.js 24 with npm. Run `npm ci`, `npm run build`, then
`npm start -- --hostname 127.0.0.1 --port 4184`. For development: `npm run dev`.
Only if the current contact configuration is needed, copy `.env.example` into
ignored `.env.local`. Do not commit credentials or generated directories.

## Platform adaptation

- Native Next.js scripts and dependencies replace Vite/Vinext/Wrangler.
- Next.js and eslint-config-next are pinned to 16.3.8; targeted compatible
  security updates resolve Sharp 0.35.5 and PostCSS 8.5.23. See the included
  dependency audit/applicability report for exact versions and remaining scope.
  Production audit: 0 findings. The full dependency audit retains 9 tool/dev
  dependency groups (8 high, 1 low), which are documented rather than hidden.
- `proxy.ts` sends the actual pathname to the locale adapter, retains the
  existing www redirect and marks unknown/preview hosts noindex.
- `next.config.ts` retains the source Worker's nosniff and Referrer-Policy.
  The supplied source defined no CSP, and no CSP was invented or weakened.
  Next.js supplies its standard 404 noindex metadata.
- Only the two privacy hosting sentences name Vercel; other provider wording
  and legal promises are unchanged.
- Fifteen inactive Sites/Cloudflare/D1 files are omitted; see
  `HOVER_VERCEL/platform-omissions.json` and `migration-diff.json`.

Assets, HERO, corrected CSS, contact API/schema/delivery/client and recipient
settings are byte-preserved. The unused `app/chatgpt-auth.ts` helper remains
historical source; no active route imports it. Vercel does not inject trusted
ChatGPT identity headers. Do not use that helper as Vercel authentication.

Canonical identity remains `https://byhover.studio`; preview hosts are noindex.
No domain is connected by this package. Existing `docs/` and `tests/` are
historical v134 material, including Sites/Vinext instructions. Those tests and
the original 180-test audit were not rerun or represented as Next.js tests.

## Verification limits

See `HOVER_VERCEL/verification.json`, `build.log` and `http-smoke.json` for actual
build and production HTTP checks. A limited in-app browser smoke passed seven
frames at emulated widths 320, 820 and 1440, with menu/Escape, Pause, language
switching and skip-link checks. Evidence and exact scope are in
`HOVER_VERCEL/browser-smoke.json` and `browser-evidence/`.

A full native Next browser regression, other widths, history/animation coverage,
physical devices, other engines, actual 200% zoom and deployed Vercel behavior
remain untested. The earlier full Sites/Vinext browser QA is not a full browser
pass of this native Next adaptation. No form POST or delivery test was made.

Official documentation:

- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- https://vercel.com/docs/environment-variables
- https://nextjs.org/docs/app/getting-started/deploying
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
