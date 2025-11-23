import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { name } = body;

  if (!name) return new NextResponse("Name required", { status: 400 });

  const collection = await prisma.collection.findUnique({
    where: { id: params.id }
  });

  if (!collection || collection.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const updated = await prisma.collection.update({
    where: { id: params.id },
    data: { name }
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  const collection = await prisma.collection.findUnique({
    where: { id: params.id }
  });

  if (!collection || collection.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Angles are deleted via Cascade defined in schema
  await prisma.collection.delete({
    where: { id: params.id }
  });

  return new NextResponse(null, { status: 204 });
}
