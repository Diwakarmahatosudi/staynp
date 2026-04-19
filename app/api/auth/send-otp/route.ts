import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOtpCode } from "@/lib/auth";
import { sendEmail, otpEmailTemplate } from "@/lib/email";
import { sendSMS, formatOtpSms } from "@/lib/sms";

const schema = z.object({
  channel: z.enum(["phone", "email"]),
  target: z.string().min(3),
  purpose: z.enum(["signup", "login", "reset", "verify"]).default("login"),
});

// Tiny per-target rate limit
const last = new Map<string, number>();
const MIN_MS = 30_000;

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { channel, purpose } = parsed.data;
    const target = channel === "email" ? parsed.data.target.trim().toLowerCase() : parsed.data.target.replace(/\D/g, "");

    if (channel === "phone" && !/^(97|98)\d{8}$/.test(target)) {
      return NextResponse.json({ error: "Invalid Nepal mobile number" }, { status: 400 });
    }
    if (channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const rlKey = `${channel}:${target}:${purpose}`;
    const now = Date.now();
    const prev = last.get(rlKey);
    if (prev && now - prev < MIN_MS) {
      const wait = Math.ceil((MIN_MS - (now - prev)) / 1000);
      return NextResponse.json({ error: `Please wait ${wait}s before requesting another code` }, { status: 429 });
    }
    last.set(rlKey, now);

    // For "login" the account must exist
    let userId: string | undefined;
    if (purpose === "login" || purpose === "reset") {
      const user = await prisma.user.findFirst({
        where: channel === "email" ? { email: target } : { phone: target },
      });
      if (!user) {
        return NextResponse.json({ error: "No account found. Please sign up first." }, { status: 404 });
      }
      userId = user.id;
    }

    const code = await createOtpCode({ userId, channel, target, purpose });

    if (channel === "phone") {
      await sendSMS({ to: target, message: formatOtpSms(code, purpose) });
    } else {
      const tpl = otpEmailTemplate(code, purpose);
      const subjectMap = {
        signup: "Complete your StayNP signup",
        login: "Your StayNP login code",
        reset: "Reset your StayNP password",
        verify: "Verify your StayNP email",
      } as const;
      await sendEmail({ to: target, subject: subjectMap[purpose], ...tpl });
    }

    return NextResponse.json({
      ok: true,
      expires_in: 600,
      // Only exposed in dev so you can test without real SMS/SMTP
      ...(process.env.NODE_ENV === "development" ? { dev_code: code } : {}),
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Could not send code" }, { status: 500 });
  }
}
