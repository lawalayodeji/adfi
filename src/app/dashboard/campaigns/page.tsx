import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { NewCampaignButton } from "@/components/campaigns/new-campaign-button";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { affiliateLinks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { googleAdsCustomerId: true, googleRefreshToken: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your advertising campaigns</p>
        </div>
        <NewCampaignButton hasGoogleAds={!!user?.googleAdsCustomerId} />
      </div>
      <CampaignsTable campaigns={campaigns} />
    </div>
  );
}
