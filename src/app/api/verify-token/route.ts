import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    if (typeof decoded !== "string" && "userId" in decoded) {
      return NextResponse.json(
        { valid: true, userId: decoded.userId },
        { status: 200 }
      );
    }
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
