import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/utils/prisma';
import { generateToken } from '@/utils/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedBody = loginSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json({ error: validatedBody.error.errors }, { status: 400 });
    }

    const { email, password } = validatedBody.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = generateToken(user.id);

    // Set the token in the Authorization header
    const response = NextResponse.json({ message: 'Login successful', token: token }, { status: 200 });
    response.headers.set('Authorization', `Bearer ${token}`);

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
