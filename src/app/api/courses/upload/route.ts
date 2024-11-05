import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { uploadToS3 } from "@/utils/s3";
import { translateText } from "@/utils/translate";
import { z } from 'zod';

interface User {
  id: string;
  role: string;
}

interface AuthenticatedRequest extends NextRequest {
  user: User;
}

const courseUploadSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  price: z.number().positive(),
  language: z.enum(['ENGLISH', 'HINDI']),
  videoSource: z.enum(['UPLOADED', 'YOUTUBE', 'VIMEO']),
  videoUrl: z.string().url().optional(),
  materials: z.array(z.object({
    title: z.string().min(1).max(255),
    type: z.string().min(1),
    content: z.string().min(1),
  })),
});

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;

  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const validatedData = courseUploadSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price") as string),
      language: formData.get("language"),
      videoSource: formData.get("videoSource"),
      videoUrl: formData.get("videoUrl"),
      materials: JSON.parse(formData.get("materials") as string),
    });

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 });
    }

    const { title, description, price, language, videoSource, videoUrl, materials } = validatedData.data;

    const videoFile = formData.get("videoFile") as File | null;
    const audioGuideFile = formData.get("audioGuide") as File | null;

    let courseVideoUrl = videoUrl;
    if (videoSource === "UPLOADED" && videoFile) {
      courseVideoUrl = await uploadToS3(videoFile, "course-videos");
    }

    let audioGuideUrl = null;
    if (audioGuideFile) {
      audioGuideUrl = await uploadToS3(audioGuideFile, "audio-guides");
    }

    const translatedTitle = await translateText(title, language === "HINDI" ? "en" : "hi");
    const translatedDescription = await translateText(description, language === "HINDI" ? "en" : "hi");

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Instructor profile not found" },
        { status: 404 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        videoUrl: courseVideoUrl!,
        videoSource,
        price,
        language,
        audioGuide: audioGuideUrl,
        translatedTitle,
        translatedDescription,
        instructor: {
          connect: { id: instructorProfile.id },
        },
        materials: {
          create: materials.map((material) => ({
            title: material.title,
            type: material.type,
            content: material.content,
          })),
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Course upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload course" },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);