import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { authenticate } from '@/middleware/auth';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    role: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  if (req.method === "POST") {
    try {
      const { courseId } = await req.json();

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          ratings: true,
          instructor: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const averageRating = course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length;

      return NextResponse.json({
        ...course,
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings: course.ratings.length,
      });
    } catch (error) {
      console.error('Error rating course:', error);
      return NextResponse.json({ error: 'Failed to rate course' }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export const POST = authenticate(handler);