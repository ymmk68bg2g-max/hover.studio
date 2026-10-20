# HOVER.STUDIO — content typography refinement

Baseline: published v60, source `81124280cdb916d2de6caaf33bcf390227139309`.

## Scope and evidence

Reviewed the actual shared components and CSS for both locales: homepage after Hero, YevAI, SolarFamily, SolarCity, AI Commercial Blueprint, Landing Page, Business Website, Corporate Website, Digital Experience, Website Care, Privacy and localized 404. SolarCity and Blueprint retain their existing placeholder sections; no new content was invented.

An unfinished local typography patch was present when this task resumed. It was reviewed against the published baseline, corrected and completed. The approved shared ending was restored rather than carrying its unrelated form-style changes forward.

No browser measurements or screenshots were captured during this pass. The configured Sites browser workflow requires a control-browser skill that is unavailable in this session. Source inspection and server-rendered HTML checks are not rendered-font or visual-layout checks. Browser reflow at 200%, user text-spacing overrides, optical kerning and actual line wrapping remain unverified.

The owner's supplied YevAI Art Direction measurements (64px / 400 / -1.28px / 71.68px, approximately 646px wide; adjacent body 20px / 400 / normal / 31px, approximately 388px wide) remain an external baseline observation, not a new measurement.

## Role map and implementation

| Page / section | Component / selector | Previous role / CSS | Final role and change |
|---|---|---|---|
| YevAI 04 | `.case-section-intro .case-text-statement` | Display statement, up to 64px, tracking -.02em, line-height 1.12 | Explicit `.case-text-lead`, 32/28/24px, normal tracking, line-height 1.4 |
| YevAI 06, 07, 09 | `.case-text-long-statement` | Long statement, up to 60px, tracking -.015em, line-height 1.14 | Explicit lead; adjacent paragraphs remain body |
| YevAI 01, 03, 05 | `.case-text-lead`, `.case-text-body` | Existing editorial lead/body | Shared scale, normal lead tracking, body desktop target retained |
| YevAI 02 | `.case-text-statement` | Black/orange statement | Retained independent display scale |
| SolarFamily explanatory sections | `.case-editorial-copy` lead/body | Existing quieter hierarchy | Same reusable lead/body; paragraph measure limited, full-width images unchanged |
| All case task rows | `.case-task-row h3` | 14.08px mono utility at desktop | Explicit content subheading, 22/20/19px, Inter Tight 500 |
| SolarCity / Blueprint | `.case-placeholder`, project intro | Existing lead placeholders | Shared lead scale; content and status unchanged |
| All five services / intro and When it fits | `.service-text-lead` | Intro lead; When it fits oversized long statement up to 60px | One lead role at 32/28/24px |
| All five services / Scope, Process & estimate | `.service-content-subheading`, `.service-text-body` | Subheading up to 24px / 600; body up to 20px | Subheading 22/20/19px / 500; body 20/19/18px |
| Home / Process | `.section-heading`, `.content-subheading`, `.section-body` | Statement heading; stage names up to 44.8px; body role | Heading 48/38/32px, stage subheading 22/20/19px, shared body |
| Home / Testimonials | `.section-heading`, `.section-quote` | Large heading and generic lead quote | Dedicated heading and quote 26/24/22px |
| Home / About, Founder, Services, Care | Explicit section lead/body, heading and meta classes | Mixed local rules, some duplicate overrides | Shared roles, consistent copy measure and paragraph spacing |
| Home / FAQ | `.section-heading`, `.content-subheading`, `.section-body` | Locally sized title/question; body | Common heading, question subheading, body; accordion unchanged |
| Privacy / 404 | Content heading, lead, subheading, body, meta | Local scales and utility subheadings | Explicit readable content roles; all copy and document status retained |

## Final tokens

Existing breakpoints are preserved: desktop >1100px; tablet 761–1100px; mobile ≤760px. Sizes use rem; pixel equivalents below assume the unchanged 16px root default.

| Role | Desktop / tablet / mobile | Weight | Tracking | Line-height |
|---|---|---|---|---|
| Section heading | 48 / 38 / 32px | 500 | -.01em | 1.18 |
| Lead | 32 / 28 / 24px | 400 | normal | 1.4 |
| Body | 20 / 19 / 18px | 400 | normal | 1.55 |
| Subheading | 22 / 20 / 19px | 500 | normal | 1.3 |
| Quote | 26 / 24 / 22px | 400 | normal | 1.45 |
| Meta | 13 / 12 / 12px | 400 | normal | 1.5 |

Content remains Inter Tight; metadata remains IBM Plex Mono. Font imports and available font weights are unchanged. No claim is made about fonts actually rendered in a browser in this session.

Body measure: up to 60ch, subject to the narrower existing parent grid. Leads: up to 45ch. Quotes: up to 55ch. Paragraph gap 1.25rem; content group gap 3rem. These restrictions are on text roles, not screenshots, galleries, complete case wrappers or client UI boards.

## Before / after control examples

These are CSS-source values at 1920px with a 16px root, not browser measurements. Mobile values are the final shared role; UA/EN use the same role without forcing the same wraps.

| Example | Before | After |
|---|---|---|
| YevAI / Art direction | 64px, 400, -.02em, 1.12 | 32px, 400, normal, 1.4 |
| YevAI / Result | 60px, 400, -.015em, 1.14 | 32px, 400, normal, 1.4 |
| SolarFamily / explanatory lead | 32px, 400, -.01em, 1.4 | 32px, 400, normal, 1.4 |
| Landing Page / When it fits | 60px, 400, -.015em, 1.14 | 32px, 400, normal, 1.4 |
| Services / Process & estimate subheading | 24px, 600, normal, 1.3 | 22px, 500, normal, 1.3 |
| Home / Testimonials quote | 32px, 400, -.01em, 1.4 | 26px, 400, normal, 1.45 |
| Home / Process heading; stage name | 64px / 500; 44.8px / 500 | 48px / 500; 22px / 500 |

## Protection and verification

- Homepage Hero source, its interaction handlers and font-loading line match baseline exactly.
- 259 protected CSS rules were compared structurally with baseline, including media-query context, declarations and values: Hero, discipline strip, reveal behavior, header/menu, footer/contact form, About display lockup and key client UI rules.
- No changes to project/service display titles, their orange color, screenshots, asset files, routes, prices, service definitions, client interaction demos or publication settings.
- SolarFamily client board body has its own preserved baseline rule so the editorial role cannot alter its existing responsive type.
- Explicit content-role rules replace the previous duplicate role scale; no new !important, global h1/h2/p overrides, font loading changes, root font-size changes, scaleX or text-hiding rules were introduced.
- Media-query source scale evaluated at 320, 360, 390, 430, 768, 1024, 1440 and 1920px. This confirms token selection only, not browser clipping or line wraps.
- Production build and 25 focused regression checks passed: localized page rendering, shared ending, service preselection, navigation, mobile menu constraints, project interaction rules, scroll restoration and widescreen YevAI media. The prior service-subheading test was updated from the superseded 600-weight/local clamp contract to the requested shared 500-weight role.

The protected shared ending was inspected but intentionally retains its existing typography. Any future typography changes to that block require a separate scope decision.
