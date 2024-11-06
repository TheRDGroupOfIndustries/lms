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

      const consultations = await prisma.consultation.findMany({
        where: { instructorId: instructorProfile.id },
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      return NextResponse.json(consultations);
    } catch (error) {
      console.error("Fetch consultations error:", error);
      return NextResponse.json(
        { error: "Failed to fetch consultations" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}

export const GET = authenticate(handler);