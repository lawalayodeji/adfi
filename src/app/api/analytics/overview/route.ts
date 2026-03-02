import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, format, eachDayOfInterval } from "date-fns";
import { calcROAS } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30");
  const since = subDays(new Date(), days);

  const [clickEvents, conversionEvents, campaignMetrics] = await Promise.all([
    prisma.clickEvent.findMany({
      where: { link: { userId: session.user.id }, timestamp: { gte: since } },
      select: { timestamp: true },
    }),
    prisma.conversionEvent.findMany({
      where: { link: { userId: session.user.id }, timestamp: { gte: since } },
      select: { timestamp: true, value: true },
    }),
    prisma.campaignMetric.findMany({
      where: { campaign: { userId: session.user.id }, date: { gte: since } },
      select: { date: true, spend: true },
    }),
  ]);

  // Build daily buckets
  const dateRange = eachDayOfInterval({ start: since, end: new Date() });
  const clicksByDay = new Map<string, number>();
  const convByDay = new Map<string, number>();
  const revenueByDay = new Map<string, number>();
  const spendByDay = new Map<string, number>();

  for (const d of dateRange) {
    const key = format(d, "MMM d");
    clicksByDay.set(key, 0);
    convByDay.set(key, 0);
    revenueByDay.set(key, 0);
    spendByDay.set(key, 0);
  }

  for (const e of clickEvents) {
    const key = format(new Date(e.timestamp), "MMM d");
    clicksByDay.set(key, (clicksByDay.get(key) ?? 0) + 1);
  }

  for (const e of conversionEvents) {
    const key = format(new Date(e.timestamp), "MMM d");
    convByDay.set(key, (convByDay.get(key) ?? 0) + 1);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + e.value);
  }

  for (const m of campaignMetrics) {
    const key = format(new Date(m.date), "MMM d");
    spendByDay.set(key, (spendByDay.get(key) ?? 0) + m.spend);
  }

  const data = dateRange.map((d) => {
    const key = format(d, "MMM d");
    return {
      date: key,
      clicks: clicksByDay.get(key) ?? 0,
      conversions: convByDay.get(key) ?? 0,
      revenue: revenueByDay.get(key) ?? 0,
      spend: spendByDay.get(key) ?? 0,
    };
  });

  const totals = data.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks,
      conversions: acc.conversions + r.conversions,
      revenue: acc.revenue + r.revenue,
      spend: acc.spend + r.spend,
      roas: 0,
    }),
    { clicks: 0, conversions: 0, revenue: 0, spend: 0, roas: 0 }
  );
  totals.roas = calcROAS(totals.revenue, totals.spend);

  return NextResponse.json({ data, totals });
}
