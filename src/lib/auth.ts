import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hospital_erp_super_secret_jwt_key_2026_production_quality"
);

export const AUTH_COOKIE_NAME = "hospital_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  avatar?: string | null;
  patientId?: string | null;
  doctorId?: string | null;
  staffId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getAuthContext(req: NextRequest): Promise<SessionPayload | null> {
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  const { default: prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { doctorProfile: true, staffProfile: true, patientProfile: true },
  });
  if (!user) return null;
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.avatar,
    patientId: user.patientProfile?.id || null,
    doctorId: user.doctorProfile?.id || null,
    staffId: user.staffProfile?.id || null,
  };
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return verifySessionToken(authHeader.substring(7));
    }
    return null;
  }
  return verifySessionToken(token);
}
