import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "queRico2024!";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret-change-in-production";
const TOKEN_EXPIRY_HOURS = 24;

function base64url(data: Buffer): string {
  return data.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncode(obj: object): string {
  return base64url(Buffer.from(JSON.stringify(obj)));
}

function base64urlDecode(str: string): object {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(padded, "base64").toString());
}

function signJWT(payload: { role: string; iat: number; exp: number }): string {
  const header = base64urlEncode({ alg: "HS256", typ: "JWT" });
  const body = base64urlEncode(payload);
  const signature = base64url(
    crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${signature}`;
}

function verifyJWT(token: string): { role: string; iat: number; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = base64url(
      crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest()
    );

    // Timing-safe comparison
    if (signature.length !== expectedSig.length) return null;
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const payload = base64urlDecode(body) as { role: string; iat: number; exp: number };

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export function isValidToken(token: string): boolean {
  const payload = verifyJWT(token);
  return payload !== null && payload.role === "admin";
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

    const now = Math.floor(Date.now() / 1000);
    const token = signJWT({
      role: "admin",
      iat: now,
      exp: now + TOKEN_EXPIRY_HOURS * 3600,
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
