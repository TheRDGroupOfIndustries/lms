import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    role: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (req.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          include: { user: { select: { name: true } } },
        },
        enrollments: true,
      },
    });

    const consultations = await prisma.consultation.findMany({
      include: {
        user: { select: { name: true, email: true } },
        instructor: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    const tickets = await prisma.ticket.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const systemConfigs = await prisma.systemConfig.findMany();

    return NextResponse.json({
      users,
      courses,
      consultations,
      tickets,
      systemConfigs,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin dashboard data" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);