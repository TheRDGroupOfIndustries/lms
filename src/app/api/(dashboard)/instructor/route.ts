import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { z } from "zod";
import { uploadToS3, getSignedS3Url } from "@/utils/s3";

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    role: string;
  };
}

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional(),
  country: z.string(),
  state: z.string(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    whatsapp: z.string().url().optional().or(z.literal(''))
  }).optional().transform(links => {
    if (!links) return null;
    const filteredLinks: Record<string, string> = {};
    for (const [key, value] of Object.entries(links)) {
      if (value) {
        filteredLinks[key] = value;
      }
    }
    return Object.keys(filteredLinks).length > 0 ? filteredLinks : null;
  }),
});

async function handler(req: AuthenticatedRequest) {
  // GET request - Fetch instructor profile and related data
  if (req.method === "GET") {
    try {
      const instructorProfile = await prisma.instructorProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!instructorProfile) {
        return NextResponse.json(
          { error: "Instructor profile not found" },
          { status: 404 }
        );
      }

      // If profile picture exists, generate a signed URL
      if (instructorProfile.profilePicture) {
        instructorProfile.profilePicture = await getSignedS3Url(instructorProfile.profilePicture);
      }

      return NextResponse.json(instructorProfile);
    } catch (error) {
      console.error("Error fetching instructor profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch instructor profile" },
        { status: 500 }
      );
    }
  }

  // PATCH request - Update instructor profile
  if (req.method === "PATCH") {
    try {
      const formData = await req.formData();
      const validatedData = profileSchema.parse(Object.fromEntries(formData));

      // Check if user is authorized to update profile
      if (req.user.role !== "INSTRUCTOR") {
        return NextResponse.json(
          { error: "Unauthorized to update instructor profile" },
          { status: 403 }
        );
      }

      let profilePictureKey;
      const profilePicture = formData.get('profilePicture') as File;
      if (profilePicture) {
        profilePictureKey = await uploadToS3(profilePicture, 'profile-pictures');
      }

      const updatedProfile = await prisma.instructorProfile.update({
        where: { userId: req.user.id },
        data: {
          bio: validatedData.bio,
          country: validatedData.country,
          state: validatedData.state,
          socialLinks: validatedData.socialLinks ?? undefined,
          profilePicture: profilePictureKey,
          user: {
            update: {
              name: `${validatedData.firstName} ${validatedData.lastName}`,
              email: validatedData.email,
            },
          },
        },
      });

      // Generate signed URL for the updated profile picture
      if (updatedProfile.profilePicture) {
        updatedProfile.profilePicture = await getSignedS3Url(updatedProfile.profilePicture);
      }

      return NextResponse.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid profile data", details: error.errors },
          { status: 400 }
        );
      }
      console.error("Error updating instructor profile:", error);
      return NextResponse.json(
        { error: "Failed to update instructor profile" },
        { status: 500 }
      );
    }
  }

  // DELETE request - Remove profile picture
  if (req.method === "DELETE") {
    try {
      const updatedProfile = await prisma.instructorProfile.update({
        where: { userId: req.user.id },
        data: {
          profilePicture: null,
        },
      });

      return NextResponse.json(updatedProfile);
    } catch (error) {
      console.error("Error removing profile picture:", error);
      return NextResponse.json(
        { error: "Failed to remove profile picture" },
        { status: 500 }
      );
    }
  }

  // Handle unsupported HTTP methods
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export const GET = authenticate(handler);
export const PATCH = authenticate(handler);
export const DELETE = authenticate(handler);