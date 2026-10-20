"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const STORAGE_PREFIX = "hover-scroll:";
const ANCHOR_NAVIGATION = "hover:anchor-navigation";
const SECTION_ANCHOR_GAP = 32;
const LANGUAGE_POSITION_KEY = "hover-language-position";
const LANGUAGE_POSITION_TTL = 60_000;

type LanguagePosition = {
  version: 1;
  from: string;
  target: string;
  createdAt: number;
  region: string | null;
  progress: number;
  fallbackY: number;
  edge: "top" | "bottom" | null;
  disclosures: string[];
};

let pendingLanguagePosition: LanguagePosition | null = null;

// Use flow coordinates so the reveal animation cannot move the scroll target.
function flowTop(element: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    top += current.offsetTop;
    const parent = current.offsetParent as HTMLElement | null;
    if (parent) top += parent.clientTop;
    current = parent;
  }
  return top;
}

function anchorPosition(anchor: HTMLElement, anchorId: string, headerHeight: number) {
  if (anchorId === "top") return 0;
  const label = anchor.querySelector<HTMLElement>(":scope > .section-label");
  if (label) return flowTop(label) - headerHeight - SECTION_ANCHOR_GAP;
  return window.scrollY + anchor.getBoundingClientRect().top - headerHeight;
}

function storageKey() {
  return `${STORAGE_PREFIX}${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function readSavedPosition(key: string) {
  try {
    const value = window.sessionStorage.getItem(key);
    if (value === null) return null;
    const position = Number(value);
    return Number.isFinite(position) && position >= 0 ? position : null;
  } catch {
    return null;
  }
}

function savePosition(key: string, position: number) {
  try {
    window.sessionStorage.setItem(key, String(position));
  } catch {
    // Navigation still works when session storage is unavailable.
  }
}

function decodedHash() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return window.location.hash.slice(1);
  }
}

function clampedPosition(position: number) {
  return Math.max(0, Math.min(position, document.documentElement.scrollHeight - window.innerHeight));
}

function headerOffset() {
  return (document.querySelector<HTMLElement>("[data-site-header]")?.getBoundingClientRect().height ?? 0) + SECTION_ANCHOR_GAP;
}

function languageRegions() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-region]"))
    .map(element => ({ key: element.dataset.scrollRegion!, top: flowTop(element) }))
    .sort((a, b) => a.top - b.top);
}

// Used by every language control, after releasing the mobile menu's scroll lock.
export function prepareLanguageNavigation(href: string) {
  const current = new URL(window.location.href);
  const target = new URL(href, current);
  const sourceLocale = current.pathname.match(/^\/(ua|en)(?=\/|$)/)?.[1];
  const targetLocale = target.pathname.match(/^\/(ua|en)(?=\/|$)/)?.[1];
  if (target.origin !== current.origin || !sourceLocale || !targetLocale
    || sourceLocale === targetLocale
    || current.pathname.slice(3).replace(/\/$/, "") !== target.pathname.slice(3).replace(/\/$/, "")) return null;
  target.search = current.search;
  target.hash = current.hash;

  const regions = languageRegions();
  const probe = window.scrollY + headerOffset();
  let index = -1;
  regions.forEach((region, currentIndex) => { if (region.top <= probe) index = currentIndex; });
  const region = regions[index];
  const end = regions[index + 1]?.top ?? document.documentElement.scrollHeight;
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const position: LanguagePosition = {
    version: 1,
    from: current.href,
    target: target.href,
    createdAt: Date.now(),
    region: region?.key ?? null,
    progress: region ? Math.max(0, Math.min(1, (probe - region.top) / Math.max(1, end - region.top))) : 0,
    fallbackY: window.scrollY,
    edge: window.scrollY <= 1 ? "top" : maxY - window.scrollY <= 1 ? "bottom" : null,
    disclosures: Array.from(document.querySelectorAll<HTMLElement>('button[data-language-disclosure][aria-expanded="true"]'))
      .map(element => element.dataset.languageDisclosure!),
  };
  savePosition(storageKey(), window.scrollY);
  pendingLanguagePosition = position;
  try {
    window.sessionStorage.setItem(LANGUAGE_POSITION_KEY, JSON.stringify(position));
  } catch {
    // The in-memory handoff also supports client navigation without storage.
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

function takeLanguagePosition() {
  let value: unknown = pendingLanguagePosition;
  try {
    if (!value) value = JSON.parse(window.sessionStorage.getItem(LANGUAGE_POSITION_KEY) ?? "null");
  } catch {
    // A blocked storage API or an invalid record must not block navigation.
  }
  const position = value as LanguagePosition | null;
  const valid = position?.version === 1 && typeof position.target === "string"
    && typeof position.from === "string" && typeof position.createdAt === "number"
    && Date.now() - position.createdAt >= 0 && Date.now() - position.createdAt < LANGUAGE_POSITION_TTL
    && (position.region === null || typeof position.region === "string")
    && Number.isFinite(position.progress) && position.progress >= 0 && position.progress <= 1
    && Number.isFinite(position.fallbackY) && position.fallbackY >= 0
    && [null, "top", "bottom"].includes(position.edge)
    && Array.isArray(position.disclosures) && position.disclosures.every(key => typeof key === "string");
  // A source effect replay can happen while the next language is still loading.
  if (valid && position.from === window.location.href) return null;
  pendingLanguagePosition = null;
  try { window.sessionStorage.removeItem(LANGUAGE_POSITION_KEY); } catch { /* Optional storage. */ }
  return valid && position.target === window.location.href ? position : null;
}

function languagePosition(position: LanguagePosition) {
  if (position.edge === "top") return 0;
  if (position.edge === "bottom") return document.documentElement.scrollHeight - window.innerHeight;
  const regions = languageRegions();
  const index = regions.findIndex(region => region.key === position.region);
  if (index < 0) return position.fallbackY;
  const start = regions[index].top;
  const end = regions[index + 1]?.top ?? document.documentElement.scrollHeight;
  return start + position.progress * Math.max(1, end - start) - headerOffset();
}

// Used by delayed mobile-menu links as well as ordinary same-page anchors.
export function navigateToAnchor(href: string) {
  const url = new URL(href, window.location.href);
  savePosition(storageKey(), window.scrollY);
  if (url.href !== window.location.href) {
    window.history.pushState(window.history.state, "", url);
  }
  window.dispatchEvent(new Event(ANCHOR_NAVIGATION));
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const historyTraversalKey = useRef<string | null>(null);
  const languageArrival = useRef<LanguagePosition | null>(null);

  useEffect(() => {
    if (window.location.pathname !== pathname) return;
    const isInitialRoute = previousPathname.current === null || previousPathname.current === pathname;
    previousPathname.current = pathname;
    const navigation = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const legacy = window.performance as Performance & { navigation?: { type: number } };
    const isReload = isInitialRoute && (navigation?.type === "reload" || legacy.navigation?.type === 1);
    const isBackForward = (isInitialRoute && (navigation?.type === "back_forward" || legacy.navigation?.type === 2))
      || historyTraversalKey.current === storageKey();
    historyTraversalKey.current = null;
    // Capture before listeners can overwrite storage with hydration positions.
    const savedPosition = isReload || isBackForward ? readSavedPosition(storageKey()) : null;
    const handoff = languageArrival.current?.target === window.location.href
      ? languageArrival.current : takeLanguagePosition();
    languageArrival.current = handoff;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    let restoreFrame = 0;
    let restoring = false;
    let restoreKey = storageKey();
    let traversedUrl: string | null = null;

    const persist = () => {
      if (!restoring && window.location.pathname === pathname) savePosition(storageKey(), window.scrollY);
    };

    const stopRestore = (save = true) => {
      window.cancelAnimationFrame(restoreFrame);
      restoring = false;
      delete document.documentElement.dataset.scrollRestoring;
      if (save) languageArrival.current = null;
      if (save && storageKey() === restoreKey) persist();
    };

    const restore = (saved: number | null = null, language: LanguagePosition | null = null) => {
      stopRestore(false);
      restoreKey = storageKey();
      const anchorId = decodedHash();
      if (saved === null && language === null && !anchorId) return;
      restoring = true;
      document.documentElement.dataset.scrollRestoring = "";
      const started = window.performance.now();
      let stableFrames = 0;
      let previousGeometry = "";
      let disclosuresRestored = false;

      const align = () => {
        if (storageKey() !== restoreKey) {
          stopRestore(false);
          return;
        }
        if (language && !disclosuresRestored) {
          disclosuresRestored = true;
          document.querySelectorAll<HTMLButtonElement>("button[data-language-disclosure]").forEach(button => {
            const open = language.disclosures.includes(button.dataset.languageDisclosure!);
            if ((button.getAttribute("aria-expanded") === "true") !== open) button.click();
          });
        }
        const anchor = saved === null && language === null ? document.getElementById(anchorId) : null;
        const headerHeight = document.querySelector<HTMLElement>("[data-site-header]")?.getBoundingClientRect().height ?? 0;
        const target = saved ?? (language ? languagePosition(language) : anchor
          ? anchorPosition(anchor, anchorId, headerHeight)
          : null);
        const geometry = `${target}:${headerHeight}:${document.documentElement.scrollHeight}:${window.innerHeight}`;
        // Vinext also restores scroll after a history traversal's RSC commit.
        // Finish after that commit so its delayed scroll cannot win this race.
        const routerPending = (window as Window & { __VINEXT_RSC_PENDING__?: Promise<unknown> | null }).__VINEXT_RSC_PENDING__;
        const ready = document.readyState === "complete" && document.fonts?.status !== "loading" && !routerPending;
        const top = target === null ? null : clampedPosition(target);
        stableFrames = ready && top !== null && geometry === previousGeometry && Math.abs(window.scrollY - top) <= 1
          ? stableFrames + 1 : 0;
        previousGeometry = geometry;
        if (top !== null) window.scrollTo({ top, left: 0, behavior: "instant" });
        // Follow layout, router restoration and the shrinking header until stable.
        // The deadline prevents missing fonts/anchors from trapping scrolling.
        if (stableFrames >= 12 || (!routerPending && window.performance.now() - started > 4000)) {
          stopRestore();
        } else {
          restoreFrame = window.requestAnimationFrame(align);
        }
      };
      restoreFrame = window.requestAnimationFrame(align);
    };

    const onAnchorNavigation = () => restore();
    const onHashChange = () => {
      if (traversedUrl === window.location.href) {
        traversedUrl = null;
        return;
      }
      restore();
    };
    const onPopState = () => {
      historyTraversalKey.current = storageKey();
      traversedUrl = window.location.href;
      if (window.location.pathname === pathname) restore(readSavedPosition(storageKey()));
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
      event.preventDefault();
      navigateToAnchor(url.href);
      if (link.classList.contains("skip-link")) {
        const main = document.getElementById("main");
        if (main) {
          // Native fragment focus is replaced by our offset-aware scrolling.
          // Restore the skip link's keyboard handoff without adding a tab stop.
          if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
          main.focus({ preventScroll: true });
        }
      }
    };
    const onIntent = () => { if (restoring) stopRestore(); };
    const onVisibility = () => { if (document.visibilityState === "hidden") persist(); };

    restore(savedPosition, savedPosition === null ? handoff : null);
    window.addEventListener("scroll", persist, { passive: true });
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("click", onClick);
    window.addEventListener(ANCHOR_NAVIGATION, onAnchorNavigation);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pointerdown", onIntent, { passive: true });
    window.addEventListener("touchstart", onIntent, { passive: true });
    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("keydown", onIntent);

    return () => {
      stopRestore(false);
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("scroll", persist);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onClick);
      window.removeEventListener(ANCHOR_NAVIGATION, onAnchorNavigation);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pointerdown", onIntent);
      window.removeEventListener("touchstart", onIntent);
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("keydown", onIntent);
    };
  }, [pathname]);

  return null;
}
