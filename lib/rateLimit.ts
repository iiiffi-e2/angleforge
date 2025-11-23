import { prisma } from "@/lib/db";
import { PLANS } from "@/utils/constants";

export async function checkRateLimit(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true }
  });

  if (!user) throw new Error("User not found");

  // Find usage log for today (or after today's midnight)
  const usage = await prisma.usageLog.findFirst({
    where: {
      userId: userId,
      date: {
        gte: today
      }
    }
  });

  const currentCount = usage?.count || 0;
  // Use DB plan limit if available, else fallback to constant
  const limit = user.plan?.dailyLimit || PLANS.FREE.dailyGenerations;

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
    planName: user.plan?.name || "Free"
  };
}

export async function incrementUsage(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.usageLog.findFirst({
    where: {
      userId: userId,
      date: {
        gte: today
      }
    }
  });

  if (usage) {
    await prisma.usageLog.update({
      where: { id: usage.id },
      data: { count: usage.count + 1 }
    });
  } else {
    await prisma.usageLog.create({
      data: {
        userId,
        date: new Date(), // Using current time is fine as long as we query with gte midnight
        count: 1
      }
    });
  }
}
