"use client";

/* eslint-disable @next/next/no-img-element -- show the approved master pages without transforming their pixels. */
import { useEffect, useId, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ProjectLocale } from "./projects";
import { UiArrow } from "./ui-arrow";

const pages = [
  {
    id: "commercial-pipeline",
    src: "/case/blueprint/commercial-pipeline-master.png",
    previewSrc: "/case/blueprint/commercial-pipeline-master.png",
    width: 2048,
    height: 1365,
    ua: { title: "Комерційний pipeline", label: "СИСТЕМА / ПРОЦЕС", alt: "The Commercial Pipeline — оригінальна сторінка Blueprint із десятьма етапами виробничого процесу" },
    en: { title: "The Commercial Pipeline", label: "SYSTEM / PROCESS", alt: "The Commercial Pipeline — original Blueprint page showing ten stages of the production process" },
  },
  {
    id: "mira-keyframe-breakdown",
    src: "/case/blueprint/mira-keyframe-breakdown-master.png",
    previewSrc: "/case/blueprint/mira-keyframe-breakdown-preview-1200.webp",
    width: 1638,
    height: 2048,
    ua: { title: "MIRA — розбір ключових кадрів", label: "КЕЙС / КЛЮЧОВІ КАДРИ", alt: "MIRA Keyframe Breakdown — оригінальна сторінка Blueprint з аналізом композиції та стабільності персонажа" },
    en: { title: "MIRA — Keyframe Breakdown", label: "CASE / KEYFRAMES", alt: "MIRA Keyframe Breakdown — original Blueprint page analysing composition and character consistency" },
  },
  {
    id: "tissot-product-fidelity",
    src: "/case/blueprint/tissot-product-fidelity-master.png",
    previewSrc: "/case/blueprint/tissot-product-fidelity-preview-1200.webp",
    width: 1638,
    height: 2048,
    ua: { title: "TISSOT — точність продукту", label: "КЕЙС / КОНТРОЛЬ ПРОДУКТУ", alt: "TISSOT Product Fidelity — оригінальна сторінка Blueprint з перевіркою типографіки, маркування та деталей продукту" },
    en: { title: "TISSOT — Product Fidelity", label: "CASE / PRODUCT CONTROL", alt: "TISSOT Product Fidelity — original Blueprint page checking typography, markings and product details" },
  },
] as const;

export function BlueprintPreview({ locale }: { locale: ProjectLocale }) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const previewId = "bp-preview-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const page = pages[selected];
  const copy = page[locale];
  const isUa = locale === "ua";

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollLeft = 0;
      viewport.current.scrollTop = 0;
    }
  }, [open, zoomed]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="bp-preview" data-blueprint-preview>
        <p className="bp-preview-kicker">AI COMMERCIAL BLUEPRINT / PREVIEW</p>
        <div className="bp-preview-controls" role="group" aria-label={isUa ? "Оберіть сторінку Blueprint" : "Choose a Blueprint page"}>
          {pages.map((entry, index) => (
            <button
              className="bp-preview-option"
              type="button"
              key={entry.id}
              aria-pressed={selected === index}
              aria-controls={previewId}
              onClick={() => setSelected(index)}
            >
              <span className="bp-preview-number">0{index + 1}</span>
              <span>{entry[locale].title}</span>
            </button>
          ))}
        </div>
        <figure className="bp-preview-page" id={previewId}>
          <button
            className="bp-preview-sheet"
            type="button"
            aria-haspopup="dialog"
            aria-label={`${isUa ? "Збільшити оригінальну сторінку" : "Enlarge original page"}: ${copy.title}`}
            onClick={(event) => {
              opener.current = event.currentTarget;
              setZoomed(false);
              setOpen(true);
            }}
          >
            <img src={page.previewSrc} width={page.width} height={page.height} alt={copy.alt} loading="lazy" decoding="async" draggable={false} />
          </button>
          <figcaption className="bp-preview-caption">
            <div>
              <p className="bp-preview-title" aria-live="polite" aria-atomic="true">0{selected + 1} / {copy.title}</p>
              <span className="bp-preview-label">{copy.label}</span>
            </div>
            <span className="bp-preview-enlarge" aria-hidden="true">{isUa ? "ЗБІЛЬШИТИ" : "ENLARGE"} <UiArrow /></span>
          </figcaption>
        </figure>
        <p className="bp-preview-hint">{isUa ? "Оберіть сторінку та натисніть на неї, щоб розглянути оригінал." : "Choose a page and select it to inspect the original."}</p>
      </div>

      <DialogContent
        className="featured-lightbox bp-master"
        showCloseButton={false}
        aria-describedby={undefined}
        data-zoomed={zoomed}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <div className="featured-lightbox-toolbar bp-master-toolbar">
          <DialogTitle>BLUEPRINT / {copy.title}</DialogTitle>
          <button
            type="button"
            aria-pressed={zoomed}
            aria-label={zoomed ? (isUa ? "Вмістити всю сторінку" : "Fit the whole page") : (isUa ? "Показати сторінку в оригінальному розмірі" : "Show the page at its original size")}
            onClick={() => setZoomed(value => !value)}
          >
            {zoomed ? (isUa ? "ВМІСТИТИ" : "FIT") : "100%"}
          </button>
          <DialogClose asChild>
            <button type="button">{isUa ? "ЗАКРИТИ" : "CLOSE"}</button>
          </DialogClose>
        </div>
        <div
          className="featured-lightbox-viewport bp-master-viewport"
          ref={viewport}
          role="region"
          tabIndex={0}
          aria-label={isUa ? "Оригінальна сторінка — прокручуйте у масштабі 100%" : "Original page — scroll when viewing at 100%"}
        >
          <div className="featured-lightbox-media bp-master-media">
            <img src={page.src} width={page.width} height={page.height} alt={copy.alt} decoding="async" draggable={false} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
