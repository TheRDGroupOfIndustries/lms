import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  const user = req.user;

  if (req.method === "GET") {
    try {
      const instructorProfile = await prisma.instructorProfile.findUnique({
        where: { userId: user.id },
      });

      if (!instructorProfile) {
        return NextResponse.json(
          { error: "Instructor profile not found" },
          { status: 404 }
        );
      }

      const courses = await prisma.course.findMany({
        where: { instructorId: instructorProfile.id },
      });

      return NextResponse.json(courses);
    } catch (error) {
      console.error("Fetch courses error:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }
  } else if (req.method === "POST") {
    // Course creation logic (already implemented in src/app/api/courses/upload/route.ts)
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}

export const GET = authenticate(handler);
export const POST = authenticate(handler);