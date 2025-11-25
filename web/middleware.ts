import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "./lib/auth/constants";
import { verifyIdToken, type TokenValidationResult } from "./lib/auth/token-validator";

const PROTECTED_PATHS = ["/admin"];

function buildLoginUrl(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const redirectPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("redirectTo", redirectPath);
  return loginUrl;
}

async function validateRequestToken(request: NextRequest): Promise<TokenValidationResult> {
  const token = request.cookies.get(sessionCookieName)?.value;
  if (!token) {
    return { valid: false, error: new Error("Missing token") };
  }

  const result = await verifyIdToken(token);
  if (!result.valid) {
    console.warn("Invalid admin token rejected", result.error);
  }

  return result;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenResult = await validateRequestToken(request);

  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

  if (isProtected) {
    if (!tokenResult.valid) {
      const response = NextResponse.redirect(buildLoginUrl(request));
      response.cookies.delete(sessionCookieName);
      return response;
    }
  }

  if (pathname === "/login") {
    if (tokenResult.valid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (request.cookies.get(sessionCookieName)) {
      const response = NextResponse.next();
      response.cookies.delete(sessionCookieName);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
