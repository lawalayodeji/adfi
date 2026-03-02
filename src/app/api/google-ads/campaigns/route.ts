export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listCampaigns } from "@/lib/google-ads/campaigns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { googleRefreshToken: true, googleAdsCustomerId: true },
  });

  if (!user?.googleRefreshToken || !user?.googleAdsCustomerId) {
    return NextResponse.json({ error: "Google Ads not connected" }, { status: 400 });
  }

  try {
    const campaigns = await listCampaigns(user.googleRefreshToken, user.googleAdsCustomerId);
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
