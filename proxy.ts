import { NextRequest, NextResponse } from "next/server";
import { isProductionHost, SITE_ORIGIN } from "./app/site-config";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.trim().toLowerCase().replace(/:\d+$/, "");
  if (hostname === "www.byhover.studio") {
    return NextResponse.redirect(new URL(request.nextUrl.pathname + request.nextUrl.search, SITE_ORIGIN), 308);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hover-request-pathname", request.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!isProductionHost(request.headers.get("host"))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = { matcher: "/:path*" };
