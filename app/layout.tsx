import type { Metadata } from "next";
import "./globals.css";
import { ScrollRestoration } from "./scroll-restoration";
import { SitePageEnd } from "./site-page-end";
import { getRequestIndexing, getRequestLocale } from "./request-locale";
import { SITE_ORIGIN } from "./site-config";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: "HOVER.STUDIO",
    description: "Independent digital studio for ambitious businesses.",
    robots: await getRequestIndexing(),
    icons: {
      icon: "/favicon.svg?v=3",
      shortcut: "/favicon.svg?v=3",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fallbackLocale = await getRequestLocale();
  return (
    <html lang={fallbackLocale === "ua" ? "uk" : "en"} suppressHydrationWarning>
      <body className="antialiased">
        <ScrollRestoration />
        {children}
        <SitePageEnd fallbackLocale={fallbackLocale} />
      </body>
    </html>
  );
}
