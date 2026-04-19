import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./db";

const COOKIE_NAME = "staynp_session";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me-in-prod";
const SESSION_DAYS = 30;
const OTP_TTL_MIN = 10;

export interface JwtPayload {
  sub: string; // user id
  sid: string; // session id
}

// ===== Password =====
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ===== OTP =====
export function generateNumericCode(length = 6): string {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, "0");
}

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code + JWT_SECRET).digest("hex");
}

export async function createOtpCode(opts: {
  userId?: string;
  channel: "phone" | "email";
  target: string;
  purpose: "signup" | "login" | "reset" | "verify";
}): Promise<string> {
  const code = generateNumericCode(6);
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

  // Invalidate previous unconsumed codes for same target+purpose
  await prisma.otpCode.updateMany({
    where: { target: opts.target, purpose: opts.purpose, consumed: false },
    data: { consumed: true },
  });

  await prisma.otpCode.create({
    data: {
      userId: opts.userId,
      channel: opts.channel,
      target: opts.target,
      purpose: opts.purpose,
      codeHash,
      expiresAt,
    },
  });

  return code;
}

export async function verifyOtpCode(opts: {
  target: string;
  purpose: "signup" | "login" | "reset" | "verify";
  code: string;
}): Promise<{ ok: boolean; userId?: string | null; reason?: string }> {
  const record = await prisma.otpCode.findFirst({
    where: { target: opts.target, purpose: opts.purpose, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "No active code — please request a new one" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "Code expired — please request a new one" };
  if (record.attempts >= 5) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
    return { ok: false, reason: "Too many attempts — please request a new code" };
  }

  const hash = hashCode(opts.code);
  if (hash !== record.codeHash) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: record.attempts + 1 } });
    return { ok: false, reason: "Invalid code" };
  }

  await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
  return { ok: true, userId: record.userId };
}

// ===== JWT + Session =====
export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, meta?: { ua?: string; ip?: string }): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: crypto.randomBytes(24).toString("hex"), // placeholder, updated next
      userAgent: meta?.ua,
      ip: meta?.ip,
      expiresAt,
    },
  });

  const token = signJwt({ sub: userId, sid: session.id });
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.session.update({ where: { id: session.id }, data: { tokenHash } });
  return token;
}

export async function destroySessionByToken(token: string): Promise<void> {
  const payload = verifyJwt(token);
  if (!payload) return;
  await prisma.session.deleteMany({ where: { id: payload.sid } });
}

// ===== Cookie helpers =====
export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionTokenFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export function getSessionTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}

// ===== Current user helper =====
export async function getCurrentUser() {
  const token = await getSessionTokenFromCookie();
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({ where: { id: payload.sid } });
  if (!session || session.expiresAt < new Date()) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Not authenticated", 401);
  return user;
}

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
  }
}
