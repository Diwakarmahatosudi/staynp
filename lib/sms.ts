interface SMSPayload {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SMSPayload): Promise<boolean> {
  const token = process.env.AAKASH_SMS_TOKEN;
  if (!token) {
    console.warn("Aakash SMS token not configured, skipping SMS");
    return false;
  }

  try {
    const response = await fetch("https://aakashsms.com/admin/public/sms/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        to,
        text: message,
      }),
    });

    const data = await response.json();
    return data.response_code === 200;
  } catch (error) {
    console.error("SMS send failed:", error);
    return false;
  }
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
