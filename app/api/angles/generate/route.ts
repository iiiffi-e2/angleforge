import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateAngles } from "@/lib/openai";
import { checkRateLimit, incrementUsage } from "@/lib/rateLimit";
import { z } from "zod";

const generateSchema = z.object({
  topic: z.string().min(1),
  audience: z.string().optional(),
  channel: z.string(),
  tone: z.string(),
  goal: z.string(),
  competitorUrl: z.string().optional(),
  competitorCopy: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    const { allowed } = await checkRateLimit(session.user.id);
    if (!allowed) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const angles = await generateAngles(validation.data);
    
    await incrementUsage(session.user.id);

    return NextResponse.json({ angles });
  } catch (error) {
    console.error("Generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
