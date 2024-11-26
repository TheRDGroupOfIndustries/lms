import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;

  try {
    // Get total study hours (assuming we have a field to track this)
    const totalHours = await prisma.courseEnrollment.aggregate({
      where: { userId: user.id },
      _sum: {
        studyHours: true, // Assuming we have a 'studyHours' field
      },
    });

    // Get course completion stats
    const courseStats = await prisma.courseEnrollment.aggregate({
      where: { userId: user.id },
      _count: {
        _all: true,
        completedAt: true,
      },
    });

    // Get current courses in progress
    const coursesInProgress = await prisma.courseEnrollment.count({
      where: {
        userId: user.id,
        completedAt: null,
      },
    });

    // Get homework/assignments
    const homework = await prisma.courseMaterial.findMany({
      where: {
        course: {
          enrollments: {
            some: {
              userId: user.id,
              completedAt: null,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        content: true,
        course: {
          select: {
            title: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Get enrolled courses with progress
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: {
              include: { 
                user: { 
                  select: { 
                    name: true 
                  } 
                },
              },
            },
          },
        },
      },
    });

    // Get upcoming consultations/lessons
    const upcomingConsultations = await prisma.consultation.findMany({
      where: { 
        userId: user.id,
        scheduledAt: {
          gte: new Date(),
        },
        status: 'APPROVED',
      },
      include: {
        instructor: {
          include: { 
            user: { 
              select: { 
                name: true, 
                email: true 
              } 
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 5,
    });

    // Get available free resources
    const freeResources = await prisma.freeResource.findMany({
      include: {
        instructor: {
          include: { 
            user: { 
              select: { 
                name: true 
              } 
            },
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalHours: Math.round(totalHours._sum.studyHours || 0),
        coursesCompleted: courseStats._count.completedAt,
        totalCourses: courseStats._count._all,
        coursesInProgress,
      },
      homework,
      enrolledCourses,
      upcomingConsultations,
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