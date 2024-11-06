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
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    });

    const bookedConsultations = await prisma.consultation.findMany({
      where: { userId: user.id },
      include: {
        instructor: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    const freeResources = await prisma.freeResource.findMany({
      include: {
        instructor: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({
      enrolledCourses,
      bookedConsultations,
      freeResources,
    });
  } catch (error) {
    console.error("User dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user dashboard data" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);