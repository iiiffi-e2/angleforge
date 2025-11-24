"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState<"Free" | "Pro" | "">("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSwitchPlan = async () => {
    if (!email && !userId) {
      toast.error("Please provide either an email or user ID");
      return;
    }

    if (!plan) {
      toast.error("Please select a plan");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/switch-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(email && { email }),
          ...(userId && { userId }),
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to switch plan");
        return;
      }

      toast.success(`Plan switched to ${plan} successfully!`);
      setResult(data);
      // Clear form
      setEmail("");
      setUserId("");
      setPlan("");
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin: Plan Switcher</h1>
        <p className="text-muted-foreground">
          Testing tool to switch users between Free and Pro tiers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Switch User Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Or use User ID below
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">User ID (UUID)</Label>
            <Input
              id="userId"
              type="text"
              placeholder="123e4567-e89b-12d3-a456-426614174000"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Target Plan</Label>
            <Select
              value={plan}
              onValueChange={(value) => setPlan(value as "Free" | "Pro")}
            >
              <SelectTrigger id="plan" className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSwitchPlan}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Switching..." : "Switch Plan"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Message:</span> {result.message}
              </p>
              <p>
                <span className="font-semibold">User ID:</span> {result.user.id}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {result.user.email}
              </p>
              <p>
                <span className="font-semibold">Previous Plan:</span>{" "}
                {result.user.previousPlan}
              </p>
              <p>
                <span className="font-semibold">New Plan:</span>{" "}
                <span className="text-green-600 font-bold">
                  {result.user.newPlan}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

