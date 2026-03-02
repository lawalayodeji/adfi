"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Megaphone, Link2, Zap } from "lucide-react";

const STEPS = [
  {
    title: "Welcome to AdFi!",
    description: "Let's get you set up in 3 quick steps.",
    icon: Zap,
  },
  {
    title: "Connect Google Ads",
    description: "Enter your Google Ads Customer ID so we can sync your campaigns.",
    icon: Megaphone,
  },
  {
    title: "Create Your First Link",
    description: "Generate a trackable affiliate link to start collecting data.",
    icon: Link2,
  },
  {
    title: "You're all set!",
    description: "Head to your dashboard to start tracking performance.",
    icon: CheckCircle,
  },
];

export function OnboardingWizard({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const Icon = current.icon;

  async function handleNext() {
    if (step === 1 && customerId) {
      await fetch("/api/settings/google-ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAdsCustomerId: customerId }),
      });
    }

    if (step === 2 && linkName && linkUrl) {
      setLoading(true);
      await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: linkName,
          destinationUrl: linkUrl,
          utmSource: "adfi",
          utmMedium: "affiliate",
        }),
      });
      setLoading(false);
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/dashboard");
    }
  }

  const canProgress =
    step === 0 ||
    step === 3 ||
    (step === 1) || // Google Ads is optional
    (step === 2 && linkName && linkUrl);

  return (
    <Card className="w-full max-w-md">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{step === 0 ? `Hi ${userName}!` : current.title}</CardTitle>
        <CardDescription>{current.description}</CardDescription>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Google Ads Customer ID</Label>
              <Input
                placeholder="123-456-7890"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can skip this and add it later in Settings.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Link Name</Label>
              <Input
                placeholder="e.g. Homepage Banner"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Destination URL</Label>
              <Input
                type="url"
                placeholder="https://yoursite.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
            <p className="mt-2 text-sm text-green-800 font-medium">
              Your account is ready. Start creating campaigns and tracking conversions!
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        {step > 0 && step < 3 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProgress || loading}
          className="flex-1"
        >
          {loading ? "Saving..." : step === STEPS.length - 1 ? "Go to Dashboard" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
