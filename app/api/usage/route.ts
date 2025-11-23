import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  const { currentCount, limit, planName } = await checkRateLimit(session.user.id);

  return NextResponse.json({
    dailyCount: currentCount,
    dailyLimit: limit,
    plan: planName.toLowerCase()
  });
}
