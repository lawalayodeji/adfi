export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCampaign } from "@/lib/google-ads/campaigns";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  channelType: z.enum(["GOOGLE", "META", "TIKTOK", "EMAIL", "ORGANIC"]).default("GOOGLE"),
  budget: z.number().positive().optional().nullable(),
  targetUrl: z.string().url().optional().nullable(),
  goal: z.string().optional().nullable(),
  pushToGoogleAds: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { pushToGoogleAds, ...data } = parsed.data;

  let externalId: string | undefined;

  if (pushToGoogleAds && data.channelType === "GOOGLE") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleRefreshToken: true, googleAdsCustomerId: true },
    });
    if (user?.googleRefreshToken && user?.googleAdsCustomerId) {
      try {
        externalId = await createCampaign(user.googleRefreshToken, user.googleAdsCustomerId, {
          name: data.name,
          dailyBudget: data.budget ?? 10,
        });
      } catch (e) {
        console.error("Google Ads create failed", e);
      }
    }
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
      name: data.name,
      channelType: data.channelType,
      budget: data.budget ?? null,
      targetUrl: data.targetUrl ?? null,
      goal: data.goal ?? null,
      externalId: externalId ?? null,
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}
