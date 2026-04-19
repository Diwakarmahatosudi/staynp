import nodemailer, { Transporter } from "nodemailer";

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cachedTransport) return cachedTransport;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransport;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const transport = getTransport();
  const from = process.env.SMTP_FROM || "StayNP <no-reply@staynp.local>";

  if (!transport) {
    // Dev fallback — log so devs can copy the code without SMTP setup
    console.log("[email:dev] ─────────────────────────────────────");
    console.log(`[email:dev] To:      ${opts.to}`);
    console.log(`[email:dev] From:    ${from}`);
    console.log(`[email:dev] Subject: ${opts.subject}`);
    console.log(`[email:dev] Body:    ${opts.text ?? opts.html.replace(/<[^>]+>/g, " ").trim()}`);
    console.log("[email:dev] ─────────────────────────────────────");
    return true;
  }

  try {
    await transport.sendMail({ from, ...opts });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

export function otpEmailTemplate(code: string, purpose: "signup" | "login" | "reset" | "verify") {
  const purposeLabel: Record<string, string> = {
    signup: "complete your StayNP signup",
    login: "log in to StayNP",
    reset: "reset your StayNP password",
    verify: "verify your StayNP email",
  };

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FAF7F2;border-radius:16px;color:#1E3A5F;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#C41E3A;border-radius:14px;line-height:56px;color:white;font-size:24px;font-weight:700;">स्</div>
      <h1 style="margin:16px 0 4px;font-size:22px;">Stay<span style="color:#C41E3A;">NP</span></h1>
      <p style="margin:0;color:#64748b;font-size:13px;">नेपालमा बस्नुहोस् — Stay in Nepal</p>
    </div>
    <p style="font-size:15px;line-height:1.6;">Namaste! Use the code below to ${purposeLabel[purpose]}:</p>
    <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
      <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#C41E3A;font-family:ui-monospace,SFMono-Regular,monospace;">${code}</div>
      <p style="margin:8px 0 0;color:#64748b;font-size:12px;">This code expires in 10 minutes.</p>
    </div>
    <p style="font-size:12px;color:#64748b;line-height:1.6;">If you didn't request this, you can safely ignore this email. Never share this code with anyone — StayNP staff will never ask for it.</p>
    <p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">— StayNP • Discover Nepal, Stay Local</p>
  </div>`;

  const text = `Your StayNP verification code is: ${code}\nIt expires in 10 minutes. Never share this code with anyone.`;
  return { html, text };
}

export function bookingConfirmationEmail(opts: {
  guestName: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
}) {
  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAF7F2;border-radius:16px;color:#1E3A5F;">
    <h1 style="color:#2D6A4F;">Booking Confirmed ✓</h1>
    <p>Namaste ${opts.guestName}! Your StayNP booking is confirmed.</p>
    <div style="background:white;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;"><strong>Property:</strong> ${opts.propertyTitle}</p>
      <p style="margin:4px 0;"><strong>Check-in:</strong> ${opts.checkIn}</p>
      <p style="margin:4px 0;"><strong>Check-out:</strong> ${opts.checkOut}</p>
      <p style="margin:4px 0;"><strong>Total:</strong> NPR ${opts.totalPrice.toLocaleString()}</p>
      <p style="margin:4px 0;color:#64748b;font-size:12px;">Booking ID: ${opts.bookingId}</p>
    </div>
    <p>Dhanyabad! Have a wonderful stay.</p>
    <p style="font-size:12px;color:#94a3b8;">— StayNP</p>
  </div>`;
  return { html, text: `Your StayNP booking at ${opts.propertyTitle} is confirmed. Check-in: ${opts.checkIn}, Check-out: ${opts.checkOut}.` };
}
