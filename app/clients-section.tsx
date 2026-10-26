"use client";

/* eslint-disable @next/next/no-img-element -- small original client logos with fixed dimensions */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { ClientLocale, ClientLogo, ClientTestimonial } from "./client-data";
import { UiArrow } from "./ui-arrow";
import styles from "./clients-section.module.css";

const copy = {
  ua: {
    title: "Наші клієнти",
    subheading: "Різні сфери. Спільна увага до результату.",
    description: "Створюємо сайти для різних напрямів — від енергетики, стоматології, виробництва й постачання обладнання до барів, ресторанів і персональних портфоліо. Починаємо із задачі: що потрібно пояснити, кому й до якої дії привести відвідувача. Тому структура та візуальна подача залежать від бізнесу, а не від готового шаблону.",
    clients: "Обрані клієнти",
    testimonial: "Відгук клієнта",
    previous: "Попередній відгук",
    next: "Наступний відгук",
    translated: "Переклад з української",
    status: (current: number, total: number) => `Відгук ${current} із ${total}`,
  },
  en: {
    title: "Our clients",
    subheading: "Different industries. The same attention to the outcome.",
    description: "We create websites across different fields — from energy, dentistry and equipment manufacturing and supply to bars, restaurants and personal portfolios. We start with the task: what needs to be communicated, to whom, and what the visitor should do next. The structure and visual direction follow the business, not a ready-made template.",
    clients: "Selected clients",
    testimonial: "Client testimonial",
    previous: "Previous testimonial",
    next: "Next testimonial",
    translated: "Translated from Ukrainian",
    status: (current: number, total: number) => `Testimonial ${current} of ${total}`,
  },
} as const;

type TransitionState = {
  activeId: string | null;
  nextId: string | null;
  phase: "idle" | "exit" | "enter";
  direction: -1 | 1;
  revision: number;
  hasChanged: boolean;
};

type ClientsSectionProps = {
  locale: ClientLocale;
  clients: readonly ClientLogo[];
  testimonials: readonly ClientTestimonial[];
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
}

function ClientMark({ client }: { client: ClientLogo }) {
  const crop = client.logoCrop;
  const mark = client.logoSrc ? (
    <span className={crop ? styles.logoViewport : styles.logoCanvas} style={crop ? { aspectRatio: `${crop.width} / ${crop.height}` } : undefined}>
    <img
      alt={client.name}
      className={crop ? styles.croppedLogoImage : styles.logoImage}
      style={crop ? {
        width: `${((client.logoWidth ?? crop.width) / crop.width) * 100}%`,
        left: `${(-crop.x / crop.width) * 100}%`,
        top: `${(-crop.y / crop.height) * 100}%`,
      } : undefined}
      width={client.logoWidth ?? 180}
      height={client.logoHeight ?? 48}
      loading="lazy"
      src={client.logoSrc}
    />
    </span>
  ) : client.wordmark?.length ? (
    <span className={styles.wordmark} aria-label={client.name}>
      {client.wordmark.map((part, index) => (
        <span key={`${part.text}-${index}`} style={part.color ? { color: part.color } : undefined} aria-hidden="true">{part.text}</span>
      ))}
    </span>
  ) : (
    <span className={styles.clientName}>{client.name}</span>
  );

  const className = `${styles.logoMark}${client.logoBackground ? ` ${styles.originalBackground}` : ""}`;
  const style = client.logoBackground ? { backgroundColor: client.logoBackground } : undefined;

  return client.caseHref ? (
    <Link className={className} href={client.caseHref} style={style} aria-label={client.name}>{mark}</Link>
  ) : (
    <span className={className} style={style}>{mark}</span>
  );
}

export function ClientsSection({ locale, clients, testimonials }: ClientsSectionProps) {
  const text = copy[locale];
  // The published entry point supplies approved data only; keep the component
  // safe when it is reused with an editorial or test collection as well.
  const published = testimonials.filter((item) => item.status === "published");
  const slides = published.map((review) => ({ id: review.id, review }));
  const itemIds = slides.map((item) => item.id);
  const itemsKey = JSON.stringify(itemIds);
  const [transition, setTransition] = useState<TransitionState>(() => ({
    activeId: slides[0]?.id ?? null,
    nextId: null,
    phase: "idle",
    direction: 1,
    revision: 0,
    hasChanged: false,
  }));

  const activeSlide = slides.find((item) => item.id === transition.activeId) ?? slides[0];
  const active = activeSlide?.review;
  const activeIndex = activeSlide ? slides.findIndex((item) => item.id === activeSlide.id) : -1;
  const hasControls = slides.length > 1;

  useEffect(() => {
    if (transition.phase === "idle") return;

    const validIds: string[] = JSON.parse(itemsKey);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setTransition((current) => {
        if (current.revision !== transition.revision || current.phase !== transition.phase) return current;
        if (current.phase === "exit") {
          const targetId = current.nextId && validIds.includes(current.nextId) ? current.nextId : validIds[0] ?? null;
          return { ...current, activeId: targetId, nextId: null, phase: reducedMotion ? "idle" : "enter", hasChanged: true };
        }
        return { ...current, phase: "idle" };
      });
    }, reducedMotion ? 0 : 150);

    return () => window.clearTimeout(timer);
  }, [itemsKey, transition.phase, transition.revision]);

  function changeTestimonial(direction: -1 | 1) {
    if (!hasControls) return;
    setTransition((current) => {
      // Accumulate rapid clicks against the requested item, rather than the
      // outgoing figure; the quote and its attribution commit together.
      const requestedIndex = itemIds.indexOf(current.nextId ?? current.activeId ?? "");
      const baseIndex = requestedIndex >= 0 ? requestedIndex : 0;
      const nextIndex = (baseIndex + direction + itemIds.length) % itemIds.length;
      return {
        activeId: itemIds.includes(current.activeId ?? "") ? current.activeId : itemIds[0],
        nextId: itemIds[nextIndex],
        phase: "exit",
        direction,
        revision: current.revision + 1,
        hasChanged: current.hasChanged,
      };
    });
  }

  return (
    <section
      id="clients"
      className={`${styles.section}${active ? "" : ` ${styles.withoutReviews}`}`}
      aria-labelledby="clients-heading"
      data-scroll-region="clients"
    >
      <div className={styles.composition}>
        <header className={styles.intro}>
          <p className={styles.sectionLabel}><span aria-hidden="true">09 / </span>{text.title}</p>
          <h2 className={styles.title} id="clients-heading">{text.title}</h2>
          <h3 className={styles.subheading}>{text.subheading}</h3>
          <p className={styles.description}>{text.description}</p>
        </header>

        {active ? (
          <div className={styles.review} data-has-controls={hasControls}>
            <div className={styles.reviewHeader}>
              <p className={styles.eyebrow}>{text.testimonial}</p>
              {hasControls ? <span className={styles.counter} aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span> : null}
            </div>

            <figure
              className={styles.record}
              data-testimonial-id={active.id}
              data-testimonial-position={String(activeIndex + 1)}
              data-transition={hasControls ? transition.phase : "idle"}
              style={{ "--slide-direction": transition.direction } as CSSProperties}
            >
              <blockquote className={styles.quote}>
                {active.quote.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </blockquote>
              <figcaption className={styles.attribution}>
                <span className={styles.avatarFrame} aria-hidden="true">
                  {active.avatarSrc ? (
                    <Image
                      alt=""
                      className={`${styles.avatar}${active.avatarCrop === "portrait" ? ` ${styles.portrait}` : active.avatarCrop === "framed" ? ` ${styles.framed}` : ""}`}
                      width={active.avatarCrop ? 112 : 56}
                      height={active.avatarCrop ? 112 : 56}
                      sizes={active.avatarCrop ? "112px" : "56px"}
                      loading="lazy"
                      src={active.avatarSrc}
                    />
                  ) : <span className={styles.initials}>{initials(active.name)}</span>}
                </span>
                <span className={styles.person}>
                  <span className={styles.name}>{active.name}</span>
                  {active.role || active.company ? <span className={styles.company}>{[active.role, active.company].filter(Boolean).join(" / ")}</span> : null}
                  {active.isTranslation ? <span className={styles.translation}>{text.translated}</span> : null}
                </span>
              </figcaption>
            </figure>

            {active.caseLinks?.length || hasControls ? (
              <div className={styles.reviewFooter}>
                <div className={styles.caseLinks}>
                  {active.caseLinks?.map((project) => (
                    <Link className={styles.caseLink} href={project.href} key={project.href}>{project.label}<UiArrow /></Link>
                  ))}
                </div>
                {hasControls ? (
                  <div className={styles.controls}>
                    <button className={styles.control} type="button" aria-label={text.previous} onClick={() => changeTestimonial(-1)}><UiArrow direction="left" /></button>
                    <button className={styles.control} type="button" aria-label={text.next} onClick={() => changeTestimonial(1)}><UiArrow direction="right" /></button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {hasControls ? <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">{transition.hasChanged ? text.status(activeIndex + 1, slides.length) : ""}</p> : null}
          </div>
        ) : null}

        {clients.length ? (
          <div className={styles.brands}>
            <p className={styles.eyebrow}>{text.clients}</p>
            <ul className={styles.logoGrid}>
              {clients.map((client) => (
                <li className={`${styles.logoItem}${client.logoCrop ? ` ${styles.wideLogoItem}` : ""}`} key={client.id} data-client-id={client.id} data-active={active?.relatedClientIds.includes(client.id) ?? false}>
                  <ClientMark client={client} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
