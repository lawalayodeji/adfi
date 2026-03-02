"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Pause, Play, ExternalLink, Leaf } from "lucide-react";
import { format } from "date-fns";

type Campaign = {
  id: string;
  name: string;
  status: string;
  channelType: string;
  budget: number | null;
  startDate: Date | null;
  _count: { affiliateLinks: number };
};

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  ACTIVE: "success",
  PAUSED: "warning",
  ENDED: "destructive",
  DRAFT: "secondary",
  ARCHIVED: "secondary",
};

type ChannelConfig = { label: string; className: string; icon?: React.ReactNode };

const channelConfig: Record<string, ChannelConfig> = {
  GOOGLE: { label: "Google Ads", className: "text-blue-600 bg-blue-50 border border-blue-200" },
  META: { label: "Meta Ads", className: "text-indigo-600 bg-indigo-50 border border-indigo-200" },
  TIKTOK: { label: "TikTok Ads", className: "text-pink-600 bg-pink-50 border border-pink-200" },
  EMAIL: { label: "Email", className: "text-orange-600 bg-orange-50 border border-orange-200" },
  ORGANIC: {
    label: "Organic",
    className: "text-emerald-700 bg-emerald-50 border border-emerald-300 font-semibold ring-1 ring-emerald-300/60",
    icon: <Leaf className="h-3 w-3" />,
  },
};

function ChannelPill({ channelType }: { channelType: string }) {
  const cfg = channelConfig[channelType] ?? {
    label: channelType,
    className: "text-muted-foreground bg-muted border border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

interface CampaignsTableProps {
  campaigns: Campaign[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const [list, setList] = useState(campaigns);

  async function toggleStatus(id: string, current: string) {
    const next = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const res = await fetch(`/api/campaigns/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setList((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
    }
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No campaigns yet. Create your first one!</p>
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
                <th className="p-4 text-left font-medium">Campaign</th>
                <th className="p-4 text-left font-medium">Channel</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Budget/day</th>
                <th className="p-4 text-left font-medium">Links</th>
                <th className="p-4 text-left font-medium">Started</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b last:border-0 transition-colors ${
                    c.channelType === "ORGANIC"
                      ? "bg-emerald-50/40 hover:bg-emerald-50/80"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <td className="p-4 font-medium">
                    <Link
                      href={`/dashboard/campaigns/${c.id}`}
                      className="hover:underline inline-flex items-center gap-2"
                    >
                      {c.channelType === "ORGANIC" && (
                        <Leaf className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      )}
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <ChannelPill channelType={c.channelType} />
                  </td>
                  <td className="p-4">
                    <Badge variant={statusVariant[c.status] ?? "secondary"}>{c.status}</Badge>
                  </td>
                  <td className="p-4">
                    {c.channelType === "ORGANIC" ? (
                      <span className="text-emerald-600 text-xs font-medium">Free</span>
                    ) : c.budget ? (
                      formatCurrency(c.budget)
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">{c._count.affiliateLinks}</td>
                  <td className="p-4 text-muted-foreground">
                    {c.startDate ? format(new Date(c.startDate), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(c.id, c.status)}
                        title={c.status === "ACTIVE" ? "Pause" : "Activate"}
                      >
                        {c.status === "ACTIVE" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Link href={`/dashboard/campaigns/${c.id}`}>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
