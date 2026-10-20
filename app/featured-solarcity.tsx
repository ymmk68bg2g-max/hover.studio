"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ScreenAsset = {
  key: "desktop" | "tablet" | "phone";
  src: string;
  width: number;
  height: number;
  ua: string;
  en: string;
  viewBox?: string;
  sourceWidth: number;
  sourceHeight: number;
};

const screens = [
  { key: "desktop", src: "/case/solarcity/energy-scenarios.png", width: 2048, height: 1131, ua: "Комп’ютер", en: "Desktop", viewBox: undefined, sourceWidth: 2048, sourceHeight: 1131 },
  { key: "tablet", src: "/case/solarcity/featured-tablet-hybrid.jpg", width: 930, height: 1248, ua: "Планшет", en: "Tablet", viewBox: "0 0 930 1248", sourceWidth: 930, sourceHeight: 1280 },
  { key: "phone", src: "/case/solarcity/featured-mobile-scale.png", width: 1014, height: 1800, ua: "Телефон", en: "Mobile", viewBox: "0 0 1014 1800", sourceWidth: 1014, sourceHeight: 2048 },
] as const;

const responsiveScreens: readonly ScreenAsset[] = [
  screens[1],
  { key: "phone", src: "/case/solarcity/responsive-mobile.png", width: 717, height: 1299, ua: "Телефон", en: "Mobile", sourceWidth: 717, sourceHeight: 1299 },
];

function Screen({ screen, locale }: { screen: ScreenAsset; locale: "ua" | "en" }) {
  const label = `SOLARCITY / ${screen[locale]}`;
  if (!screen.viewBox) {
    return <img src={screen.src} width={screen.width} height={screen.height} alt={label} loading="lazy" decoding="async" draggable={false} />;
  }
  return (
    <svg viewBox={screen.viewBox} width={screen.width} height={screen.height} role="img" aria-label={label}>
      <image href={screen.src} width={screen.sourceWidth} height={screen.sourceHeight} />
    </svg>
  );
}

export function FeaturedSolarcity({ locale, reveal = true, variant = "featured" }: { locale: "ua" | "en"; reveal?: boolean; variant?: "featured" | "responsive" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [motionReduced, setMotionReduced] = useState(true);
  const [motionPlaying, setMotionPlaying] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const assets: readonly ScreenAsset[] = variant === "responsive" ? responsiveScreens : screens;
  const screen = assets[active] ?? assets[0];

  useEffect(() => {
    if (variant !== "featured" || !stageRef.current) return;
    const stage = stageRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    const sync = () => {
      if (disposed) return;
      setMotionReduced(reducedMotion.matches);
      setMotionPlaying(visible && document.visibilityState === "visible" && !reducedMotion.matches && !motionPaused && !open);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      sync();
    }, { threshold: [0, 0.2] });
    observer.observe(stage);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [variant, motionPaused, open]);

  const trigger = (index: number) => (
    <button
      key={assets[index].key}
      className={variant === "responsive" ? "sc-device sc-device-" + assets[index].key : index === 0 ? "featured-screen" : `featured-${assets[index].key === "phone" ? "phone" : "tablet"}`}
      type="button"
      aria-label={`${locale === "ua" ? "Збільшити екран" : "Enlarge screen"}: ${assets[index][locale]}`}
      aria-haspopup="dialog"
      data-featured-device={variant === "featured" ? assets[index].key : undefined}
      onClick={(event) => { opener.current = event.currentTarget; setZoomed(false); setActive(index); setOpen(true); }}
    >
      <Screen screen={assets[index]} locale={locale} />
      {variant === "featured" && <span className="featured-device-trace" aria-hidden="true">
        <svg focusable="false"><rect x="1" y="1" width="100%" height="100%" pathLength="100" /></svg>
      </span>}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {variant === "responsive" ? <div className={"sc-devices-stage" + (reveal ? " reveal" : "")} data-solarcity-devices role="group" aria-label={locale === "ua" ? "SolarCity на планшеті й телефоні" : "SolarCity on tablet and mobile"}>
        <div className="sc-devices-pair">{trigger(0)}{trigger(1)}</div>
      </div> : <div className={`featured-stage${reveal ? " reveal" : ""}`} ref={stageRef} data-featured-motion data-motion-playing={motionPlaying} data-motion-reduced={motionReduced}>
        {trigger(0)}
        <div className="device-stack">{trigger(1)}{trigger(2)}</div>
        <button
          className="featured-motion-toggle"
          type="button"
          hidden={motionReduced}
          aria-pressed={motionPaused}
          aria-label={locale === "ua" ? motionPaused ? "Відтворити анімацію екранів" : "Призупинити анімацію екранів" : motionPaused ? "Play screen animation" : "Pause screen animation"}
          onClick={() => setMotionPaused(value => !value)}
        >
          {locale === "ua" ? motionPaused ? "ВІДТВОРИТИ" : "ПАУЗА" : motionPaused ? "PLAY" : "PAUSE"}
        </button>
      </div>}
      <DialogContent
        className="featured-lightbox"
        showCloseButton={false}
        aria-describedby={undefined}
        data-zoomed={zoomed}
        onCloseAutoFocus={(event) => { event.preventDefault(); opener.current?.focus(); }}
      >
        <div className="featured-lightbox-toolbar">
          <DialogTitle>SOLARCITY / {screen[locale]}</DialogTitle>
          <button type="button" aria-pressed={zoomed} onClick={() => setZoomed(value => !value)}>
            {zoomed ? locale === "ua" ? "ВМІСТИТИ" : "FIT" : "100%"}
          </button>
          <DialogClose asChild><button type="button">{locale === "ua" ? "ЗАКРИТИ" : "CLOSE"}</button></DialogClose>
        </div>
        <div className="featured-lightbox-viewport">
          <div className="featured-lightbox-media"><Screen screen={screen} locale={locale} /></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
