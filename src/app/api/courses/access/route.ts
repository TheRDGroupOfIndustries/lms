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

  const user = req.user;
  const courseId = req.nextUrl.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    );
  }

  try {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (enrollment) {
      return NextResponse.json({ hasAccess: true });
    } else {
      return NextResponse.json({ hasAccess: false });
    }
  } catch (error) {
    console.error("Course access check error:", error);
    return NextResponse.json(
      { error: "Failed to check course access" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);
