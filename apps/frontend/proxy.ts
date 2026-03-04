import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/settings");
  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("brevet_session");
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/settings/:path*"],
};
