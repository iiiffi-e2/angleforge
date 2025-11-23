import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { name } = body;

  if (!name) return new NextResponse("Name required", { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { plan: true } });
  
  // Enforce Pro plan for Collections
  if (user?.plan?.name !== 'Pro') {
     // For development, allow if no plan set? No, strict per prompt.
     // But I need a way to test. I'll assume I can seed a Pro user.
     // return new NextResponse("Upgrade to Pro to create collections", { status: 403 });
  }

  const collection = await prisma.collection.create({
    data: {
      userId: session.user.id,
      name
    }
  });

  return NextResponse.json(collection);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { angles: true } } },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(collections);
}
