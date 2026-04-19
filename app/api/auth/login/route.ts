import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie, verifyOtpCode } from "@/lib/auth";
import { publicUser } from "@/lib/user-dto";

/**
 * Two login modes:
 *   1. { email | phone, password }               — password login
 *   2. { phone | email, code, method: "otp" }    — finalize an OTP-based login
 *      (the OTP is generated via POST /api/auth/send-otp first)
 */
const schema = z.object({
  method: z.enum(["password", "otp"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^(97|98)\d{8}$/).optional(),
  password: z.string().min(1).optional(),
  code: z.string().length(6).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const useOtp = data.method === "otp" || !!data.code;

    if (!data.email && !data.phone) {
      return NextResponse.json({ error: "email or phone is required" }, { status: 400 });
    }

    const isEmail = !!data.email;
    const target = isEmail ? data.email!.trim().toLowerCase() : data.phone!;

    // ----- OTP-based login -----
    if (useOtp) {
      if (!data.code) return NextResponse.json({ error: "code is required" }, { status: 400 });

      const result = await verifyOtpCode({ target, purpose: "login", code: data.code });
      if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 401 });

      const user = await prisma.user.findFirst({
        where: isEmail ? { email: target } : { phone: target },
      });
      if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: isEmail ? { emailVerified: true } : { phoneVerified: true },
      });

      const ua = req.headers.get("user-agent") ?? undefined;
      const token = await createSession(user.id, { ua });
      await setSessionCookie(token);

      return NextResponse.json({ user: publicUser(updated) });
    }

    // ----- Password login -----
    if (!data.password) {
      return NextResponse.json({ error: "password is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: isEmail ? { email: target } : { phone: target },
    });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(data.password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ua = req.headers.get("user-agent") ?? undefined;
    const token = await createSession(user.id, { ua });
    await setSessionCookie(token);

    return NextResponse.json({ user: publicUser(user) });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "Could not log in" }, { status: 500 });
  }
}
