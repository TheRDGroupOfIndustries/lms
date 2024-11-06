import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;

  try {
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { userId: user.id },
          { course: { instructor: { userId: user.id } } },
          { consultation: { instructor: { userId: user.id } } },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
        consultation: { select: { scheduledAt: true, duration: true } },
        payuTransaction: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Payment records error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment records" },
      { status: 500 }
    );
  }
}

export const GET = authenticate(handler);
