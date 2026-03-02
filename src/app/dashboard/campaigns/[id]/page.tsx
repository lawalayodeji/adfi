import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatNumber, calcROAS } from "@/lib/utils";
import { MousePointerClick, Repeat2, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  ACTIVE: "success",
  PAUSED: "warning",
  ENDED: "destructive",
  DRAFT: "secondary",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      affiliateLinks: {
        orderBy: { clicks: "desc" },
        take: 10,
      },
      metrics: { orderBy: { date: "desc" }, take: 7 },
    },
  });

  if (!campaign) notFound();

  const totalClicks = campaign.affiliateLinks.reduce((s, l) => s + l.clicks, 0);
  const totalConversions = campaign.affiliateLinks.reduce((s, l) => s + l.conversions, 0);
  const totalRevenue = campaign.affiliateLinks.reduce((s, l) => s + l.revenue, 0);
  const totalSpend = campaign.metrics.reduce((s, m) => s + m.spend, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/campaigns" className="text-muted-foreground hover:text-foreground text-sm">
          ← Campaigns
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        <Badge variant={statusVariant[campaign.status] ?? "secondary"}>{campaign.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Clicks" value={formatNumber(totalClicks)} icon={MousePointerClick} />
        <StatCard title="Conversions" value={formatNumber(totalConversions)} icon={Repeat2} />
        <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
        <StatCard title="ROAS" value={`${calcROAS(totalRevenue, totalSpend).toFixed(2)}x`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Links</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {campaign.affiliateLinks.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No links for this campaign.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Clicks</th>
                  <th className="p-4 text-left font-medium">Conversions</th>
                  <th className="p-4 text-left font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {campaign.affiliateLinks.map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{l.name}</td>
                    <td className="p-4">{formatNumber(l.clicks)}</td>
                    <td className="p-4">{formatNumber(l.conversions)}</td>
                    <td className="p-4">{formatCurrency(l.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
