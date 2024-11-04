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
    const consultations = await prisma.consultation.findMany({
      where: { userId: user.id },
      include: {
        instructor: {
          include: { user: { select: { name: true, email: true } } },
        },
        payment: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json(consultations);
  } catch (error) {
    console.error("Fetch user consultations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);
