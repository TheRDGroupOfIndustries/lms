import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { z } from 'zod';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

const createTicketSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
});

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;

  try {
    const body = await req.json();
    const validatedData = createTicketSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
    }

    const { title, description } = validatedData.data;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);