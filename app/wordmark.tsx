import Link from "next/link";
import type { MouseEventHandler } from "react";

type WordmarkProps = {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function Wordmark({ href, onClick }: WordmarkProps) {
  return (
    <Link href={href} className="wordmark" aria-label="HOVER.STUDIO — Home" onClick={onClick}>
      <span className="wordmark-name">
        HOVER
        <span className="wordmark-underscore" aria-hidden="true" />
        <sup className="wordmark-trademark" aria-hidden="true">™</sup>
      </span>
    </Link>
  );
}
