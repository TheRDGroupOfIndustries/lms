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

const userProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  preferredLanguage: z.enum(['ENGLISH', 'HINDI']),
});

const instructorProfileSchema = userProfileSchema.extend({
  bio: z.string().min(10),
  expertise: z.array(z.string()),
  hourlyRate: z.number().positive(),
});

const adminProfileSchema = userProfileSchema.extend({
  permissions: z.array(z.enum(['MANAGE_USERS', 'MANAGE_COURSES', 'MANAGE_CONSULTATIONS', 'MANAGE_PAYMENTS', 'MANAGE_ROLES', 'MANAGE_SYSTEM_CONFIG'])),
});

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "PUT") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;
  const role = user.role;

  if (user.role !== role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    let validatedData;
    let updatedUser;

    switch (role) {
      case 'user':
        validatedData = userProfileSchema.parse(body);
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: validatedData,
        });
        break;

      case 'instructor':
        validatedData = instructorProfileSchema.parse(body);
        const { bio, expertise, hourlyRate, ...userData } = validatedData;
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...userData,
            instructorProfile: {
              upsert: {
                create: { bio, expertise, hourlyRate },
                update: { bio, expertise, hourlyRate },
              },
            },
          },
          include: { instructorProfile: true },
        });
        break;

      case 'admin':
        validatedData = adminProfileSchema.parse(body);
        const { permissions, ...adminData } = validatedData;
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...adminData,
            permissions,
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export const PUT = authenticate(handler);