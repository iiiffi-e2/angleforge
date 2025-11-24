import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ angleId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { angleId } = await params;

  try {
    // Verify user owns the angle
    const angle = await prisma.angle.findUnique({
      where: { id: angleId }
    });

    if (!angle) {
      return new NextResponse("Angle not found", { status: 404 });
    }

    if (angle.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Fetch all generated content for this angle
    const generatedContent = await prisma.generatedContent.findMany({
      where: { angleId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(generatedContent);

  } catch (error: any) {
    console.error("Error fetching generated content:", error);
    return new NextResponse(
      error.message || "Failed to fetch content",
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ angleId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { angleId } = await params;
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");

  if (!contentId) {
    return new NextResponse("contentId is required", { status: 400 });
  }

  try {
    // Verify user owns the angle
    const angle = await prisma.angle.findUnique({
      where: { id: angleId }
    });

    if (!angle) {
      return new NextResponse("Angle not found", { status: 404 });
    }

    if (angle.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Verify the content belongs to this angle
    const content = await prisma.generatedContent.findUnique({
      where: { id: contentId }
    });

    if (!content || content.angleId !== angleId) {
      return new NextResponse("Content not found", { status: 404 });
    }

    // Delete image file if it exists
    if (content.imagePath) {
      try {
        const { unlink } = await import("fs/promises");
        const { join } = await import("path");
        const imagePath = join(process.cwd(), "public", content.imagePath);
        await unlink(imagePath);
      } catch (error) {
        // If file doesn't exist or can't be deleted, continue with content deletion
        console.error("Error deleting image file:", error);
      }
    }

    // Delete the content record
    await prisma.generatedContent.delete({
      where: { id: contentId }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error deleting generated content:", error);
    return new NextResponse(
      error.message || "Failed to delete content",
      { status: 500 }
    );
  }
}

