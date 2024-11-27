import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import prisma from '@/utils/prisma';

type NextRouteHandler = (
  req: AuthenticatedRequest,
  context: { params: { [key: string]: string | string[] } }
) => Promise<NextResponse>;

interface TokenPayload {
  userId: string;
}

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

export const authenticate = (handler: NextRouteHandler) => async (
  req: NextRequest,
  context: { params: { [key: string]: string | string[] } }
) => {
  const token = req.cookies.get('token')?.value;

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

    return handler(authenticatedReq, context);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
};