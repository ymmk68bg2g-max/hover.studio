"use client";

import { useId } from "react";

// The current control is copied directly from the approved screenshot. This
// SVG layer preserves both original screenshots and their native resolution.
const placements = {
  desktop: { x: 1669, y: 11, width: 110, height: 52 },
  tablet: { x: 1127.8, y: 119.56, width: 158.4, height: 74.88 },
} as const;

export function SolarCityScreenLanguage({ kind }: { kind: keyof typeof placements }) {
  const clipId = "sc-language-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg
      {...placements[kind]}
      viewBox="1639 13 110 52"
      data-solarcity-language-patch={kind}
      aria-hidden="true"
      focusable="false"
      overflow="hidden"
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x="1639" y="13" width="110" height="52" rx="26" />
        </clipPath>
      </defs>
      <image
        href="/case/solarcity/selected-development.png"
        width="2048"
        height="1133"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}
