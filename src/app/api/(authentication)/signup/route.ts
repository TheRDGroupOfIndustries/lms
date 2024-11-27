import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";
import { generateToken } from "@/utils/jwt";
import { z } from "zod";

const signupAndFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["USER", "INSTRUCTOR", "ADMIN"]).default("USER"),
  preferredLanguage: z.enum(["ENGLISH", "HINDI"]).optional(),
  bio: z.string().optional(),
  expertise: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupAndFormSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      name,
      role,
      preferredLanguage,
      bio,
      expertise,
    } = validatedData.data;

    // Check for an existing user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate token if user exists
      const token = generateToken(user.id);
      const response = NextResponse.json(
        { message: "SignUp successful", token: token },
        { status: 200 }
      );
      response.headers.set("Authorization", `Bearer ${token}`);
      response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      return response;
    }

    // Hash password if user is signing up with credentials
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Null if Google signup
        name,
        role,
        preferredLanguage: preferredLanguage || "ENGLISH", // Default if not provided
      },
    });

    // If user role is 'INSTRUCTOR', create or update instructor profile
    if (role === "INSTRUCTOR") {
      await prisma.instructorProfile.create({
        data: {
          userId: user.id,
          bio: bio || "",
          expertise: expertise
            ? expertise.split(",").map((item) => item.trim())
            : [],
          hourlyRate: 0,
        },
      });
    }

    // Generate token for the new user
    const token = generateToken(user.id);

    const response = NextResponse.json(
      { message: "SignUp successful", token: token, userId: user.id },
      { status: 200 }
    );
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return response;
  } catch (error) {
    console.error("Error in combined signup and form route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}