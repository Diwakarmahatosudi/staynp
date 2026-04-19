import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createOtpCode, createSession, setSessionCookie } from "@/lib/auth";
import { sendEmail, otpEmailTemplate } from "@/lib/email";
import { sendSMS, formatOtpSms } from "@/lib/sms";

const schema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^(97|98)\d{8}$/, "Invalid Nepal mobile number"),
  password: z.string().min(8).max(128),
  isHost: z.boolean().optional(),
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

    const { fullName, email, phone, password, isHost } = parsed.data;
    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // Uniqueness check
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ],
      },
    });
    if (existing) {
      const field = existing.phone === phone ? "phone number" : "email";
      return NextResponse.json(
        { error: `An account with that ${field} already exists. Please log in.` },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        phone,
        email: normalizedEmail,
        passwordHash,
        isHost: !!isHost,
        phoneVerified: false,
        emailVerified: false,
      },
    });

    // Fire off phone OTP so the user can verify immediately
    const code = await createOtpCode({ userId: user.id, channel: "phone", target: phone, purpose: "signup" });
    await sendSMS({ to: phone, message: formatOtpSms(code, "signup") });

    // If email supplied, also send email verification code
    if (normalizedEmail) {
      const emailCode = await createOtpCode({ userId: user.id, channel: "email", target: normalizedEmail, purpose: "verify" });
      const tpl = otpEmailTemplate(emailCode, "verify");
      await sendEmail({ to: normalizedEmail, subject: "Verify your StayNP email", ...tpl });
    }

    // Log the user in with a session — they can verify OTP right after
    const ua = req.headers.get("user-agent") ?? undefined;
    const token = await createSession(user.id, { ua });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: publicUser(user),
        next: "verify_phone",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("signup error:", err);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}

function publicUser(u: { id: string; fullName: string; email: string | null; phone: string | null; isHost: boolean; isVerified: boolean; emailVerified: boolean; phoneVerified: boolean }) {
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    phone: u.phone,
    is_host: u.isHost,
    is_verified: u.isVerified,
    email_verified: u.emailVerified,
    phone_verified: u.phoneVerified,
  };
}
