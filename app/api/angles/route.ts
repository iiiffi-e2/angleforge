import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { 
    collectionId, 
    angleName, 
    hook, 
    headline, 
    explanation, 
    visualSuggestion,
    channel,
    audience,
    tone,
    goal,
    sourceTopic,
    used
  } = body;

  if (!angleName || !hook || !sourceTopic) {
     return new NextResponse("Missing required fields", { status: 400 });
  }

  if (collectionId) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId }
    });
    if (!collection || collection.userId !== session.user.id) {
      return new NextResponse("Collection not found", { status: 404 });
    }
  }

  const angle = await prisma.angle.create({
    data: {
      userId: session.user.id,
      collectionId,
      angleName,
      hook,
      headline,
      explanation,
      visualSuggestion,
      channel,
      audience,
      tone,
      goal,
      sourceTopic,
      used: used === true,
      usedAt: used === true ? new Date() : null
    }
  });

  return NextResponse.json(angle);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get("collectionId");

  const where: any = {
    userId: session.user.id
  };

  if (collectionId) {
    where.collectionId = collectionId;
  }

  const angles = await prisma.angle.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(angles);
}
