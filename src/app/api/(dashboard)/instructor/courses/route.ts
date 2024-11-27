import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    role: string;
  };
}

const querySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
  search: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "students"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

async function handler(req: AuthenticatedRequest) {
  if (req.user.role !== "INSTRUCTOR") {
    return NextResponse.json(
      { error: "Only instructors can access this endpoint" },
      { status: 403 }
    );
  }

  if (req.method === "GET") {
    try {
      const instructorProfile = await prisma.instructorProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!instructorProfile) {
        return NextResponse.json(
          { error: "Instructor profile not found" },
          { status: 404 }
        );
      }

      const searchParams = Object.fromEntries(req.nextUrl.searchParams);
      const validatedQuery = querySchema.safeParse(searchParams);

      if (!validatedQuery.success) {
        return NextResponse.json(
          { 
            error: "Invalid query parameters", 
            details: validatedQuery.error.issues 
          },
          { status: 400 }
        );
      }

      const { page, limit, search, sortBy, sortOrder } = validatedQuery.data;

      const skip = (page - 1) * limit;

      const where: Prisma.CourseWhereInput = {
        instructorId: instructorProfile.id,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const courses = await prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          language: true,
          published: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: [
          sortBy === "students"
            ? {
                enrollments: {
                  _count: sortOrder,
                },
              }
            : {
                [sortBy]: sortOrder,
              },
        ],
        skip,
        take: limit,
      });

      const totalCourses = await prisma.course.count({ where });
      const totalPages = Math.ceil(totalCourses / limit);

      return NextResponse.json({
        courses: courses.map((course) => ({
          ...course,
          studentCount: course._count.enrollments,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCourses,
          hasMore: page < totalPages,
        },
      });
    } catch (error) {
      console.error("Fetch courses error:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}

export const GET = authenticate(handler);