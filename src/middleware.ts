import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Short link redirector — runs at the edge
  if (pathname.startsWith("/go/")) {
    const shortCode = pathname.replace("/go/", "");
    if (shortCode) {
      const trackUrl = new URL(`/api/track/${shortCode}`, request.url);
      // Forward click metadata
      trackUrl.searchParams.set("ref", request.headers.get("referer") ?? "");
      trackUrl.searchParams.set("ua", request.headers.get("user-agent") ?? "");
      trackUrl.searchParams.set("ip", request.headers.get("x-forwarded-for") ?? "");
      return NextResponse.rewrite(trackUrl);
    }
  }

  // Protect dashboard routes
  const publicPaths = ["/login", "/api/auth", "/api/track", "/api/postback", "/go"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isPublic) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
