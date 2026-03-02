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
import { Plus, Leaf } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  channelType: string;
}

export function NewLinkButton({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    destinationUrl: "",
    campaignId: "",
    utmSource: "adfi",
    utmMedium: "affiliate",
    utmCampaign: "",
    utmContent: "",
    utmTerm: "",
  });

  function handleCampaignChange(campaignId: string) {
    const selected = campaigns.find((c) => c.id === campaignId);
    const isOrganic = selected?.channelType === "ORGANIC";
    setForm((prev) => ({
      ...prev,
      campaignId,
      utmMedium: isOrganic ? "organic" : "affiliate",
      utmSource: isOrganic ? "organic" : "adfi",
    }));
  }

  async function handleCreate() {
    if (!form.name || !form.destinationUrl) return;
    setLoading(true);
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  const selectedCampaign = campaigns.find((c) => c.id === form.campaignId);
  const isOrganic = selectedCampaign?.channelType === "ORGANIC";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Affiliate Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Link Name</Label>
            <Input
              placeholder="Homepage Promo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Destination URL</Label>
            <Input
              type="url"
              placeholder="https://yoursite.com"
              value={form.destinationUrl}
              onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Campaign (optional)</Label>
            <Select value={form.campaignId} onValueChange={handleCampaignChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-1.5">
                      {c.channelType === "ORGANIC" && <Leaf className="h-3 w-3 text-emerald-600" />}
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isOrganic && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-xs text-emerald-800">
                Organic campaign detected — UTM parameters auto-set to{" "}
                <code className="font-mono">utm_medium=organic</code>. You can still edit them below.
              </p>
            </div>
          )}

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">UTM Parameters</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Source</Label>
              <Input
                placeholder="adfi"
                value={form.utmSource}
                onChange={(e) => setForm({ ...form, utmSource: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Medium</Label>
              <Input
                placeholder="affiliate"
                value={form.utmMedium}
                className={isOrganic ? "border-emerald-300 focus-visible:ring-emerald-400" : ""}
                onChange={(e) => setForm({ ...form, utmMedium: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Campaign</Label>
              <Input
                placeholder="summer-sale"
                value={form.utmCampaign}
                onChange={(e) => setForm({ ...form, utmCampaign: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Content</Label>
              <Input
                placeholder="banner-top"
                value={form.utmContent}
                onChange={(e) => setForm({ ...form, utmContent: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.name || !form.destinationUrl}>
            {loading ? "Creating..." : "Create Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
