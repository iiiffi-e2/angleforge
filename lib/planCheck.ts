import { prisma } from "@/lib/db";

export async function isProUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true }
  });

  if (!user || !user.plan) {
    return false;
  }

  return user.plan.name === "Pro";
}

