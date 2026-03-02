export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { resolveLink, recordClick, buildTrackingUrl } from "@/lib/tracking/links";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const link = await resolveLink(params.shortCode);

  if (!link) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const ip =
    req.nextUrl.searchParams.get("ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    undefined;

  const ua = req.nextUrl.searchParams.get("ua") || req.headers.get("user-agent") || undefined;
  const ref = req.nextUrl.searchParams.get("ref") || req.headers.get("referer") || undefined;

  // Detect device type from UA
  const device = /mobile|android|iphone|ipad/i.test(ua ?? "") ? "mobile" : "desktop";

  // Fire click in background (don't await to keep redirect fast)
  recordClick(link.id, { ip, userAgent: ua, referrer: ref, device }).catch(console.error);

  const destination = buildTrackingUrl(link.destinationUrl, link);

  return NextResponse.redirect(destination, { status: 302 });
}
