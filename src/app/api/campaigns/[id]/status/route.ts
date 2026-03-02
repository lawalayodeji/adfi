export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pauseCampaign, enableCampaign } from "@/lib/google-ads/campaigns";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  if (!["ACTIVE", "PAUSED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Sync to Google Ads if connected
  if (campaign.externalId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleRefreshToken: true, googleAdsCustomerId: true },
    });
    if (user?.googleRefreshToken && user?.googleAdsCustomerId) {
      try {
        if (status === "PAUSED") {
          await pauseCampaign(user.googleRefreshToken, user.googleAdsCustomerId, campaign.externalId);
        } else {
          await enableCampaign(user.googleRefreshToken, user.googleAdsCustomerId, campaign.externalId);
        }
      } catch (e) {
        console.error("Google Ads status sync failed", e);
      }
    }
  }

  const updated = await prisma.campaign.update({
    where: { id: params.id },
    data: { status: status as any },
  });

  return NextResponse.json(updated);
}
