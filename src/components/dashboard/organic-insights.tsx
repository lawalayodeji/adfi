"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Monitor, Smartphone } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface OrganicData {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  referrers: { source: string; count: number }[];
  devices: { device: string; count: number }[];
}

export function OrganicInsights() {
  const [data, setData] = useState<OrganicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/organic?days=30")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = data?.referrers[0]?.count ?? 1;

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Leaf className="h-4 w-4 text-emerald-700" />
          </div>
          <div>
            <CardTitle className="text-base text-emerald-900">Organic Traffic</CardTitle>
            <CardDescription>Last 30 days — where visitors come from</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.totalClicks === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Leaf className="mb-2 h-8 w-8 text-emerald-300" />
            <p className="text-sm text-muted-foreground">
              No organic traffic yet. Create an Organic campaign and share your links!
            </p>
          </div>
        ) : (
          <>
            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Clicks", value: formatNumber(data.totalClicks) },
                { label: "Conversions", value: formatNumber(data.totalConversions) },
                { label: "Revenue", value: formatCurrency(data.totalRevenue) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-white border border-emerald-100 p-3 text-center shadow-sm">
                  <p className="text-lg font-bold text-emerald-900">{value}</p>
                  <p className="text-xs text-emerald-600">{label}</p>
                </div>
              ))}
            </div>

            {/* Referrer bars */}
            {data.referrers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Top Sources</p>
                {data.referrers.map(({ source, count }) => (
                  <div key={source} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-900">{source}</span>
                      <span className="text-emerald-600">{formatNumber(count)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-emerald-100">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Device split */}
            {data.devices.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-emerald-700">
                {data.devices.map(({ device, count }) => (
                  <div key={device} className="flex items-center gap-1">
                    {device === "mobile" ? (
                      <Smartphone className="h-3.5 w-3.5" />
                    ) : (
                      <Monitor className="h-3.5 w-3.5" />
                    )}
                    <span className="capitalize font-medium">{device}</span>
                    <span className="text-emerald-500">({formatNumber(count)})</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
