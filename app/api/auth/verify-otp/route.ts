import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyOtpCode, createSession, setSessionCookie, getCurrentUser } from "@/lib/auth";
import { publicUser } from "@/lib/user-dto";

const schema = z.object({
  channel: z.enum(["phone", "email"]),
  target: z.string().min(3),
  code: z.string().length(6),
  purpose: z.enum(["signup", "login", "reset", "verify"]).default("verify"),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { channel, code, purpose } = parsed.data;
    const target = channel === "email" ? parsed.data.target.trim().toLowerCase() : parsed.data.target.replace(/\D/g, "");

    const result = await verifyOtpCode({ target, purpose, code });
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 401 });

    // Locate the account (by code's userId or by target)
    let user = result.userId ? await prisma.user.findUnique({ where: { id: result.userId } }) : null;
    if (!user) {
      user = await prisma.user.findFirst({
        where: channel === "email" ? { email: target } : { phone: target },
      });
    }

    if (!user) {
      // Code was valid but no account — caller should use signup instead
      return NextResponse.json({ ok: true, verified: true, user: null });
    }

    // Mark the channel verified
    await prisma.user.update({
      where: { id: user.id },
      data: channel === "email" ? { emailVerified: true } : { phoneVerified: true },
    });

    // For login/signup flows, start a session
    if (purpose === "login" || purpose === "signup") {
      const ua = req.headers.get("user-agent") ?? undefined;
      const token = await createSession(user.id, { ua });
      await setSessionCookie(token);
    }

    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    return NextResponse.json({ ok: true, verified: true, user: fresh ? publicUser(fresh) : null });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Could not verify code" }, { status: 500 });
  }
}

// GET returns current user — useful for "am I still verifying?"
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user: user ? publicUser(user) : null });
}
