"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface NewCampaignButtonProps {
  hasGoogleAds: boolean;
}

export function NewCampaignButton({ hasGoogleAds }: NewCampaignButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    channelType: "GOOGLE",
    budget: "",
    targetUrl: "",
    goal: "",
  });

  async function handleCreate() {
    if (!form.name) return;
    setLoading(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        budget: form.budget ? parseFloat(form.budget) : null,
        pushToGoogleAds: form.channelType === "GOOGLE" && hasGoogleAds,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Campaign Name</Label>
            <Input
              placeholder="Summer Sale 2024"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Channel</Label>
            <Select value={form.channelType} onValueChange={(v) => setForm({ ...form, channelType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOGLE">Google Ads</SelectItem>
                <SelectItem value="META">Meta Ads</SelectItem>
                <SelectItem value="TIKTOK">TikTok Ads</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="ORGANIC">Organic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Daily Budget (USD)</Label>
            <Input
              type="number"
              placeholder="50"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Landing Page URL</Label>
            <Input
              type="url"
              placeholder="https://yoursite.com/product"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Campaign Goal</Label>
            <Input
              placeholder="e.g. Increase sales by 30%"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            />
          </div>

          {form.channelType === "GOOGLE" && !hasGoogleAds && (
            <p className="rounded-md bg-yellow-50 p-3 text-xs text-yellow-800">
              Connect your Google Ads account in Settings to push campaigns directly to Google.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.name}>
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
