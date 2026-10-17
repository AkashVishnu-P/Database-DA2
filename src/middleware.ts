import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hospital_erp_super_secret_jwt_key_2026_production_quality"
);

const PUBLIC_API = ["/api/auth/login", "/api/auth/register", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_API.includes(pathname)) return NextResponse.next();
  if (pathname === "/api/departments" && req.method === "GET") return NextResponse.next();

  const token = req.cookies.get("hospital_session")?.value;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {}
  }

  return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
}

export const config = {
  matcher: ["/api/:path*"],
};
