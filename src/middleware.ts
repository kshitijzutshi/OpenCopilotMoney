import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// TODO: Set to false for production to require authentication
const BYPASS_AUTH_FOR_LOCAL_DEV = true;

export async function middleware(request: NextRequest) {
  // Bypass authentication for local development
  if (BYPASS_AUTH_FOR_LOCAL_DEV) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Apply middleware to specific routes
};
