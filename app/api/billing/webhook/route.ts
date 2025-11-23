import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    return new NextResponse("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;
    if (userId) {
      // Find Pro Plan ID
      // We assume 'Pro' plan exists.
      const proPlan = await prisma.plan.findFirst({ where: { name: "Pro" } });
      if (proPlan) {
        await prisma.user.update({
          where: { id: userId },
          data: { planId: proPlan.id }
        });
      } else {
          console.error("Pro plan not found in DB");
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
