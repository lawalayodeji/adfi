export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  googleAdsCustomerId: z.string().min(1),
  developerToken: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      googleAdsCustomerId: parsed.data.googleAdsCustomerId.replace(/-/g, ""),
      developerToken: parsed.data.developerToken,
    },
    select: { googleAdsCustomerId: true },
  });

  return NextResponse.json(updated);
}
