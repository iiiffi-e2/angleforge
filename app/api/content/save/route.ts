import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isProUser } from "@/lib/planCheck";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

interface SaveContentRequest {
  angleId: string;
  contentType: string;
  content: string;
  imageUrl?: string;
  length?: string;
  customCTA?: string;
}

async function downloadAndSaveImage(imageUrl: string, angleId: string): Promise<string | null> {
  try {
    // Fetch image from DALL-E URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const random = randomBytes(4).toString("hex");
    const filename = `angle-${angleId}-${timestamp}-${random}.png`;
    
    // Create directory if it doesn't exist
    const publicDir = join(process.cwd(), "public", "generated-images");
    try {
      await mkdir(publicDir, { recursive: true });
    } catch (error: any) {
      // Directory might already exist, that's fine
      if (error.code !== "EEXIST") {
        throw error;
      }
    }

    // Save image
    const filePath = join(publicDir, filename);
    await writeFile(filePath, buffer);

    // Return relative path for database storage
    return `/generated-images/${filename}`;
  } catch (error) {
    console.error("Error downloading and saving image:", error);
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Validate Pro tier
  const isPro = await isProUser(session.user.id);
  if (!isPro) {
    return new NextResponse("Content saving is only available for Pro users.", { status: 403 });
  }

  try {
    const body: SaveContentRequest = await req.json();
    
    // Validate required fields
    if (!body.angleId || !body.contentType || !body.content) {
      return new NextResponse("Missing required fields: angleId, contentType, and content are required", { status: 400 });
    }

    // Verify user owns the angle
    const angle = await prisma.angle.findUnique({
      where: { id: body.angleId }
    });

    if (!angle) {
      return new NextResponse("Angle not found", { status: 404 });
    }

    if (angle.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Download and save image if provided
    let imagePath: string | null = null;
    if (body.imageUrl) {
      imagePath = await downloadAndSaveImage(body.imageUrl, body.angleId);
      // Continue even if image download fails - save content without image
    }

    // Create GeneratedContent record
    const savedContent = await prisma.generatedContent.create({
      data: {
        angleId: body.angleId,
        contentType: body.contentType,
        content: body.content,
        imagePath: imagePath,
        length: body.length || null,
        customCTA: body.customCTA || null,
      }
    });

    return NextResponse.json({
      id: savedContent.id,
      contentType: savedContent.contentType,
      content: savedContent.content,
      imagePath: savedContent.imagePath,
      length: savedContent.length,
      customCTA: savedContent.customCTA,
      createdAt: savedContent.createdAt,
    });

  } catch (error: any) {
    console.error("Content save error:", error);
    return new NextResponse(
      error.message || "Failed to save content",
      { status: 500 }
    );
  }
}

