"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { getShortUrl } from "@/lib/tracking/links";
import { Copy, Check, ExternalLink } from "lucide-react";

type LinkRow = {
  id: string;
  name: string;
  shortCode: string;
  destinationUrl: string;
  clicks: number;
  conversions: number;
  revenue: number;
  isActive: boolean;
  campaign: { name: string } | null;
};

export function LinksTable({ links }: { links: LinkRow[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyUrl(shortCode: string) {
    const url = getShortUrl(shortCode);
    await navigator.clipboard.writeText(url);
    setCopied(shortCode);
    setTimeout(() => setCopied(null), 2000);
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">No affiliate links yet. Create your first one!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Short URL</th>
                <th className="p-4 text-left font-medium">Campaign</th>
                <th className="p-4 text-left font-medium">Clicks</th>
                <th className="p-4 text-left font-medium">Conversions</th>
                <th className="p-4 text-left font-medium">Revenue</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => {
                const shortUrl = getShortUrl(l.shortCode);
                return (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{l.name}</td>
                    <td className="p-4">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs">{shortUrl}</code>
                    </td>
                    <td className="p-4 text-muted-foreground">{l.campaign?.name ?? "—"}</td>
                    <td className="p-4">{formatNumber(l.clicks)}</td>
                    <td className="p-4">{formatNumber(l.conversions)}</td>
                    <td className="p-4">${l.revenue.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge variant={l.isActive ? "success" : "secondary"}>
                        {l.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyUrl(l.shortCode)}
                          title="Copy short URL"
                        >
                          {copied === l.shortCode ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <a href={l.destinationUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" title="Open destination">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
