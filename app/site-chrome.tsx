"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { privacyPublicationStatus } from "./client-experience-config";
import { Wordmark } from "./wordmark";
import { navigateToAnchor, prepareLanguageNavigation } from "./scroll-restoration";
import { TelegramLink } from "./telegram-link";

export type SiteLocale = "en" | "ua";
export type SitePageKind = "home" | "service" | "project" | "default";

const chromeCopy = {
  en: {
    navigation: "Primary navigation",
    mobileNavigation: "Mobile navigation",
    footerNavigation: "Footer navigation",
    socialNavigation: "Social links",
    skip: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchLanguage: "Switch to Ukrainian",
    work: "WORK",
    services: "SERVICES",
    about: "ABOUT",
    contact: "CONTACT",
    start: "START A PROJECT",
    backServices: "← BACK TO SERVICES",
    backWork: "← BACK TO WORK",
    descriptor: "DIGITAL DESIGN / DEVELOPMENT",
    location: "KYIV / UKRAINE\nWORKING WORLDWIDE",
    top: "BACK TO TOP",
    rights: "© 2026 HOVER.STUDIO",
    privacy: "PRIVACY",
    privacyDraft: "PRIVACY / DRAFT",
  },
  ua: {
    navigation: "Основна навігація",
    mobileNavigation: "Мобільна навігація",
    footerNavigation: "Навігація у футері",
    socialNavigation: "Соціальні посилання",
    skip: "До основного вмісту",
    openMenu: "Відкрити меню",
    closeMenu: "Закрити меню",
    switchLanguage: "Перейти до англійської версії",
    work: "ПРОЄКТИ",
    services: "ПОСЛУГИ",
    about: "ПРО СТУДІЮ",
    contact: "КОНТАКТ",
    start: "ПОЧАТИ ПРОЄКТ",
    backServices: "← НАЗАД ДО ПОСЛУГ",
    backWork: "← НАЗАД ДО ПРОЄКТІВ",
    descriptor: "DIGITAL-ДИЗАЙН / РОЗРОБКА",
    location: "КИЇВ / УКРАЇНА\nПРАЦЮЄМО ПО ВСЬОМУ СВІТУ",
    top: "НАГОРУ",
    rights: "© 2026 HOVER.STUDIO",
    privacy: "КОНФІДЕНЦІЙНІСТЬ",
    privacyDraft: "КОНФІДЕНЦІЙНІСТЬ / ЧЕРНЕТКА",
  },
} as const;

type SiteChromeProps = {
  locale: SiteLocale;
  pageKind: SitePageKind;
  languageHref: string;
};

function HeaderArrow() {
  return (
    <span className="ui-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" focusable="false">
        <path d="M3.25 12.75 12.75 3.25M6 3.25h6.75V10" />
      </svg>
    </span>
  );
}

function CompactMenuIcon({ open }: { open: boolean }) {
  const motionRef = useRef<SVGGElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const previousOpenRef = useRef(open);

  useLayoutEffect(() => {
    const motion = motionRef.current;
    if (!motion) return;
    if (previousOpenRef.current === open) return;
    previousOpenRef.current = open;
    // Read the in-flight position before cancelling, so reversals never reset.
    const current = getComputedStyle(motion).transform;
    animationRef.current?.cancel();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animationRef.current = motion.animate([
      { transform: current, offset: 0 },
      { transform: `translateY(${open ? -1 : 1}px)`, offset: 0.18 },
      { transform: `translateY(${open ? 2 : -1}px)`, offset: 0.66 },
      { transform: `translateY(${open ? -0.45 : 0.3}px)`, offset: 0.84 },
      { transform: "translateY(0px)", offset: 1 },
    ], { duration: open ? 500 : 300, easing: "cubic-bezier(0.33, 0, 0.2, 1)" });
  }, [open]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => { if (reduced.matches) animationRef.current?.cancel(); };
    reduced.addEventListener("change", settle);
    return () => { reduced.removeEventListener("change", settle); animationRef.current?.cancel(); };
  }, []);

  return (
    <svg className="compact-menu-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g ref={motionRef} className="compact-menu-bounce">
        <g className="compact-menu-stroke compact-menu-stroke-top"><path d="M11 24h26" vectorEffect="non-scaling-stroke" /></g>
        <g className="compact-menu-stroke compact-menu-stroke-bottom"><path d="M11 24h26" vectorEffect="non-scaling-stroke" /></g>
      </g>
    </svg>
  );
}

type MenuPhase = "closed" | "opening" | "open" | "closing";

function LanguageLink({ href, locale, beforeNavigate, children, ...props }: {
  href: string;
  locale: SiteLocale;
  beforeNavigate?: () => void;
  children: ReactNode;
  className?: string;
  lang?: string;
  hrefLang?: string;
  "aria-label"?: string;
}) {
  return <a {...props} href={href} data-language-switch onClick={event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    beforeNavigate?.();
    const target = prepareLanguageNavigation(href);
    if (!target) return;
    event.preventDefault();
    try { localStorage.setItem("hover_locale", locale); } catch { /* Navigation works without storage. */ }
    // A fresh document keeps the UA-only Google tag out of the EN version.
    window.location.assign(target);
  }}>{children}</a>;
}

export function SiteHeader({ locale, pageKind, languageHref }: SiteChromeProps) {
  const t = chromeCopy[locale];
  const otherLocale: SiteLocale = locale === "en" ? "ua" : "en";
  const isHome = pageKind === "home";
  const activeSection = pageKind === "service" ? "services" : pageKind === "project" ? "work" : null;
  const navItems = useMemo(() => [
    { id: "work", label: t.work },
    { id: "services", label: t.services },
    { id: "about", label: t.about },
    { id: "contact", label: t.contact },
  ], [t.about, t.contact, t.services, t.work]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPhase, setMenuPhase] = useState<MenuPhase>("closed");
  const menuVisible = menuPhase !== "closed";
  const [compact, setCompact] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(activeSection);
  const [mobileTap, setMobileTap] = useState<string | null>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const menuIntentRef = useRef(false);
  const restoreScrollRef = useRef<(() => void) | null>(null);
  const previousBodyOverflowRef = useRef("");
  const previousDocumentOverflowRef = useRef("");

  const closeMenu = useCallback(() => {
    if (!menuIntentRef.current) return;
    menuIntentRef.current = false;
    setMenuOpen(false);
    setMenuPhase("closing");
  }, []);

  const hrefFor = (id: string) => isHome || id === "contact" ? `#${id}` : `/${locale}#${id}`;
  const mobileHrefFor = (id: string) => isHome ? `#${id}` : `/${locale}#${id}`;
  const homeHref = isHome ? "#top" : `/${locale}`;
  const action = pageKind === "service"
    ? { href: `/${locale}#services`, label: t.backServices }
    : pageKind === "project"
      ? { href: `/${locale}#work`, label: t.backWork }
      : { href: "#contact", label: t.start };
  const mobileActionHref = !isHome && pageKind === "default" ? `/${locale}#contact` : action.href;

  useEffect(() => {
    const onScroll = () => {
      if (!menuOpen) setCompact(window.scrollY > 48);
      if (!isHome) {
        const contact = document.getElementById("contact");
        const contactVisible = contact && contact.getBoundingClientRect().top <= Math.min(window.innerHeight * 0.34, 320);
        setActiveNav(contactVisible ? "contact" : activeSection);
        return;
      }

      const probe = window.scrollY + Math.min(window.innerHeight * 0.34, 320);
      let currentSection: string | null = null;
      let currentSectionTop = Number.NEGATIVE_INFINITY;
      navItems.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= probe && section.offsetTop > currentSectionTop) {
          currentSection = id;
          currentSectionTop = section.offsetTop;
        }
      });
      setActiveNav(currentSection);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeSection, isHome, menuOpen, navItems]);

  useLayoutEffect(() => {
    if (!menuVisible) return;
    const root = document.documentElement;
    const previousCanvas = root.getAttribute("data-mobile-menu-visible");
    root.setAttribute("data-mobile-menu-visible", "");
    const ink = getComputedStyle(root).getPropertyValue("--ink").trim() || "#101010";
    // Match browser edge areas as well as the overlay, through the closing frame.
    const themeColors = Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
    const previousColors = themeColors.map(meta => ({ meta, content: meta.getAttribute("content") }));
    let addedTheme: HTMLMetaElement | null = null;
    if (themeColors.length === 0) {
      addedTheme = document.createElement("meta");
      addedTheme.name = "theme-color";
      document.head.appendChild(addedTheme);
      themeColors.push(addedTheme);
    }
    themeColors.forEach(meta => { meta.content = ink; });
    return () => {
      if (previousCanvas === null) root.removeAttribute("data-mobile-menu-visible");
      else root.setAttribute("data-mobile-menu-visible", previousCanvas);
      addedTheme?.remove();
      previousColors.forEach(({ meta, content }) => {
        if (content === null) meta.removeAttribute("content");
        else meta.content = content;
      });
    };
  }, [menuVisible]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    previousBodyOverflowRef.current = document.body.style.overflow;
    previousDocumentOverflowRef.current = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    let scrollReleased = false;
    const releaseScroll = () => {
      if (scrollReleased) return;
      scrollReleased = true;
      document.documentElement.style.overflow = previousDocumentOverflowRef.current;
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
    restoreScrollRef.current = releaseScroll;
    const navigation = navigationRef.current;
    const isolated: Array<{ element: HTMLElement; inert: boolean }> = [];
    // Isolate siblings at every level, without disabling the dialog's ancestors.
    let branch: HTMLElement | null = navigation;
    while (branch && branch !== document.body) {
      for (const sibling of Array.from(branch.parentElement?.children ?? [])) {
        if (sibling instanceof HTMLElement && sibling !== branch && !["SCRIPT", "STYLE"].includes(sibling.tagName)) {
          isolated.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
    }
    const menu = navigation?.querySelector<HTMLElement>(".mobile-menu");
    if (menu) menu.scrollTop = 0;
    const toggle = toggleRef.current;
    const focusable = () => Array.from(navigation?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [])
      .filter(element => element.tabIndex >= 0 && !element.closest("[inert]") && element.getClientRects().length > 0);
    // Keep the close control focused; opening by touch must not select Projects.
    const focusFrame = window.requestAnimationFrame(() => toggle?.focus({ preventScroll: true }));
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMenu();
      toggle?.focus({ preventScroll: true });
    };
    const containFocus = (event: KeyboardEvent) => {
      const controls = focusable();
      if (event.key !== "Tab" || controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !navigation?.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (active === last || !navigation?.contains(active))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("keydown", containFocus);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      releaseScroll();
      restoreScrollRef.current = null;
      isolated.forEach(({ element, inert }) => { element.inert = inert; });
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("keydown", containFocus);
    };
  }, [closeMenu, menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1101px)");
    const releaseDesktopMenu = () => {
      if (window.innerWidth <= 1100) return;
      menuIntentRef.current = false;
      setMenuOpen(false);
      setMenuPhase("closed");
      setMobileTap(null);
      restoreScrollRef.current?.();
    };
    desktop.addEventListener("change", releaseDesktopMenu);
    window.addEventListener("resize", releaseDesktopMenu);
    const sizeObserver = new ResizeObserver(releaseDesktopMenu);
    sizeObserver.observe(document.documentElement);
    releaseDesktopMenu();
    return () => {
      desktop.removeEventListener("change", releaseDesktopMenu);
      window.removeEventListener("resize", releaseDesktopMenu);
      sizeObserver.disconnect();
    };
  }, [closeMenu]);

  useEffect(() => {
    // A toggle reversed before its first paint has no transitionend event.
    const frame = window.requestAnimationFrame(() => {
      if (!backdropRef.current?.getAnimations().some(animation => animation.playState === "running")) {
        setMenuPhase(menuIntentRef.current ? "open" : "closed");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [menuOpen, menuPhase]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (reduced.matches) setMenuPhase(menuIntentRef.current ? "open" : "closed");
    };
    reduced.addEventListener("change", settle);
    return () => reduced.removeEventListener("change", settle);
  }, []);

  const followMobileNav = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMobileTap(href);
    if (href.startsWith("#")) toggleRef.current?.focus({ preventScroll: true });
    // Release scroll and focus isolation before anchor restoration begins.
    flushSync(closeMenu);
    if (href.startsWith("#")) navigateToAnchor(href);
    else window.location.assign(href);
  };

  const closeForNavigation = () => flushSync(closeMenu);

  return (
    <>
      <a className="skip-link" href="#main">{t.skip}</a>
      <div
        ref={navigationRef}
        className="site-navigation"
        data-menu-state={menuPhase}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen ? true : undefined}
        aria-label={menuOpen ? t.mobileNavigation : undefined}
      >
      <header
        className={`site-header ${compact ? "is-compact" : ""} ${menuOpen ? "is-menu-open" : ""}`}
        data-site-header
        data-header-context={pageKind}
      >
        <Wordmark href={homeHref} onClick={closeForNavigation} />
        <nav className="desktop-nav" aria-label={t.navigation}>
          {navItems.map(({ id, label }) => (
            <a
              href={hrefFor(id)}
              key={id}
              className={activeNav === id ? "is-active" : ""}
              aria-label={label}
              aria-current={activeNav === id ? "location" : undefined}
            >
              <span className="nav-reveal" data-label={label}><span className="nav-visible-label">{label}</span></span>
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageLink
            href={languageHref}
            locale={otherLocale}
            className="language"
            lang={otherLocale === "ua" ? "uk" : "en"}
            hrefLang={otherLocale === "ua" ? "uk-UA" : "en"}
            aria-label={t.switchLanguage}
            beforeNavigate={closeForNavigation}
          >
            <span className={locale === "ua" ? "active" : ""}>UA</span> / <span className={locale === "en" ? "active" : ""}>EN</span>
          </LanguageLink>
          <a className="header-cta" href={action.href} data-header-action>
            <span>{action.label}</span>
            {pageKind === "home" || pageKind === "default" ? <HeaderArrow /> : null}
          </a>
          <button
            ref={toggleRef}
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              if (menuIntentRef.current) closeMenu();
              else {
                menuIntentRef.current = true;
                setMobileTap(null);
                setMenuOpen(true);
                setMenuPhase("opening");
              }
            }}
          >
            <CompactMenuIcon open={menuOpen} />
          </button>
        </div>
      </header>

      <div
        ref={backdropRef}
        className={`mobile-menu-backdrop ${menuOpen ? "is-open" : ""}`}
        aria-hidden="true"
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
          setMenuPhase(menuIntentRef.current ? "open" : "closed");
          if (!menuIntentRef.current) setMobileTap(null);
        }}
      />
      <div id="mobile-navigation" className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen} inert={!menuOpen}>
        <nav aria-label={t.mobileNavigation}>
          {navItems.map(({ id, label }, index) => {
            const href = mobileHrefFor(id);
            return (
              <a
                key={id}
                href={href}
                className={`${activeNav === id ? "is-active" : ""} ${mobileTap === href ? "is-pressed" : ""}`}
                aria-current={activeNav === id ? "location" : undefined}
                onClick={(event) => followMobileNav(event, href)}
              >
                <span className="mobile-nav-index">0{index + 1}</span>
                <span className="mobile-nav-label">{label}</span>
              </a>
            );
          })}
        </nav>
        {pageKind !== "home" ? (
          <a
            className={`mobile-context-action ${mobileTap === mobileActionHref ? "is-pressed" : ""}`}
            href={mobileActionHref}
            aria-label={action.label}
            onClick={(event) => followMobileNav(event, mobileActionHref)}
          >
            {action.label}
          </a>
        ) : null}
        <div className="mobile-menu-bottom">
          <div className="mobile-menu-contact">
            <TelegramLink locale={locale} placement="menu" onClick={() => {
              closeForNavigation();
              toggleRef.current?.focus({ preventScroll: true });
            }} />
          </div>
          <div className="mobile-menu-brand">
            <Wordmark href={homeHref} onClick={closeForNavigation} />
            <span>DESIGN THAT RESPONDS.</span>
          </div>
          <div className="mobile-menu-foot">
            <span>{t.location.split("\n")[0]}</span>
            <LanguageLink
              className="mobile-language"
              href={languageHref}
              locale={otherLocale}
              lang={otherLocale === "ua" ? "uk" : "en"}
              hrefLang={otherLocale === "ua" ? "uk-UA" : "en"}
              aria-label={t.switchLanguage}
              beforeNavigate={closeForNavigation}
            >
              <span className={locale === "ua" ? "active" : ""}>UA</span>
              <span aria-hidden="true"> / </span>
              <span className={locale === "en" ? "active" : ""}>EN</span>
            </LanguageLink>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export function SiteFooter({ locale, pageKind, languageHref }: SiteChromeProps) {
  const t = chromeCopy[locale];
  const otherLocale: SiteLocale = locale === "en" ? "ua" : "en";
  const isHome = pageKind === "home";
  const hrefFor = (id: string) => isHome || id === "contact" ? `#${id}` : `/${locale}#${id}`;
  const brandHref = isHome ? "#top" : `/${locale}`;
  const privacyLabel = privacyPublicationStatus === "draft" ? t.privacyDraft : t.privacy;

  return (
    <footer className="footer" data-site-footer data-scroll-region="footer">
      <div className="footer-top"><Link href={brandHref} className="footer-brand">HOVER.STUDIO</Link><a className="footer-link" href="#top">{t.top} ↑</a></div>
      <div className="footer-grid">
        <span className="footer-info">{t.descriptor}</span>
        <span className="footer-info preline">{t.location}</span>
        <nav aria-label={t.footerNavigation}>
          <div className="footer-link-row"><a className="footer-link" href={hrefFor("work")}>{t.work}</a></div>
          <div className="footer-link-row"><a className="footer-link" href={hrefFor("services")}>{t.services}</a></div>
          <div className="footer-link-row"><a className="footer-link" href={hrefFor("about")}>{t.about}</a></div>
          <div className="footer-link-row"><a className="footer-link" href={hrefFor("contact")}>{t.contact}</a></div>
          {privacyPublicationStatus !== "hidden" ? <div className="footer-link-row"><Link className="footer-link" href={`/${locale}/privacy`}>{privacyLabel}</Link></div> : null}
        </nav>
        <nav aria-label={t.socialNavigation}>
          <div className="footer-link-row"><a className="footer-link" href="https://www.upwork.com/freelancers/~0156b684b62004c2df" target="_blank" rel="noopener noreferrer">UPWORK</a></div>
          <div className="footer-link-row"><TelegramLink locale={locale} placement="footer" /></div>
        </nav>
      </div>
      <div className="footer-bottom">
        <span className="footer-micro">{t.rights}</span>
        <LanguageLink className="footer-link" href={languageHref} locale={otherLocale} hrefLang={otherLocale === "ua" ? "uk-UA" : "en"}>UA / EN</LanguageLink>
        <span>DESIGN THAT RESPONDS.</span>
      </div>
    </footer>
  );
}
