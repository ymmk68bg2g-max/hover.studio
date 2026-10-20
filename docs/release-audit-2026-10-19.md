# HOVER.STUDIO — FINAL PRE-LAUNCH AUDIT

**READY FOR DEPLOYMENT — PRODUCTION CHECK PENDING**

Дата: 19 жовтня 2026, Europe/Kyiv. Кандидат: **HOVER-RC-2026-10-19**.

Це висновок про підготовлену збірку для поточного Sites/Cloudflare target у перевіреному нижче обсязі. Це **не** підтвердження запуску `byhover.studio`, доставки пошти, відповідності всього сайту WCAG або проходження браузерної перевірки. Підтверджених відкритих P0/P1 у кандидата після описаних виправлень не залишено. Неперевірені сценарії не позначено як PASS.

Production не оновлювався. DNS, MX, одержувач заявок, тарифи й сторонні дані не змінювалися. Live-тестові заявки не надсилалися. Сайти клієнтів не редагувалися й не сканувалися.

## A / Версія, середовище та обсяг

| Параметр | Підтверджений стан |
| --- | --- |
| Вихідна контрольна точка | Опублікована Sites **v133**, commit `31ac0d7764b49cfb11357ee979b8818efc4388e8` |
| Rollback version ID | `appgprj_6a9f3b20900481919f2db0621bd6a4f7~appgver_937ebfa91a6081919fed0fcd69753363` |
| Робоча копія | `/workspace/scratch/ed0ff2fd9e95/hover-studio` |
| Поточне публічне середовище | `https://hover-studio.pipistrello-26.chatgpt.site` — Sites, public |
| Сховище вихідного коду | Git-репозиторій Sites; baseline збережений окремою вже опублікованою версією |
| Реальний stack | Vinext 0.0.50, Vite 8.0.13, React/React DOM/RSC 19.2.6, Cloudflare Worker; Next 16.2.6 встановлений для сумісності, але Next server/Turbopack не є поточним runtime |
| Build | `node /root/.codex/plugins/cache/openai-curated-remote/sites/1.0.1/scripts/build-site.mjs` → `scripts/build-verified.sh` → bounded `vinext build` |
| Artifact | `dist/server/index.js` + client/static assets + hosting manifest, упаковані підтримуваним Sites workflow |
| Runtime перевірок | Node v24.19.0; package engines `>=22.13.0` |
| Edge compatibility | `2026-05-15`, `nodejs_compat`; типи з Wrangler 4.92.0 / workerd 1.20260515.1 |
| Runtime env | Revision 1; `HOVER_CONTACT_FORM_ENDPOINT` налаштований на HTTPS FormSubmit AJAX для `byhover.studio@gmail.com`; секретного токена для цього transport немає й він не потрібен |
| D1 / R2 | Обидва не підключені; локальна база заявок не використовується |
| Основний origin кандидата | `https://byhover.studio` |
| Основний домен у Sites | `list_custom_domains`: порожній список — домен до цього Sites-проєкту не підключений |
| Зовнішня перевірка byhover / www | HTTP-з’єднання з цього середовища не встановилося; другий web-fetch також недоступний; DNS-резолвер середовища повернув temporary failure. Це не доказ конкретної помилки DNS у власника |
| Що не робилося | Vercel/HOSTiQ deployment, інший production-пакет, promotion, domain/DNS/MX mutations |

Повна матриця 22 маршрутів: `docs/release-route-matrix-2026-10-19.json`. Кожен перевірено HTTP GET на live v133 та окремо через виконання зібраного кандидата в Worker request fixtures. Browser DOM/rendered fonts не перевірялися.

| Тип | UA / EN шляхи | Кількість | Live HTTP / кандидат |
| --- | --- | ---: | --- |
| Головна | `/ua`, `/en` | 2 | 200 / 200, PASS |
| Послуги | `/{locale}/services/landing-pages`, `business-websites`, `corporate-websites`, `digital-experience`, `website-care` | 10 | 200 / 200, PASS |
| Кейси | `/{locale}/work/solarcity`, `solarfamily`, `yevai`, `ai-commercial-blueprint` | 8 | 200 / 200, PASS |
| Privacy | `/{locale}/privacy` | 2 | 200 / 200, PASS; deliberate noindex |
| Кореневий URL | `/` | — | 307 у compiled request fixtures; збережений вибір → UA country / uk language → EN fallback |
| Невідомі адреси | UA/EN unknown, unknown case/service, unsupported locale, missing asset | 7 fixtures | 404, noindex, localized recovery, PASS |

`/{locale}/services` та `/{locale}/work` не є передбаченими індексними сторінками: меню веде до реальних секцій головної `#services` / `#work`. Нові сторінки не створювалися.

## B / Знайдені проблеми та виправлення

| ID / пріоритет | Сторінка, відтворення й доказ | Причина / виправлення | Повторна перевірка |
| --- | --- | --- | --- |
| CONTENT-01 / P1, mitigation | Обидва записи Testimonials виводилися як approved. Для першого текст спочатку явно просили згенерувати; подальше «Согласовал» не уточнює обсяг підтвердження автора. Другий наданий власником із фото; це не доводить, що він вигаданий, але окремого однозначного підтвердження клієнтського досвіду немає | Записи й фото збережені. У кандидата існуючий `testimonialsMode` переведено в `hidden`, щоб не представляти невстановлене походження як рекомендацію. Це не видалення demo-позначки й не заміна на новий відгук | PASS: публічний кандидат не виводить ці endorsements. Поточна v133 не змінена. Після підтвердження можна показати один або обидва без потреби симетрії |
| SEO-01 / P2 | Canonical/hreflang, metadataBase, sitemap і robots містили preview origin | Додано `site-config.ts`, єдиний approved origin byhover; збережено відповідність кожної сторінки та мови | PASS: 22 canonical/мовні пари, 20 sitemap URLs; service query не входить у canonical |
| SEO-02 / P2 | UA HTML спочатку мав `lang="en"`, виправлявся тільки hydration | Початкова document language визначається explicit route через ізольований адаптер фактичного Vinext request context; `/ua` збережено, технічна мова `uk` | PASS: усі 22 сторінки, у тому числі з протилежними cookie, country і Accept-Language |
| SEO-03 / P2 | Відсутні og:url / og:image, неповні social metadata кейсів | Локалізовані OG/Twitter; для студії використано вже затверджений портрет, для кейсів — наявні covers | PASS: 20 indexable сторінок, зображення існують; жодна нова графіка не генерувалася |
| SEO-04 / P2 | Preview відкритий до індексації | Preview metadata + `X-Robots-Tag: noindex, nofollow`; preview robots Disallow; production host залишається indexable; Privacy/404 — noindex | PASS: compiled primary/preview request matrix. Live v133 зберігає стару політику до окремої публікації кандидата |
| SEO-05 / P2 | Preferred host не був зафіксований у Worker | `www.byhover.studio` → non-www 308 із збереженням path/query | PASS: fixture із deep case URL та query. Live DNS/TLS ще NOT TESTED |
| NAV-01 / P2 | BEHANCE у footer мав `href="#"` | Прибрано непідключену обіцянку посилання; UPWORK збережено | PASS: source + localized navigation tests |
| A11Y-01 / P2 | Skip link перехоплювався scroll handler, але focus не переходив у main | Програмний tabindex=-1 тільки за відсутності власного tabindex; focus preventScroll після anchor handoff | PASS: mock regressions для focus, наявного tabindex і modified clicks; real keyboard NOT TESTED |
| LANG-01 / P2 | UA mobile menu показувало KYIV / UKRAINE | Використано чинний локалізований рядок `t.location` | PASS: UA/EN menu tests |
| A11Y-02 / P2 | Неактивний header language label: #8a8a84 / #f4f4f0 = 3.15:1 при дрібному тексті | Лише цей light-header колір змінено на #666661; Hero/global palette не змінено | PASS: source contrast 5.23:1; computed styles NOT TESTED |
| A11Y-03 / P2 | Схема SolarFamily має нескінченний необов’язковий рух без ручної паузи | Додано локалізовану Pause/Play, aria-pressed, 44px target; pause не скидає сценарій | PASS: UA/EN state fixtures та CSS; reduced motion збережено |
| FORM-01 / P2 | API лімітував 20,000 символів після повного буферизування request.text() | Потокове читання з межею 20,000 **байтів**, ранній cancel, UTF-8 decoder зі збереженням розбитих символів | PASS: oversized unread chunks, exact byte boundary Unicode, missing body + усі чинні transport тести |
| PRIVACY-01 / P2 | Вказано HOSTiQ як main hosting, фактичний поточний target — Sites/Cloudflare | Виправлено тільки hosting-параграфи UA/EN; email, процес FormSubmit й ручне правило 14 днів збережено | PASS: source consistency; юридична достатність і точні provider locations NOT TESTED |
| PERF-01 / P2 | Три нижні portfolio thumbnails мали priority і preload: SolarCity 4,071,123 B, YevAI 2,689,205 B, SolarFamily 265,796 B | Прибрано priority у work cards нижче Hero; case-cover priority збережено, якість не зменшено | PASS: source/SSR inspection. Фактична економія transfer / LCP не вимірювалася |
| CI-01 / P2 | Baseline typecheck: неправильні union narrowing, React PointerEvent у native listener, відсутні Worker ambient types | Перевірене narrowing; native DOM event type; реальні типи Wrangler + optional DB binding | PASS: `tsc --noEmit --incremental false`, strict не вимикався |
| CI-02 / P2 | Baseline lint помилявся на synchronous effect setState у SolarCity curve | Switching виведено зі станів requested/displayed, 120ms transition і paused selection збережено | PASS: lint без errors, transition/timer/pause тести |
| CI-03 / P2 | Baseline 165/168 тестів: очікування старого menu bounding, окремого CTA selector та не запитаних Tailwind utilities | Тести перевіряють поточне full-viewport меню, grouped CTA; catalog utilities компілюються явним fixture, щоб unused CSS не доводилося додавати на сайт | PASS: 180/180. Тести не видалялися, перевірки не вимикалися |
| SEC-01 / P2 | Live не повертав nosniff / referrer policy | Додано вузькі `X-Content-Type-Options: nosniff` та `Referrer-Policy: strict-origin-when-cross-origin` | PASS: compiled responses. CSP/X-Frame-Options/HSTS не встановлювалися навмання |

Не всі source-search збіги є дефектами. `demo` у демонстраціях можливостей описує їхню роль; fallback placeholder-копірайт не відображається в чотирьох заповнених кейсах. Порожні ділянки й асиметрія не перероблялися.

## C / PASS, FAIL, NOT TESTED, NOT APPLICABLE

| Область | Статус | Метод / межі |
| --- | --- | --- |
| 22 live URLs | PASS | Реальний HTTP GET на v133: 22×200. Один відсутній asset:404. Це не browser interaction |
| 22 candidate URLs, initial HTML/metadata | PASS | Виконання зібраного Worker, не браузер |
| Internal links / anchors / back actions / Next Project | PASS | Source, витягнення SSR anchors, mock tests; усі справжні targets існують |
| Root locale strategy | PASS | П’ять request fixtures; реальний geo edge test NOT TESTED |
| Language context / refresh / history / layout changes | PASS в mock scope | Tests/scroll-restoration та language controls; real Back/Forward після фактичного remote image load NOT TESTED |
| Mobile menu | PASS в source/mock scope | Open/close state, lock cleanup, focus trap, Escape, breakpoint, safe area аналіз; реальні rapid taps/rotation NOT TESTED |
| Cases / asset references | PASS | 48 literal references, усі rendered sources; 78 rasters перевірено, 0 corrupt |
| Favicon | PASS в source/HTTP scope | SVG доставляється image/svg+xml; фірмові dark/light та H збережені |
| Required fields / services / Unicode / retry / errors | PASS в mock scope | 64 contact transport tests; додаткові 27 schema/API checks під час аудиту |
| Form provider current activation / allowed final domain | NOT TESTED | Не робили live POST або provider dashboard mutation |
| Actual email delivery / Inbox vs Spam | NOT TESTED | Немає поточного контрольного листа/delivery log кандидата |
| Main domain HTTPS / real www / canonical after DNS | NOT TESTED | Домен не прикріплений до цього Site; середовище не змогло встановити з’єднання |
| Chrome/Firefox/WebKit, physical iOS/Android/tablet | NOT TESTED | Доступного supported browser-control немає |
| Computed styles / actual font face / screenshots | NOT TESTED | CSS/font declarations не видаються за rendered-font перевірку |
| 200% zoom / user text spacing / real keyboard / open keyboard | NOT TESTED | Потрібен браузер |
| Telegram in-app header | NOT TESTED | Реальний застосунок недоступний |
| Lighthouse / LCP / CLS / INP / field data | NOT TESTED | Немає вимірювань; scores не вигадувалися, TBT не називається INP |
| Newsletter / analytics / new integrations | NOT APPLICABLE | Не додавалися |
| Video posters / autoplay sound | NOT APPLICABLE | У поточних public матеріалах не знайдено video/iframe/audio |
| Dependency audit | FAIL як інвентар, P2 за applicability | npm audit має 7 affected groups; деталі нижче. Не оголошено всі залежності безпечними |

### Матриця responsive coverage

Це **аналітична перевірка source breakpoints**, не емуляція й не візуальний PASS.

| Ширини | Чинна структура за CSS | Browser / device |
| --- | --- | --- |
| 320 / 360 / 390 / 430 | Mobile menu; single capability accordion; 2 facts columns; mobile service/Privacy/404 layouts | NOT TESTED |
| 768 / 820 | Tablet menu; 2 capability columns; 3 facts columns; narrow case introduction stacking | NOT TESTED |
| 1024 | Tablet menu; 3 facts columns; ширша tablet case composition | NOT TESTED |
| 1440 / 1920 | Desktop navigation; asymmetric capability columns; 6 facts columns | NOT TESTED |

Sites workflow прямо обмежує доступний спосіб QA: [Sites SKILL.md](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md): “If `$control-browser` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.” Цієї capability немає, тому інший браузерний шлях не імітувався. Vite middleware у чинному unit-test harness не є запуском preview для візуальної перевірки.

## D / Межі змін

Головний Hero не перероблявся: слогани, гарнітури, sizes/weight/tracking/line-height, placement, colors, фонові слова, hover/touch, animation та responsive composition збережені. Не додавалися сторінки, CMS, analytics, нові послуги, декоративні анімації або платні сервіси. Ціни й склад послуг не змінювалися.

Змінені компоненти:

- SEO: `app/site-config.ts`, `layout.tsx`, `request-locale.ts`, `robots.ts`, `sitemap.ts`, три наявні metadata route files.
- Form / Privacy: `app/api/contact/route.ts`, `contact-schema.ts`, `privacy-page.tsx`.
- Navigation / focus: `app/site-chrome.tsx`, `scroll-restoration.tsx`.
- Контроль motion: `app/solarcity-motion.tsx`, `solarfamily-energy-flow.tsx`, новий scoped controls CSS.
- Release configuration: `app/client-experience-config.ts` — records retained, testimonials hidden pending provenance.
- `app/site-client.tsx`: native event annotation та loading нижніх work images; Hero markup не змінювався.
- `app/globals.css`: scoped CSS import і один колір header language; нової typography scale немає.
- Типи: реальні Wrangler-generated `types/cloudflare-runtime.d.ts`, optional binding declaration `types/cloudflare-env.d.ts`; `.gitignore` не включає generated TypeScript cache.
- Regression tests: transport, navigation/focus, menu/layout, metadata/release, catalog compile contract; жоден failing test не видалений.

## E / Форма — три різні результати

1. **Frontend — PASS у source/mock scope.** Спільна форма, п’ять services, editable preselection, required/email validation, український текст й апостроф, trim, допустимий бюджет «Ще не визначився». Loading блокує повторне відправлення; помилка не очищає введення; timeout 45s не запускає автоматичний resend.
2. **Приймання сервером / провайдером — PASS у mock scope, runtime endpoint configuration PASS.** `/api/contact` перевіряє same-origin, JSON, honeypot, size і schema. Browser FormSubmit transport запускається лише за дозволеною інструкцією; success вимагає явного provider `success: true` або `"true"`. Сам HTTP200 не вважається доставкою.
3. **Фактична доставка — NOT TESTED.** Поточних live POST, activation check, листа в Inbox/Spam або delivery log не було. Старі листи не використано як доказ.

Публічний контакт, mailto, source документація, Privacy та поточний endpoint узгоджені: **byhover.studio@gmail.com**. Отримувач не змінювався.

Фактичний шлях: ContactForm → `/api/contact` validation/preparation → browser FormSubmit AJAX → FormSubmit → Gmail одержувача. Немає окремої локальної бази/файлового запису заявок; payload logs не знайдено. Ручне видалення листування незавершених звернень через 14 днів після останнього повідомлення не видається за backend automation. Окреме 30-day provider archive disclosure узгоджене з [FormSubmit documentation](https://formsubmit.co/documentation).

Honeypot / origin check не є гарантією від ботів. Новий rate limiter / CAPTCHA / провайдер не додавалися. Direct FormSubmit transport має власні platform/provider обмеження; їхній фактичний dashboard стан не перевірено.

## F / Release, deployment та rollback

**Один кандидат підготовлено для поточного Sites/Cloudflare target.** Сайт не мігрував на Vercel або HOSTiQ. Публікація кандидата не виконувалася; номер saved version і source SHA повертає Sites при збереженні та вони наведені у фінальній передачі разом із цим звітом.

Перевірки кандидата:

- Production build: **PASS**.
- Typecheck: **PASS**, zero errors, strict збережено.
- ESLint: **PASS**, zero errors; 6 warnings — 3 чинні native-img suggestions та 3 unused-disable comments у незміненому generated Wrangler output.
- Tests: **180/180 PASS**.
- `git diff --check`: **PASS**.
- Targeted public/client secret-pattern scan: 0 matches. Public .env/private keys/backup archives: 0 found. Це обмежений pattern scan, не доказ відсутності всіх можливих секретів.
- Worker logs за доступне 180-minute window: повернутий запис — очікуваний власний 404 audit request з outcome `ok`, без crash. Це не гарантія всіх майбутніх запитів.

Порядок публікації після окремого рішення власника:

1. Обрати цей saved release candidate; не створювати випадкову нову збірку з іншим stack.
2. Підключити `byhover.studio` до того ж Sites-проєкту, виконати повернуті platform DNS instructions і перевірити certificate/domain active. MX не змінювати.
3. Перевірити, що runtime env revision містить поточний FormSubmit endpoint. Не переносити secret у manifest/client bundle.
4. Окремо підтвердити production deployment цього exact saved version.
5. Виконати smoke check нижче на реальному домені як звичайний відвідувач.

### Post-deploy smoke check

1. `https://byhover.studio`: правильний кандидат, HTTPS; www → non-www без loop.
2. `/ua`, `/en`: контент, document lang, menu/footer, languages.
3. Пряме відкриття + refresh одного кейса й однієї послуги.
4. Mobile menu: open after scroll, close/Escape/link, rapid toggles, rotation, short landscape; anchor title/line не перекриті header.
5. Після дозволу — **по одній** UA/EN контрольній заявці з позначенням `HOVER PRE-LAUNCH TEST — NOT A CLIENT ENQUIRY`; перевірити explicit provider acceptance та реально отримані листи.
6. `robots.txt`, sitemap, canonical, hreflang, OG image; production indexable, preview noindex; Privacy/404 noindex.
7. Немає critical 404/5xx/assets console errors; відсутній невидимий overlay/scroll lock.

**Rollback для поточного hosting:** у Sites вибрати збережену v133 / exact version ID з таблиці A і після окремого підтвердження повторно опублікувати її. Це поверне код і assets тієї версії. Перевірити env revision та custom-domain state окремо: rollback коду не відновлює DNS, env mutations, листи, провайдерські дані або сторонні сервіси. Baseline commit і збережена версія доступні без переписування робочої копії вручну.

## G / Відкриті P2 та backlog

| Пріоритет / пункт | Рішення для цього pass |
| --- | --- |
| P2 — SOLARCITY live target | На головній / featured: `https://www.solarcity.com/`; у case CTA: локалізований `solarcity-concept-01.pipistrello-26.chatgpt.site`. Перший HEAD не встановив upstream connection з цього середовища; три інші project live targets відповіли 200 на HEAD. URL не вигадувався й не замінювався навмання; власник має підтвердити потрібний destination |
| P2 — protected Hero ticker | Необов’язковий нескінченний рух має reduced-motion fallback, але окремої Pause немає. Hero захищений, тому не змінювався. Мінімальна окрема пропозиція: контроль pause/hide для ticker без зміни композиції; потрібне рішення про зміну захищеного елемента |
| P2 — деякі orange hover text states | #ff4a17 на #f4f4f0 ≈3.05:1; для дрібного тексту недостатньо4.5:1. Глобальна палітра не змінювалася. Потрібна контекстна browser перевірка; WCAG certification не заявляється |
| P2 — dependencies | `npm audit --omit=dev`: 7 package groups —1 critical,5 high,1 moderate. Див. нижче applicability; upgrade не робився |
| P3 — responsive image variants | Джерела якісні, переважно lazy; варіанти для мобільного можуть скоротити transfer пізніше без зміни затвердженої графіки |
| P3 — JSON-LD / необов’язковий додатковий контент | Не додавався заради повноти; не блокер |

### Applicability dependency advisories

Installed groups: Next16.2.6, sharp0.34.5, Next nested PostCSS8.4.31, fast-uri3.1.2, nanoid3.3.12, source-map-js1.2.1, baseline-browser-mapping2.10.30.

У поточному artifact bundled Vinext + RSC edge production. Затронуті Next/Sharp/PostCSS/URI/source-map/browser-mapping implementations у deployed runtime не знайдені. У source немає `"use server"`, generated server action map порожній; `next/og` ImageResponse routes відсутні. Image route використовує Vinext + Cloudflare IMAGES, не sharp. Це висновок про **конкретний Worker artifact**, не загальна гарантія безпеки.

Primary advisories: [Windows-hosted Next RCE](https://github.com/advisories/GHSA-p293-qw3h-jr36), [AVIF/Sharp optimizer](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4), [Node next/og ImageResponse](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j), [Server Actions DoS](https://github.com/vercel/next.js/security/advisories/GHSA-m99w-x7hq-7vfj). Їхні умови не підтверджені для цього deployment; P1 runtime exploit не знайдений. Залежності **не** названо безпечними загалом. Перед переходом на справжній Next/Vercel server applicability треба оцінити заново.

Окрема maintenance задача: constrained patch/minor upgrades із build/tests, без `audit fix --force` або зміни framework під час freeze. Загальний обсяг public assets42.27MiB — розмір репозиторних assets, не фактичний first-load transfer. LCP≤2.5s/CLS≤0.1/INP≤200ms не виміряні й не заявляються.

## H / Дії власника

1. Підтвердити використання цього поточного Sites target і підключити основний домен; якщо фактично обирається інший hosting, цей Worker artifact не називати сумісним із ним без окремої перевірки.
2. Дозволити дві контрольні заявки — по одній для UA/EN — на вже перевірений runtime recipient `byhover.studio@gmail.com`; перевірити отримання й папку Spam.
3. Виконати/надати доступ для браузерної та device smoke перевірки з таблиці C перед публічним оголошенням запуску.
4. Підтвердити правильний live URL SOLARCITY.
5. Якщо відгуки треба повернути: однозначно вказати, який текст схвалений самим автором і відображає реальний досвід. Можна запускатися без цієї секції; вигадувати ще один відгук не потрібно.

Запит на окремий дозвіл live-тесту походить безпосередньо із завдання: «Одну контрольну заявку для кожної мови відправляти тільки після підтвердження власником отримувача й дозволу на тест». Це обмеження виконано; поточна наявність робочого endpoint не була трактована як такий дозвіл.
