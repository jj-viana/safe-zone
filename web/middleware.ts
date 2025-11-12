import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "./lib/auth/constants";

const PROTECTED_PATHS = ["/admin"];

function hasSessionToken(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  return typeof token === "string" && token.length > 0;
}

function buildLoginUrl(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const redirectPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("redirectTo", redirectPath);
  return loginUrl;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

  if (isProtected && !hasSessionToken(request)) {
    return NextResponse.redirect(buildLoginUrl(request));
  }

  if (pathname === "/login" && hasSessionToken(request)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
