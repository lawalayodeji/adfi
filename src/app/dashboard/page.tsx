import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { OrganicInsights } from "@/components/dashboard/organic-insights";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, MousePointerClick, Repeat2, DollarSign } from "lucide-react";

async function getStats(userId: string) {
  const [links, campaigns] = await Promise.all([
    prisma.affiliateLink.aggregate({
      where: { userId },
      _sum: { clicks: true, conversions: true, revenue: true },
    }),
    prisma.campaign.count({ where: { userId, status: "ACTIVE" } }),
  ]);

  const totalClicks = links._sum.clicks ?? 0;
  const totalConversions = links._sum.conversions ?? 0;
  const totalRevenue = links._sum.revenue ?? 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  return { totalClicks, totalConversions, totalRevenue, conversionRate, activeCampaigns: campaigns };
}

async function getChartData(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const events = await prisma.clickEvent.groupBy({
    by: ["timestamp"],
    where: { link: { userId }, timestamp: { gte: since } },
    _count: true,
  });

  return events;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const stats = await getStats(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name?.split(" ")[0]}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clicks"
          value={formatNumber(stats.totalClicks)}
          icon={MousePointerClick}
          description="All-time across all links"
        />
        <StatCard
          title="Conversions"
          value={formatNumber(stats.totalConversions)}
          icon={Repeat2}
          description={`${stats.conversionRate.toFixed(1)}% conversion rate`}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          description="Total affiliate revenue"
        />
        <StatCard
          title="Active Campaigns"
          value={String(stats.activeCampaigns)}
          icon={TrendingUp}
          description="Running right now"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart userId={session.user.id} />
        </div>
        <div>
          <RecentCampaigns userId={session.user.id} />
        </div>
      </div>

      <OrganicInsights />
    </div>
  );
}
