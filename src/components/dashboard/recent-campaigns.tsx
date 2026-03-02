import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  ACTIVE: "success",
  PAUSED: "warning",
  ENDED: "destructive",
  DRAFT: "secondary",
};

export async function RecentCampaigns({ userId }: { userId: string }) {
  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No campaigns yet.</p>
        ) : (
          <ul className="space-y-3">
            {campaigns.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <Link
                  href={`/dashboard/campaigns/${c.id}`}
                  className="text-sm font-medium hover:underline truncate max-w-[150px]"
                >
                  {c.name}
                </Link>
                <Badge variant={statusVariant[c.status] ?? "secondary"}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/dashboard/campaigns"
          className="mt-4 block text-xs text-primary hover:underline"
        >
          View all campaigns →
        </Link>
      </CardContent>
    </Card>
  );
}
