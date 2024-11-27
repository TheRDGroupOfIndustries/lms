import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { z } from 'zod';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

const startConsultationSchema = z.object({
  startTime: z.string().datetime(),
});

async function handler(
  req: AuthenticatedRequest,
  context: { params: { [key: string]: string | string[] } }
) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const validatedData = startConsultationSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
    }
    const consultationId = context.params.id as string;

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    if (consultation.userId !== req.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    return NextResponse.json({
      consultation: updatedConsultation,
      message: "Consultation started successfully."
    });

  } catch (error) {
    console.error("Consultation start error:", error);
    return NextResponse.json(
      { error: "Failed to start consultation" },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);