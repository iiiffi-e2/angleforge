import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/account?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/account?canceled=true`,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.id
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error(e);
    return new NextResponse("Stripe error", { status: 500 });
  }
}
