/* eslint-disable @next/next/no-img-element -- local testimonial avatars */
import Link from "next/link";
import { testimonialsMode } from "./client-experience-config";
import { publishedTestimonials } from "./testimonial-data";

export type TestimonialsLocale = "ua" | "en";
export type TestimonialsMode = "demo" | "published" | "hidden";

type TestimonialBase = {
  id: string;
  avatarAlt: string;
  avatarCrop?: "portrait" | "framed";
  avatarSrc: string;
  company?: string;
  name: string;
  quote: string;
  relatedProject?: {
    href: string;
    label: string;
  };
  role: string;
};

export type PublishedTestimonial = TestimonialBase & {
  approval: "approved";
};

export type DemoTestimonial = TestimonialBase & {
  approval: "demo";
};

export type TestimonialsConfig =
  | { mode: "hidden" }
  | { items: PublishedTestimonial[]; mode: "published" }
  | { items: (PublishedTestimonial | DemoTestimonial)[]; mode: "demo" };

const labels: Record<
  TestimonialsLocale,
  { demo: string; heading: string }
> = {
  ua: {
    demo: "Демонстраційний відгук",
    heading: "Відгуки",
  },
  en: {
    demo: "Demo testimonial",
    heading: "Client feedback",
  },
};

function getTestimonialsConfig(locale: TestimonialsLocale): TestimonialsConfig {
  const demoItems: Record<TestimonialsLocale, DemoTestimonial[]> = {
    ua: [
      {
        id: "demo-profile-02",
        approval: "demo",
        avatarAlt: "Згенерований портрет вигаданого демо-профілю",
        avatarSrc: "/testimonials/demo-profile-02.webp",
        company: "ДЕМО-МАТЕРІАЛ",
        name: "ДЕМО-ПРОФІЛЬ 02",
        quote:
          "Від першого прототипу до запуску процес був зрозумілим і послідовним. Сайт відчувається впевнено, а адаптивна версія зберегла характер дизайну.",
        role: "УМОВНИЙ КЛІЄНТ",
      },
    ],
    en: [
      {
        id: "demo-profile-02",
        approval: "demo",
        avatarAlt: "Generated portrait of a fictional demo profile",
        avatarSrc: "/testimonials/demo-profile-02.webp",
        company: "DEMO CONTENT",
        name: "DEMO PROFILE 02",
        quote:
          "From the first prototype to launch, the process felt clear and consistent. The site feels confident, and the responsive version preserves the character of the design.",
        role: "FICTIONAL CLIENT",
      },
    ],
  };

  // Approved client feedback stays distinct from any remaining labelled demos.
  if (testimonialsMode === "published") return { mode: "published", items: publishedTestimonials[locale] };
  if (testimonialsMode === "demo") return { mode: "demo", items: [...publishedTestimonials[locale], ...demoItems[locale]] };
  return { mode: "hidden" };
}

export function Testimonials({ locale }: { locale: TestimonialsLocale }) {
  const config = getTestimonialsConfig(locale);

  if (config.mode === "hidden" || config.items.length === 0) {
    return null;
  }

  const copy = labels[locale];
  const headingId = `testimonials-heading-${locale}`;

  return (
    <section className="testimonials" aria-labelledby={headingId} data-scroll-region="testimonials">
      <header className="testimonials-header">
        <h2 className="testimonials-title section-heading home-display-heading" id={headingId}>
          {copy.heading}
        </h2>
      </header>

      <div className="testimonials-list">
        {config.items.map((item) => (
          <figure className="testimonial" data-approval={item.approval} key={item.id}>
            <div className="testimonial-person">
              <span className="testimonial-avatar-frame">
                <img
                  alt={item.avatarAlt}
                  className={`testimonial-avatar${item.avatarCrop ? ` testimonial-avatar--${item.avatarCrop}` : ""}`}
                  height="56"
                  loading="lazy"
                  src={item.avatarSrc}
                  width="56"
                />
              </span>
              <figcaption className="testimonial-attribution">
                <strong className="testimonial-name">{item.name}</strong>
                <span className="testimonial-role">
                  {item.role}{item.company ? ` / ${item.company}` : ""}
                </span>
              </figcaption>
            </div>

            {item.approval === "demo" ? (
              <p className="testimonial-demo-label">{copy.demo}</p>
            ) : null}
            <blockquote className="testimonial-quote">
              {item.quote.split("\n\n").map((paragraph, index) => <p className="section-quote" key={index}>{paragraph}</p>)}
            </blockquote>
            {item.relatedProject ? (
              <Link
                className="testimonial-project"
                href={item.relatedProject.href}
              >
                {item.relatedProject.label}
              </Link>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

export { getTestimonialsConfig };
