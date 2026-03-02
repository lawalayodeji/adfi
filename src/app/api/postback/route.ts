export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordConversion } from "@/lib/tracking/links";

/**
 * Postback endpoint — called by affiliate networks when a conversion fires.
 *
 * Example:
 *   GET /api/postback?cid={click_id}&revenue={revenue}&currency=USD&secret=YOUR_SECRET
 *
 * Set POSTBACK_SECRET in your .env to verify network calls.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const secret = searchParams.get("secret");
  if (process.env.POSTBACK_SECRET && secret !== process.env.POSTBACK_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const clickId = searchParams.get("cid");
  const revenue = parseFloat(searchParams.get("revenue") ?? "0");
  const currency = searchParams.get("currency") ?? "USD";

  if (!clickId) {
    return NextResponse.json({ error: "Missing cid" }, { status: 400 });
  }

  const click = await prisma.clickEvent.findUnique({
    where: { id: clickId },
    select: { id: true, linkId: true },
  });

  if (!click) {
    return NextResponse.json({ error: "Click not found" }, { status: 404 });
  }

  await recordConversion({
    linkId: click.linkId,
    clickId: click.id,
    value: revenue,
    currency,
    source: "POSTBACK",
  });

  return NextResponse.json({ ok: true });
}

// Also support POST for networks that POST conversion data
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const secret = body.secret ?? req.nextUrl.searchParams.get("secret");
  if (process.env.POSTBACK_SECRET && secret !== process.env.POSTBACK_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const { cid: clickId, revenue = 0, currency = "USD", ...metadata } = body;

  if (!clickId) {
    return NextResponse.json({ error: "Missing cid" }, { status: 400 });
  }

  const click = await prisma.clickEvent.findUnique({
    where: { id: clickId },
    select: { id: true, linkId: true },
  });

  if (!click) {
    return NextResponse.json({ error: "Click not found" }, { status: 404 });
  }

  await recordConversion({
    linkId: click.linkId,
    clickId: click.id,
    value: parseFloat(String(revenue)),
    currency,
    source: "POSTBACK",
    metadata,
  });

  return NextResponse.json({ ok: true });
}
