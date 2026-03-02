export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAffiliateLink } from "@/lib/tracking/links";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  destinationUrl: z.string().url(),
  campaignId: z.string().optional().nullable(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const link = await createAffiliateLink({
    userId: session.user.id,
    ...parsed.data,
    campaignId: parsed.data.campaignId ?? undefined,
  });

  return NextResponse.json(link, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.affiliateLink.findMany({
    where: { userId: session.user.id },
    include: { campaign: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}
