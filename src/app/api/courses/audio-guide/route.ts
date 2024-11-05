import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    );
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { audioGuide: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.audioGuide) {
      return NextResponse.json({ error: "Audio guide not available" }, { status: 404 });
    }

    return NextResponse.json({ audioGuideUrl: course.audioGuide });
  } catch (error) {
    console.error("Fetch audio guide error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio guide" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);