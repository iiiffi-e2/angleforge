"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out AngleForge",
    features: [
      "3 daily angle generations",
      "10 angles per generation",
      "Basic angle generation",
      "All channels supported",
    ],
    cta: "Get Started",
    ctaLink: "/auth/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious content creators and marketers",
    features: [
      "20 daily angle generations",
      "50 angles per generation",
      "Generate fully written content",
      "LinkedIn posts, blogs, emails, ads, captions",
      "Organize angles into collections",
      "Export angles in multiple formats",
      "All channels supported",
    ],
    cta: "Upgrade to Pro",
    ctaLink: "/account",
    popular: true,
  },
];

export function PricingTable() {
  return (
    <div className="w-full py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground text-lg">
          Choose the plan that works best for you
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={plan.ctaLink} className="w-full">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

