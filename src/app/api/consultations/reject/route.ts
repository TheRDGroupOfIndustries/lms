import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { consultationId } = await req.json();

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { instructor: true },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    if (consultation.instructor.userId !== req.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json(updatedConsultation);
  } catch (error) {
    console.error("Consultation rejection error:", error);
    return NextResponse.json(
      { error: "Failed to reject consultation" },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);