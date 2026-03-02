"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface User {
  email: string;
  name: string | null;
  googleAdsCustomerId: string | null;
  developerToken: string | null;
}

export function SettingsClient({ user }: { user: User }) {
  const [customerId, setCustomerId] = useState(user.googleAdsCustomerId ?? "");
  const [devToken, setDevToken] = useState(user.developerToken ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveGoogleAds() {
    setSaving(true);
    await fetch("/api/settings/google-ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleAdsCustomerId: customerId, developerToken: devToken }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <p className="font-medium">{user.name ?? "—"}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="font-medium">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Google Ads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Ads Integration</CardTitle>
              <CardDescription>Connect your Google Ads account to sync campaigns</CardDescription>
            </div>
            {user.googleAdsCustomerId ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" /> Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Not connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Google Ads Customer ID</Label>
            <Input
              placeholder="123-456-7890"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Found in Google Ads → top-right menu. Format: 123-456-7890
            </p>
          </div>
          <div className="space-y-1">
            <Label>Developer Token</Label>
            <Input
              type="password"
              placeholder="Your Google Ads developer token"
              value={devToken}
              onChange={(e) => setDevToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              From Google Ads API Center. Required for API access.
            </p>
          </div>
          <Button onClick={saveGoogleAds} disabled={saving || !customerId}>
            {saving ? "Saving..." : saved ? "Saved!" : "Save Google Ads Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Postback Info */}
      <Card>
        <CardHeader>
          <CardTitle>Postback / Conversion Tracking</CardTitle>
          <CardDescription>
            Use this URL in your affiliate network's conversion settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Postback URL</Label>
            <code className="block rounded-md bg-muted px-3 py-2 text-xs">
              {typeof window !== "undefined" ? window.location.origin : ""}/api/postback?cid=&#123;click_id&#125;&revenue=&#123;revenue&#125;&secret=YOUR_SECRET
            </code>
            <p className="text-xs text-muted-foreground">
              Replace <code>YOUR_SECRET</code> with the value of <code>POSTBACK_SECRET</code> in your .env file.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
