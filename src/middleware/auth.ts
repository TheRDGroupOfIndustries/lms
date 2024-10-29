import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';

type NextApiHandler = (req: NextRequest, res: NextResponse) => Promise<void>;
interface TokenPayload {
  userId: string;
}

export const authenticate = (handler: NextApiHandler) => async (req: NextRequest, res: NextResponse) => {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token) as TokenPayload;
    (req as NextRequest & { user: TokenPayload }).user = decoded;
    return handler(req, res);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
};
