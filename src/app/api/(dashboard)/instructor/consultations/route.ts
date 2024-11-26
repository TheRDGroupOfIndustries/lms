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

      // Fetch all consultations for the instructor
      const consultations = await prisma.consultation.findMany({
        where: {
          instructorId: instructorProfile.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          payment: {
            select: {
              status: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
      });

      // Transform the data to match the UI requirements
      const formattedConsultations = consultations.map(consultation => ({
        id: consultation.id,
        student: consultation.user.name,
        date: consultation.scheduledAt.toISOString().split('T')[0],
        time: consultation.scheduledAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        status: consultation.status,
        paymentStatus: consultation.payment?.status || 'PENDING',
        duration: consultation.duration,
        meetLink: consultation.meetLink,
        price: consultation.price,
        notes: consultation.notes,
      }));

      return NextResponse.json({
        consultations: formattedConsultations,
      });
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