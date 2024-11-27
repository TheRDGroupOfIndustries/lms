import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getSignedS3Url } from '@/utils/s3';
import { authenticate } from '@/middleware/auth';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    role: string;
  };
}

async function handler(req: AuthenticatedRequest) {
  if (req.method === "GET") {
    try {
      const courses = await prisma.course.findMany({
        include: {
          instructor: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          ratings: true,
        },
      });

      const processedCourses = await Promise.all(courses.map(async (course) => {
        const averageRating = course.ratings.length > 0
          ? course.ratings.reduce((sum, rating) => sum + rating.rating, 0) / course.ratings.length
          : 0;

        return {
          ...course,
          thumbnailUrl: course.thumbnailUrl ? await getSignedS3Url(course.thumbnailUrl) : null,
          averageRating: Number(averageRating.toFixed(1)),
          totalRatings: course.ratings.length,
        };
      }));

      return NextResponse.json(processedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export const GET = authenticate(handler);

