import type { SiteLocale } from "./site-chrome";

export const TELEGRAM_URL = "https://t.me/hoverstudiobot";

export const telegramCopy = {
  ua: {
    menu: "Написати в Telegram",
    label: "Написати HOVER.STUDIO у Telegram",
    tooltip: "Обговорімо ваш проєкт",
  },
  en: {
    menu: "Message us on Telegram",
    label: "Message HOVER.STUDIO on Telegram",
    tooltip: "Let’s discuss your project",
  },
} as const;

export function TelegramIcon() {
  return <span className="telegram-icon" aria-hidden="true" />;
}

export function TelegramLink({ locale, placement, onClick }: {
  locale: SiteLocale;
  placement: "footer" | "menu";
  onClick?: () => void;
}) {
  return (
    <a
      className={`telegram-link telegram-link--${placement}`}
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      <span className="telegram-link__icon"><TelegramIcon /></span>
      <span className="telegram-link__label">{placement === "menu" ? telegramCopy[locale].menu : "Telegram"}</span>
    </a>
  );
}
