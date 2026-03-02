"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";

const DATE_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

interface ReportData {
  data: Array<{
    date: string;
    clicks: number;
    conversions: number;
    revenue: number;
    spend: number;
  }>;
  totals: {
    clicks: number;
    conversions: number;
    revenue: number;
    spend: number;
    roas: number;
  };
}

export function ReportsClient() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/overview?days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        setReport(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  function exportCsv() {
    if (!report) return;
    const header = "Date,Clicks,Conversions,Revenue,Spend\n";
    const rows = report.data
      .map((r) => `${r.date},${r.clicks},${r.conversions},${r.revenue},${r.spend}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `adfi-report-${days}d.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {DATE_RANGES.map(({ label, days: d }) => (
            <Button
              key={label}
              size="sm"
              variant={days === d ? "default" : "outline"}
              onClick={() => setDays(d)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      {report && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Clicks", value: formatNumber(report.totals.clicks) },
            { label: "Conversions", value: formatNumber(report.totals.conversions) },
            { label: "Revenue", value: formatCurrency(report.totals.revenue) },
            { label: "Ad Spend", value: formatCurrency(report.totals.spend) },
            { label: "ROAS", value: `${report.totals.roas.toFixed(2)}x` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clicks & Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report?.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="conversions" fill="#22c55e" name="Conversions" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue vs Spend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={report?.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue ($)" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="spend" stroke="#f59e0b" name="Spend ($)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
