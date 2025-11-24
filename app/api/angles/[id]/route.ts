import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { used } = body;

  if (typeof used !== "boolean") {
    return new NextResponse("Invalid request body", { status: 400 });
  }

  // Verify user owns the angle
  const angle = await prisma.angle.findUnique({
    where: { id }
  });

  if (!angle) {
    return new NextResponse("Angle not found", { status: 404 });
  }

  if (angle.userId !== session.user.id) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Update the angle
  const updatedAngle = await prisma.angle.update({
    where: { id },
    data: {
      used,
      usedAt: used ? new Date() : null
    }
  });

  return NextResponse.json(updatedAngle);
}


