interface SMSPayload {
  to: string;
  message: string;
}

/**
 * Send an SMS via Aakash SMS. In development (or when no token is configured),
 * the message is logged to the server console so you can test the full OTP
 * flow without real SMS credits.
 */
export async function sendSMS({ to, message }: SMSPayload): Promise<boolean> {
  const token = process.env.AAKASH_SMS_TOKEN;

  if (!token) {
    console.log("[sms:dev] ─────────────────────────────────────");
    console.log(`[sms:dev] To:      +977 ${to}`);
    console.log(`[sms:dev] Message: ${message}`);
    console.log("[sms:dev] ─────────────────────────────────────");
    return true; // treat as success so dev flows complete
  }

  try {
    const response = await fetch("https://aakashsms.com/admin/public/sms/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth_token: token, to, text: message }),
    });

    const data = await response.json().catch(() => ({}));
    const ok = response.ok && (data.response_code === 200 || data.error === false);
    if (!ok) console.warn("[sms] aakash responded:", data);
    return ok;
  } catch (error) {
    console.error("[sms] send failed:", error);
    return false;
  }
}

export function formatOtpSms(code: string, purpose: "signup" | "login" | "reset" | "verify"): string {
  const label: Record<string, string> = {
    signup: "StayNP signup code",
    login: "StayNP login code",
    reset: "StayNP password reset code",
    verify: "StayNP verification code",
  };
  return `${label[purpose]}: ${code}. Expires in 10 minutes. Do not share with anyone. — StayNP`;
}

export function formatBookingConfirmationSMS(
  guestName: string,
  propertyTitle: string,
  checkIn: string,
  checkOut: string
): string {
  return (
    `Namaste ${guestName}! Your StayNP booking at "${propertyTitle}" ` +
    `is confirmed. Check-in: ${checkIn}, Check-out: ${checkOut}. ` +
    `Dhanyabad! - StayNP`
  );
}

export function formatBookingNotificationToHost(
  hostName: string,
  guestName: string,
  propertyTitle: string,
  checkIn: string,
  checkOut: string
): string {
  return (
    `Namaste ${hostName}! New booking at "${propertyTitle}" ` +
    `by ${guestName}. Check-in: ${checkIn}, Check-out: ${checkOut}. ` +
    `Please confirm. - StayNP`
  );
}
