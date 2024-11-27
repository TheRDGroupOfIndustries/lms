import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { z } from 'zod';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

const bookConsultationSchema = z.object({
  instructorId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(1).max(8),
  notes: z.string().optional(),
});

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const validatedData = bookConsultationSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
    }

    const { instructorId, scheduledAt, duration, notes } = validatedData.data;

    const instructor = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      include: {
        user: true 
      },
    });

    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const scheduledDate = new Date(scheduledAt);
    const price = instructor.hourlyRate * duration;

    const consultation = await prisma.consultation.create({
      data: {
        userId: req.user.id,
        instructorId,
        scheduledAt: scheduledDate,
        duration,
        notes,
        status: 'PENDING',
        price
      },
      include: {
        instructor: {
          include: {
            user: true
          }
        },
        user: true
      }
    });

    return NextResponse.json({
      consultation,
      message: "Consultation booked successfully."
    });

  } catch (error) {
    console.error("Consultation booking error:", error);
    return NextResponse.json(
      { error: "Failed to book consultation" },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);