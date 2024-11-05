import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { z } from 'zod';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

const createFreeResourceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  url: z.string().url(),
});

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

      const freeResources = await prisma.freeResource.findMany({
        where: { instructorId: instructorProfile.id },
      });

      return NextResponse.json(freeResources);
    } catch (error) {
      console.error("Fetch free resources error:", error);
      return NextResponse.json(
        { error: "Failed to fetch free resources" },
        { status: 500 }
      );
    }
  } else if (req.method === "POST") {
    try {
      const body = await req.json();
      const validatedData = createFreeResourceSchema.safeParse(body);

      if (!validatedData.success) {
        return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
      }

      const { title, description, url } = validatedData.data;

      const instructorProfile = await prisma.instructorProfile.findUnique({
        where: { userId: user.id },
      });

      if (!instructorProfile) {
        return NextResponse.json(
          { error: "Instructor profile not found" },
          { status: 404 }
        );
      }

      const freeResource = await prisma.freeResource.create({
        data: {
          title,
          description,
          url,
          instructorId: instructorProfile.id,
        },
      });

      return NextResponse.json(freeResource);
    } catch (error) {
      console.error("Create free resource error:", error);
      return NextResponse.json(
        { error: "Failed to create free resource" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}

export const GET = authenticate(handler);
export const POST = authenticate(handler);