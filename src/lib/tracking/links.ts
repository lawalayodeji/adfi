import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { buildUtmUrl } from "@/lib/utils";

export async function createAffiliateLink(params: {
  userId: string;
  name: string;
  destinationUrl: string;
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}) {
  const shortCode = nanoid(8);

  return prisma.affiliateLink.create({
    data: {
      userId: params.userId,
      campaignId: params.campaignId,
      name: params.name,
      shortCode,
      destinationUrl: params.destinationUrl,
      utmSource: params.utmSource,
      utmMedium: params.utmMedium,
      utmCampaign: params.utmCampaign,
      utmContent: params.utmContent,
      utmTerm: params.utmTerm,
    },
  });
}

export async function resolveLink(shortCode: string) {
  return prisma.affiliateLink.findUnique({
    where: { shortCode, isActive: true },
  });
}

export async function recordClick(
  linkId: string,
  meta: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    country?: string;
    device?: string;
  }
) {
  const [click] = await Promise.all([
    prisma.clickEvent.create({
      data: { linkId, ...meta },
    }),
    prisma.affiliateLink.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    }),
  ]);
  return click;
}

export async function recordConversion(params: {
  linkId: string;
  clickId?: string;
  value?: number;
  currency?: string;
  source?: "POSTBACK" | "PIXEL" | "MANUAL";
  metadata?: Record<string, unknown>;
}) {
  const [conversion] = await Promise.all([
    prisma.conversionEvent.create({
      data: {
        linkId: params.linkId,
        clickId: params.clickId,
        value: params.value ?? 0,
        currency: params.currency ?? "USD",
        source: params.source ?? "POSTBACK",
        metadata: params.metadata as any,
      },
    }),
    prisma.affiliateLink.update({
      where: { id: params.linkId },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: params.value ?? 0 },
      },
    }),
  ]);
  return conversion;
}

export function buildTrackingUrl(
  baseUrl: string,
  link: { shortCode: string; destinationUrl?: string; utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null; utmContent?: string | null; utmTerm?: string | null }
) {
  return buildUtmUrl(link.destinationUrl ?? baseUrl, {
    utmSource: link.utmSource ?? undefined,
    utmMedium: link.utmMedium ?? undefined,
    utmCampaign: link.utmCampaign ?? undefined,
    utmContent: link.utmContent ?? undefined,
    utmTerm: link.utmTerm ?? undefined,
  });
}

export function getShortUrl(shortCode: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/go/${shortCode}`;
}
