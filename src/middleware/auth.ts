import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import prisma from '@/utils/prisma';

type NextRouteHandler = (req: AuthenticatedRequest) => Promise<NextResponse>;

interface TokenPayload {
  userId: string;
}

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

export const authenticate = (handler: NextRouteHandler) => async (req: NextRequest) => {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;

    return handler(authenticatedReq);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
};