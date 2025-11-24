import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { used, collectionId } = body;

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

  // Build update data
  const updateData: any = {};
  
  if (typeof used === "boolean") {
    updateData.used = used;
    updateData.usedAt = used ? new Date() : null;
  }

  if (collectionId !== undefined) {
    // If collectionId is null, remove from collection
    // Otherwise, verify the collection exists and belongs to the user
    if (collectionId !== null) {
      const collection = await prisma.collection.findUnique({
        where: { id: collectionId }
      });
      
      if (!collection || collection.userId !== session.user.id) {
        return new NextResponse("Collection not found", { status: 404 });
      }
    }
    updateData.collectionId = collectionId;
  }

  // Update the angle
  const updatedAngle = await prisma.angle.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json(updatedAngle);
}


