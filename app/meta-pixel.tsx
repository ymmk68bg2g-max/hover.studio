"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type MetaPixelWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  __hoverMetaPixel?: { lastPath: string };
};

export function MetaPixelPageViews() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || window.location.pathname !== pathname) return;
    const pixelWindow = window as MetaPixelWindow;
    const state = pixelWindow.__hoverMetaPixel;
    if (!state || state.lastPath === pathname || typeof pixelWindow.fbq !== "function") return;

    // The initial view is queued in the head. This also guards effect replays.
    state.lastPath = pathname;
    try {
      pixelWindow.fbq("track", "PageView");
    } catch {
      // A blocked advertising tool must not interrupt navigation.
    }
  }, [pathname]);

  return null;
}
