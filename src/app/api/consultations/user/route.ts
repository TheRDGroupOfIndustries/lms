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
          include: { 
            user: { 
              select: { 
                name: true, 
                email: true 
              } 
            } 
          },
        },
        payment: {
          select: {
            status: true,
            amount: true
          }
        },
      },
      orderBy: [
        { scheduledAt: "asc" },
        { createdAt: "desc" }
      ],
    });

    // Transform the data to include formatted date and time
    const formattedConsultations = consultations.map(consultation => ({
      ...consultation,
      formattedDate: new Date(consultation.scheduledAt).toLocaleDateString(),
      formattedTime: new Date(consultation.scheduledAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      instructorName: consultation.instructor.user.name,
      instructorEmail: consultation.instructor.user.email,
    }));

    return NextResponse.json(formattedConsultations);
  } catch (error) {
    console.error("Fetch user consultations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);