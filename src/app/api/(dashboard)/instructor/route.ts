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
      include: {
        enrollments: true,
      },
    });

    const consultations = await prisma.consultation.findMany({
      where: { instructorId: instructorProfile.id },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const freeResources = await prisma.freeResource.findMany({
      where: { instructorId: instructorProfile.id },
    });

    return NextResponse.json({
      courses,
      consultations,
      freeResources,
    });
  } catch (error) {
    console.error("Instructor dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch instructor dashboard data" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);