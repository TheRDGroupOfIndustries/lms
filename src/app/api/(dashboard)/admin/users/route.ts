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

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['USER', 'INSTRUCTOR', 'ADMIN']),
});

async function handler(req: AuthenticatedRequest) {
  if (req.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json(users);
    } catch (error) {
      console.error("Fetch users error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }
  } else if (req.method === "POST") {
    try {
      const body = await req.json();
      const validatedData = createUserSchema.safeParse(body);

      if (!validatedData.success) {
        return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
      }

      const { name, email, role } = validatedData.data;

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          role
        },
      });

      return NextResponse.json(newUser);
    } catch (error) {
      console.error("Create user error:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}

export const GET = authenticate(handler);
export const POST = authenticate(handler);