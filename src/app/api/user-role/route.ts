import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/middleware/auth'

async function handler(req: NextRequest) {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
  const authenticatedReq = req as unknown as { user: User };
  const user = authenticatedReq.user

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
}

export const GET = authenticate(handler)