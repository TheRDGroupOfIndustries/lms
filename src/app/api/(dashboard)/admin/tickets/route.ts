import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { z } from 'zod';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    role: string;
  };
}

const updateTicketSchema = z.object({
  ticketId: z.string().cuid(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

async function handler(req: AuthenticatedRequest) {
  if (req.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (req.method === "GET") {
    try {
      const tickets = await prisma.ticket.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(tickets);
    } catch (error) {
      console.error("Fetch tickets error:", error);
      return NextResponse.json(
        { error: "Failed to fetch tickets" },
        { status: 500 }
      );
    }
  } else if (req.method === "PUT") {
    try {
      const body = await req.json();
      const validatedData = updateTicketSchema.safeParse(body);

      if (!validatedData.success) {
        return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
      }

      const { ticketId, status } = validatedData.data;

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status },
      });

      return NextResponse.json(updatedTicket);
    } catch (error) {
      console.error("Update ticket error:", error);
      return NextResponse.json(
        { error: "Failed to update ticket" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}

export const GET = authenticate(handler);
export const PUT = authenticate(handler);