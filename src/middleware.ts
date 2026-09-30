import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "erp_session";

const PUBLIC_PATHS = [
  "/login",
  "/unauthorized",
  "/api/health",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static files, Next.js internals, and image assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/health") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  let sessionUser: { id: string; role: string; permissions: string[] } | null = null;

  if (sessionCookie?.value) {
    try {
      sessionUser = JSON.parse(sessionCookie.value);
    } catch {
      sessionUser = null;
    }
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  // 2. Unauthenticated user
  if (!sessionUser || !sessionUser.id) {
    if (isPublic) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated user visiting /login -> redirect to dashboard
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Granular Route Permission Checks
  const userRole = sessionUser.role;
  const userPermissions = sessionUser.permissions || [];

  if (userRole !== "ADMIN") {
    // Settings check
    if (pathname.startsWith("/settings")) {
      const canAccessSettings =
        userPermissions.includes("settings.view") || userPermissions.includes("settings.edit");
      if (!canAccessSettings) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // Users check
    if (pathname.startsWith("/users")) {
      const canAccessUsers =
        userPermissions.includes("users.view") || userPermissions.includes("users.manage");
      if (!canAccessUsers) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
