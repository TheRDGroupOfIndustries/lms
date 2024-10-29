import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/utils/prisma';
import { generateToken } from '@/utils/jwt';

export async function POST(req: NextRequest) {
  const { email, password, name, isGoogleSignUp = false } = await req.json();

  try {
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
