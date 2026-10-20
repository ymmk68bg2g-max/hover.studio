"use client";

/* eslint-disable @next/next/no-img-element -- preserve the supplied screenshots at their native resolution. */
import { useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ProjectLocale } from "./projects";

const screens = [
  {
    id: "energy-scenarios",
    src: "/case/solarcity/energy-scenarios.png",
    width: 2048,
    height: 1131,
    ua: {
      title: "Енергетичні сценарії",
      alt: "Екран SolarCity з діаграмою добового циклу енергії та трьома сценаріями роботи енергетичного активу",
    },
    en: {
      title: "Energy scenarios",
      alt: "SolarCity screen showing the daily energy curve and three energy asset operating scenarios",
    },
  },
  {
    id: "development",
    src: "/case/solarcity/selected-development.png",
    width: 2048,
    height: 1133,
    ua: {
      title: "Девелопмент",
      alt: "Екран SolarCity з етапами девелопменту енергетичного активу — від стратегії до реалізації",
    },
    en: {
      title: "Development",
      alt: "SolarCity screen showing energy asset development stages, from strategy to implementation",
    },
  },
] as const;

function GalleryScreen({ screen, locale }: { screen: (typeof screens)[number]; locale: ProjectLocale }) {
  return <img src={screen.src} width={screen.width} height={screen.height} alt={screen[locale].alt} loading="lazy" decoding="async" draggable={false} />;
}

export function SolarCityScreenGallery({ locale }: { locale: ProjectLocale }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const active = screens[activeIndex];
  const isUa = locale === "ua";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="sc-gallery">
        {screens.map((screen, index) => (
          <figure className="sc-gallery-figure" key={screen.id}>
            <button
              className="sc-gallery-trigger"
              type="button"
              aria-haspopup="dialog"
              aria-label={`${isUa ? "Збільшити екран" : "Enlarge screen"}: ${screen[locale].title}`}
              onClick={(event) => {
                opener.current = event.currentTarget;
                setActiveIndex(index);
                setZoomed(false);
                setOpen(true);
              }}
            >
              <span className="sc-gallery-frame">
                <GalleryScreen screen={screen} locale={locale} />
              </span>
            </button>
            <figcaption className="sc-gallery-caption content-meta">
              <span>{String(index + 1).padStart(2, "0")} / {screen[locale].title.toUpperCase()}</span>
              <span aria-hidden="true">{isUa ? "ЗБІЛЬШИТИ" : "ENLARGE"}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <DialogContent
        className="featured-lightbox sc-gallery-dialog"
        showCloseButton={false}
        aria-describedby={undefined}
        data-zoomed={zoomed}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <div className="featured-lightbox-toolbar sc-gallery-toolbar">
          <DialogTitle>SOLARCITY / {active[locale].title}</DialogTitle>
          <button type="button" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}>
            {zoomed ? isUa ? "ВМІСТИТИ" : "FIT" : "100%"}
          </button>
          <DialogClose asChild>
            <button type="button">{isUa ? "ЗАКРИТИ" : "CLOSE"}</button>
          </DialogClose>
        </div>
        <div className="featured-lightbox-viewport sc-gallery-viewport">
          <div className="featured-lightbox-media sc-gallery-media">
            <GalleryScreen screen={active} locale={locale} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
