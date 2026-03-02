import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30");
  const since = subDays(new Date(), days);

  // Get clicks only on links that belong to ORGANIC campaigns
  const clicks = await prisma.clickEvent.findMany({
    where: {
      timestamp: { gte: since },
      link: {
        userId: session.user.id,
        campaign: { channelType: "ORGANIC" },
      },
    },
    select: { referrer: true, device: true, timestamp: true },
  });

  // Referrer breakdown
  const referrerMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();

  for (const c of clicks) {
    const ref = parseReferrer(c.referrer);
    referrerMap.set(ref, (referrerMap.get(ref) ?? 0) + 1);

    const dev = c.device ?? "unknown";
    deviceMap.set(dev, (deviceMap.get(dev) ?? 0) + 1);
  }

  const referrers = Array.from(referrerMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const devices = Array.from(deviceMap.entries()).map(([device, count]) => ({ device, count }));

  // Organic conversions
  const conversions = await prisma.conversionEvent.aggregate({
    where: {
      timestamp: { gte: since },
      link: {
        userId: session.user.id,
        campaign: { channelType: "ORGANIC" },
      },
    },
    _sum: { value: true },
    _count: true,
  });

  return NextResponse.json({
    totalClicks: clicks.length,
    totalConversions: conversions._count,
    totalRevenue: conversions._sum.value ?? 0,
    referrers,
    devices,
  });
}

function parseReferrer(ref: string | null | undefined): string {
  if (!ref) return "Direct / None";
  try {
    const url = new URL(ref);
    const host = url.hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google Search";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("twitter") || host.includes("x.com")) return "X / Twitter";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("pinterest")) return "Pinterest";
    return host;
  } catch {
    return "Direct / None";
  }
}
