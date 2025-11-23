"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function AccountPage() {
  const [usage, setUsage] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success")) {
        toast.success("Upgrade successful!");
    }
    if (searchParams.get("canceled")) {
        toast.info("Upgrade canceled.");
    }
    fetch("/api/usage").then(res => res.json()).then(setUsage);
  }, [searchParams]);

  const handleUpgrade = async () => {
    try {
        const res = await fetch("/api/billing/checkout", { method: "POST" });
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            toast.error("Failed to start checkout");
        }
    } catch (e) {
        toast.error("Error");
    }
  };

  if (!usage) return <div className="p-8 text-center">Loading...</div>;

  const percent = Math.min(100, (usage.dailyCount / usage.dailyLimit) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      
      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Plan: {usage.plan.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Daily Usage</span>
                    <span>{usage.dailyCount} / {usage.dailyLimit}</span>
                </div>
                <Progress value={percent} />
            </div>
        </CardContent>
        <CardFooter>
            {usage.plan === 'free' && (
                <Button onClick={handleUpgrade} className="w-full">Upgrade to Pro</Button>
            )}
            {usage.plan === 'pro' && (
                <Button variant="outline" className="w-full" disabled>You are on Pro</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
