import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/middleware/auth";
import { uploadToS3 } from "@/utils/s3";
import { z } from "zod";

interface User {
  id: string;
  role: string;
}

interface AuthenticatedRequest extends NextRequest {
  user: User;
}

// Enhanced validation schema
const courseUploadSchema = z.object({
  title: z
    .string()
    .min(3, "Course title must be at least 3 characters")
    .max(255),
  description: z
    .string()
    .min(10, "Course description must be at least 10 characters"),
  videoUrl: z
    .string()
    .url("Please enter a valid video URL")
    .optional()
    .nullable(),
  price: z.number().min(0, "Price must be 0 or greater"),
  materials: z
    .array(
      z.object({
        title: z.string().min(1, "Material title is required"),
        type: z.enum(["FILE", "LINK"]),
        content: z.string().optional(),
      })
    )
    .optional(),
  language: z.enum(["ENGLISH", "HINDI"]).default("ENGLISH"),
  thumbnailUrl: z.string().url("Please enter a valid thumbnail URL").optional().nullable(),
});

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = req.user;

  if (user.role !== "INSTRUCTOR") {
    return NextResponse.json(
      { error: "Only instructors can upload courses" },
      { status: 403 }
    );
  }

  try {
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Instructor profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    // Parse and validate form data
    const courseData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      videoUrl: formData.get("videoUrl") as string | null,
      price: parseFloat(formData.get("price") as string),
      materials: [] as {
        title: string;
        type: "FILE" | "LINK";
        content?: string;
      }[],
      language: (formData.get("language") as string) || "ENGLISH",
      thumbnailUrl: formData.get("thumbnailUrl") as string | null,
    };

    // Safely parse materials
    const materialsData = formData.getAll("materials") as string[];
    if (materialsData.length > 0) {
      try {
        courseData.materials = materialsData.map((item) => {
          if (typeof item === "string") {
            return JSON.parse(item);
          }
          return item;
        });
      } catch (error) {
        console.error("Error parsing materials:", error);
        return NextResponse.json(
          { error: "Invalid materials data" },
          { status: 400 }
        );
      }
    }

    const validatedData = courseUploadSchema.safeParse(courseData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validatedData.error.errors,
        },
        { status: 400 }
      );
    }

    let videoUrl = validatedData.data.videoUrl || "";
    let videoSource: "YOUTUBE" | "VIMEO" | "UPLOADED" = "UPLOADED";
    let thumbnailUrl = validatedData.data.thumbnailUrl || "";

    const videoFile = formData.get("videoFile") as File | null;
    const thumbnailFile = formData.get("thumbnailFile") as File | null;

    if (videoFile) {
      try {
        const uploadResult = await uploadToS3(videoFile, "course-videos") as unknown as { directUrl: string };
        videoUrl = uploadResult.directUrl;
        videoSource = "UPLOADED";
      } catch (error) {
        console.error("Error uploading video file to S3:", error);
        return NextResponse.json({ 
          error: "Failed to upload video file. Please try again.",
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    } else if (videoUrl) {
      videoSource = videoUrl.includes("youtube.com") ? "YOUTUBE" : 
                    videoUrl.includes("vimeo.com") ? "VIMEO" : "UPLOADED";
    } else {
      return NextResponse.json({ 
        error: "Either videoUrl or videoFile must be provided" 
      }, { status: 400 });
    }

    if (thumbnailFile) {
      try {
        const uploadResult = await uploadToS3(thumbnailFile, "course-thumbnails") as unknown as { directUrl: string };
        thumbnailUrl = uploadResult.directUrl;
      } catch (error) {
        console.error("Error uploading thumbnail file to S3:", error);
        return NextResponse.json({ 
          error: "Failed to upload thumbnail file. Please try again.",
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    }

    // Process materials
    const materialPromises = validatedData.data.materials?.map(async (material) => {
      if (material.type === "FILE") {
        const file = formData.get(`file_${material.title}`) as File;
        if (!file) {
          throw new Error(`File not found for material: ${material.title}`);
        }
        try {
          const fileUrl = await uploadToS3(file, "course-materials") as unknown as { directUrl: string };
          return {
            ...material,
            content: fileUrl.directUrl,
          };
        } catch (error) {
          console.error(
            `Error uploading material file to S3: ${material.title}`,
            error
          );
          throw new Error(
            `Failed to upload material file: ${material.title}`
          );
        }
      }
      return material;
    }) || [];

    let uploadedMaterials;
    try {
      uploadedMaterials = await Promise.all(materialPromises);
    } catch (error) {
      console.error("Error uploading course materials:", error);
      return NextResponse.json(
        {
          error: "Failed to upload course materials. Please try again.",
        },
        { status: 500 }
      );
    }

    // Create course with validated data
    const course = await prisma.course.create({
      data: {
        title: validatedData.data.title,
        description: validatedData.data.description,
        videoUrl: videoUrl,
        videoSource,
        price: validatedData.data.price,
        language: validatedData.data.language,
        thumbnailUrl: thumbnailUrl || undefined, // Use undefined if thumbnailUrl is empty
        instructor: {
          connect: { id: instructorProfile.id },
        },
        materials: {
          create: uploadedMaterials.map((material) => ({
            title: material.title,
            type: material.type,
            content: material.content || "",
          })),
        },
        published: false, // Courses start as unpublished
      },
      include: {
        materials: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Course upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload course. Please try again." },
      { status: 500 }
    );
  }
}

export const POST = authenticate(handler);