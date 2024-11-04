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
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  duration: z.number().int().positive(),
  notes: z.string().optional(),
});

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;

  try {
    const body = await req.json();
    const validatedData = bookConsultationSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
    }

    const { instructorId, scheduledAt, duration, notes } = validatedData.data;

    const instructor = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      include: { availability: true },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    // Check if the scheduled time is within the instructor's availability
    const scheduledDate = new Date(scheduledAt);
    const dayOfWeek = scheduledDate.getDay();
    const startTime = scheduledDate.toTimeString().slice(0, 5);

    const isAvailable = instructor.availability.some(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime <= startTime &&
        slot.endTime > startTime
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Instructor is not available at this time" },
        { status: 400 }
      );
    }

    const price = instructor.hourlyRate * (duration / 60);

    const consultation = await prisma.consultation.create({
      data: {
        userId: user.id,
        instructorId,
        scheduledAt: scheduledDate,
        duration,
        price,
        notes,
      },
    });

    return NextResponse.json(consultation);
  } catch (error) {
    console.error("Consultation booking error:", error);
    return NextResponse.json(
      { error: "Failed to book consultation" },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);