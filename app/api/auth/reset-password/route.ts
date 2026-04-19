import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, verifyOtpCode } from "@/lib/auth";

const schema = z.object({
  channel: z.enum(["phone", "email"]),
  target: z.string().min(3),
  code: z.string().length(6),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { channel, code, password } = parsed.data;
    const target = channel === "email" ? parsed.data.target.trim().toLowerCase() : parsed.data.target.replace(/\D/g, "");

    const result = await verifyOtpCode({ target, purpose: "reset", code });
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: channel === "email" ? { email: target } : { phone: target },
    });
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    // Invalidate all existing sessions
    await prisma.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Could not reset password" }, { status: 500 });
  }
}
