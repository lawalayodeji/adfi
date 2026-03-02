import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LinksTable } from "@/components/links/links-table";
import { NewLinkButton } from "@/components/links/new-link-button";

export default async function LinksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [links, campaigns] = await Promise.all([
    prisma.affiliateLink.findMany({
      where: { userId: session.user.id },
      include: { campaign: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaign.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, channelType: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Links</h1>
          <p className="text-muted-foreground">Generate and track your affiliate links</p>
        </div>
        <NewLinkButton campaigns={campaigns} />
      </div>
      <LinksTable links={links} />
    </div>
  );
}
