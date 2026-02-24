import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "queRico2024!";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// In-memory token store (resets on server restart — fine for simple admin)
const validTokens = new Set<string>();

export function isValidToken(token: string): boolean {
  return validTokens.has(token);
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = generateToken();
    validTokens.add(token);

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
