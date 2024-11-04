import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/utils/prisma';
import { generateToken } from '@/utils/jwt';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  name: z.string().min(2),
  isGoogleSignUp: z.boolean().default(false),
});

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const validatedBody = signupSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json({ error: validatedBody.error.errors }, { status: 400 });
    }

    const { email, password, name, isGoogleSignUp } = validatedBody.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // User already exists, return token
      const token = generateToken(existingUser.id);
      return NextResponse.json({ token }, { status: 200 });
    }

    let hashedPassword = null;
    if (!isGoogleSignUp && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // null if Google signup
        name,
        role: 'USER',
      },
    });

    const token = generateToken(newUser.id);
    return NextResponse.json({ token }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'An error occurred during signup' }, { status: 500 });
  }
}
