import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// NOTE: This is a testing tool. In production, add proper authentication/authorization.
// Consider restricting this route based on environment variables or admin roles.

const switchPlanSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  userId: z.string().uuid("Invalid user ID").optional(),
  plan: z.enum(["Free", "Pro"], {
    errorMap: () => ({ message: "Plan must be either 'Free' or 'Pro'" }),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = switchPlanSchema.parse(body);

    // Must provide either email or userId
    if (!validatedData.email && !validatedData.userId) {
      return NextResponse.json(
        { error: "Either email or userId must be provided" },
        { status: 400 }
      );
    }

    // Find the target plan
    const targetPlan = await prisma.plan.findFirst({
      where: { name: validatedData.plan },
    });

    if (!targetPlan) {
      return NextResponse.json(
        { error: `Plan '${validatedData.plan}' not found in database` },
        { status: 404 }
      );
    }

    // Find the user by email or userId
    let user;
    if (validatedData.userId) {
      user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        include: { plan: true },
      });
    } else if (validatedData.email) {
      user = await prisma.user.findUnique({
        where: { email: validatedData.email },
        include: { plan: true },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user's plan
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { planId: targetPlan.id },
      include: { plan: true },
    });

    return NextResponse.json({
      message: `User plan switched successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        previousPlan: user.plan.name,
        newPlan: updatedUser.plan.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Switch plan error:", error);
    return NextResponse.json(
      { error: "An error occurred while switching plan" },
      { status: 500 }
    );
  }
}


