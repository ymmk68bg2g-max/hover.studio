# Native Next/Vercel dependency review — 2026-10-20

Final clean-lockfile install and native production build use Next/eslint-config-next **16.3.8**, Sharp **0.35.5**, PostCSS **8.5.23**, React/React DOM **19.2.6** and Node **24.19.0**. Other resolved patches: baseline-browser-mapping 2.11.30, nanoid 3.3.20 and source-map-js 1.2.2.

Production npm audit: **0** vulnerability groups (before migration patches: 6, including one critical). All-dependencies audit: **9** remaining dev/tool groups, **8 high + 1 low**. See raw audit JSON and the structured applicability report; no force or incompatible ESLint downgrade was used. Remaining tool findings are disclosed and do not appear in the production dependency audit.

[GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36): Windows-hosted Next filesystem routing could expose the local native Windows preview; final 16.3.8 is outside the vulnerable range. Vercel Linux is not this Windows condition.

[GHSA-2xp9-vwfh-vxw4](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4): AVIF image optimizer path; source images use unoptimized rendering and no AVIF assets. Next and Sharp are nevertheless patched.

[GHSA-vcvr-r3jv-pc5j](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j): No app ImageResponse or next/og caller using attacker-controlled SVG was found. Final 16.3.8 is patched.

[GHSA-m99w-x7hq-7vfj](https://github.com/vercel/next.js/security/advisories/GHSA-m99w-x7hq-7vfj): No Server Action was found in this app; feature condition not exposed. Final 16.3.8 is patched.

[GHSA-cjq9-62q9-8jv4](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4): No allowlisted remote image optimizer source is configured. The final production npm audit also clears the other Next advisory groups.

[GHSA-wq5f-xc86-pv6w](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w): Sharp native image dependency updated within Next allowed range to 0.35.5, also resolving earlier Sharp groups in audit.

[GHSA-fxqj-rqcc-2cmp](https://github.com/postcss/postcss/security/advisories/GHSA-fxqj-rqcc-2cmp): Local build uses supplied trusted CSS; final PostCSS 8.5.23 is patched rather than relying on the input condition.

No form submission, provider delivery or external deployment was tested. The original 180-test Sites audit is historical evidence, not a test result for native Next.
